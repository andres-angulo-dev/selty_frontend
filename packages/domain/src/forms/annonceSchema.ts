import { z } from 'zod';
import { createLocationSchema, type LocationErrorMessages } from './locationSchema';
import type { AnnoncePriceType } from '../types';

// ============================================
// ANNONCE SCHEMA (Zod)
// Single source of truth for the "Nouvelle annonce" rules. The form type is
// inferred from it, so the rules and the TypeScript type can never drift.
//
// Security: this client-side validation is for comfort only (instant
// feedback). The server MUST validate again with the same rules and check
// that the account is a professional. The limits are exported and the
// schema is built from a messages object so the backend can reuse both.
// ============================================

export const ANNONCE_LIMITS = {
    photosMin: 1,
    photosMax: 6,
    titleMin: 5,
    titleMax: 80,
    descriptionMin: 20,
    descriptionMax: 1000,
    priceMin: 1,
    priceMax: 100_000,
    priceInputMax: 9,       // Characters in the amount field ("100000,00")
} as const;

export const ANNONCE_PRICE_TYPES = ['fixed', 'quote', 'free'] as const satisfies readonly AnnoncePriceType[];

/** Texts shown for each annonce rule */
export interface AnnonceErrorMessages {
    photosMin: string;
    photosMax: string;
    titleMin: string;
    titleMax: string;
    trade: string;
    descriptionMin: string;
    descriptionMax: string;
    priceType: string;
    priceRequired: string;
    priceInvalid: string;
    priceRange: string;
}

// Up to 6 digits, then optionally a comma or dot and 1-2 decimals: "80", "49,90"
const PRICE_PATTERN = /^\d{1,6}([.,]\d{1,2})?$/;

/**
 * Converts the amount typed by the user to a number of euros.
 * @param text raw field value ("49,90")
 * @returns the amount (49.9), or null when the text is not a valid amount
 */
export const parsePriceInput = (text: string): number | null => {
    const trimmed = text.trim();
    return PRICE_PATTERN.test(trimmed) ? Number(trimmed.replace(',', '.')) : null;
};

/**
 * Builds the annonce schema with the given error messages.
 * @param messages user-facing texts for each rule
 * @param locationMessages texts of the place fields (same as every form asking for a place)
 * @returns the Zod object schema
 */
export const createAnnonceSchema = (messages: AnnonceErrorMessages, locationMessages: LocationErrorMessages) =>
    z.object({
        photos: z
            .array(z.string())
            .min(ANNONCE_LIMITS.photosMin, messages.photosMin)
            .max(ANNONCE_LIMITS.photosMax, messages.photosMax),
        title: z
            .string()
            .trim()
            .min(ANNONCE_LIMITS.titleMin, messages.titleMin)
            .max(ANNONCE_LIMITS.titleMax, messages.titleMax),
        // Security: the form only offers the pro's trades, but this is comfort only.
        // TODO(backend): the server must refuse a tradeId outside the pro's trades.
        tradeId: z.string().min(1, messages.trade),
        description: z
            .string()
            .trim()
            .min(ANNONCE_LIMITS.descriptionMin, messages.descriptionMin)
            .max(ANNONCE_LIMITS.descriptionMax, messages.descriptionMax),
        location: createLocationSchema(locationMessages),
        // Empty array in the form until a chip is chosen, hence the array shape
        priceType: z.array(z.enum(ANNONCE_PRICE_TYPES)).length(1, messages.priceType),
        // Text while typing; checked below only when "Prix fixe" is chosen
        price: z.string(),
    })
    // Cross-field rule: the amount is required and checked for a fixed price only
    .superRefine((data, ctx) => {
        if (data.priceType[0] !== 'fixed') {
            return;
        }
        if (data.price.trim() === '') {
            ctx.addIssue({ code: 'custom', path: ['price'], message: messages.priceRequired });
            return;
        }
        const amount = parsePriceInput(data.price);
        if (amount === null) {
            ctx.addIssue({ code: 'custom', path: ['price'], message: messages.priceInvalid });
            return;
        }
        if (amount < ANNONCE_LIMITS.priceMin || amount > ANNONCE_LIMITS.priceMax) {
            ctx.addIssue({ code: 'custom', path: ['price'], message: messages.priceRange });
        }
    });

// What the fields hold while typing / what a successful validation returns
export type AnnonceFormInput = z.input<ReturnType<typeof createAnnonceSchema>>;
export type AnnonceFormOutput = z.output<ReturnType<typeof createAnnonceSchema>>;
