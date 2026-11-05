import { z } from 'zod';
import { Strings } from '@/shared/constants';
import type { OfferCondition } from '@/shared/types';

// ============================================
// OFFER SCHEMA (Zod)
// Rules of the "Nouvelle offre" form; the form type is inferred from it.
//
// Security: client-side validation is for comfort only. The server MUST
// validate again (same limits, exported below) and check that the account
// is a professional. Dates are compared by calendar day, in the phone's
// time zone; the server should store them as UTC dates.
// ============================================

export const OFFER_LIMITS = {
    imageMax: 1,
    titleMin: 5,
    titleMax: 60,
    discountMin: 1,
    discountMax: 30,
    descriptionMin: 20,
    descriptionMax: 1000,
    conditionsMax: 3,
} as const;

// Same keys as the OfferCondition union, in display order
export const OFFER_CONDITIONS = [
    'free_quote',
    'fast_response',
    'no_commitment',
    'first_session_free',
] as const satisfies readonly OfferCondition[];

type OfferErrorMessages = typeof Strings.add.offerForm.errors;

/** Midnight of the given day, so two dates compare by calendar day only. */
export const startOfDay = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Builds the offer schema with the given error messages.
 * @param messages user-facing texts for each rule
 * @returns the Zod object schema
 */
export const createOfferSchema = (messages: OfferErrorMessages) =>
    z
        .object({
            image: z.array(z.string()).max(OFFER_LIMITS.imageMax),
            title: z
                .string()
                .trim()
                .min(OFFER_LIMITS.titleMin, messages.titleMin)
                .max(OFFER_LIMITS.titleMax, messages.titleMax),
            discount: z
                .string()
                .trim()
                .min(OFFER_LIMITS.discountMin, messages.discountMin)
                .max(OFFER_LIMITS.discountMax, messages.discountMax),
            categoryId: z.string().min(1, messages.category),
            description: z
                .string()
                .trim()
                .min(OFFER_LIMITS.descriptionMin, messages.descriptionMin)
                .max(OFFER_LIMITS.descriptionMax, messages.descriptionMax),
            startsAt: z.date().nullable(),     // null = starts immediately
            expiresAt: z.date().nullable(),    // null = no end date
            conditions: z.array(z.enum(OFFER_CONDITIONS)).max(OFFER_LIMITS.conditionsMax, messages.conditionsMax),
        })
        // Cross-field date rules (one message per field)
        .superRefine((data, ctx) => {
            const today = startOfDay(new Date());

            if (data.startsAt && startOfDay(data.startsAt) < today) {
                ctx.addIssue({ code: 'custom', path: ['startsAt'], message: messages.startsAtPast });
            }
            if (data.expiresAt && startOfDay(data.expiresAt) < today) {
                ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: messages.expiresAtPast });
                return;
            }
            // Same day allowed: a one-day offer starts and ends on the same date
            if (data.startsAt && data.expiresAt && startOfDay(data.expiresAt) < startOfDay(data.startsAt)) {
                ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: messages.expiresBeforeStart });
            }
        });

export const offerSchema = createOfferSchema(Strings.add.offerForm.errors);

export type OfferFormInput = z.input<typeof offerSchema>;
export type OfferFormOutput = z.output<typeof offerSchema>;
