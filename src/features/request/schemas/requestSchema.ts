import { z } from 'zod';
import { Strings } from '@/shared/constants';
import type { RequestUrgency } from '@/shared/types';
import { locationSchema } from '@/shared/utils/locationSchema';

// ============================================
// SERVICE REQUEST SCHEMA (Zod) — "Publier une demande"
// Single source of truth for the form rules; the form types are inferred.
//
// Security: client-side validation is for comfort only. The server MUST
// validate again with the same limits (exported below), check the author is
// an individual account, rate-limit publications (spam) and moderate content
// (public feed: App Store guideline 1.2 requires filtering + reporting).
// ============================================

export const REQUEST_LIMITS = {
    titleMin: 5,
    titleMax: 80,
    descriptionMin: 20,
    descriptionMax: 500,      // Shorter than an annonce: details are given in private
    photosMax: 3,
} as const;

export const REQUEST_URGENCIES = ['urgent', 'this_week', 'this_month', 'flexible'] as const satisfies readonly RequestUrgency[];

type RequestErrorMessages = typeof Strings.request.form.errors;

/**
 * Builds the request schema with the given error messages.
 * @param messages user-facing texts for each rule
 * @returns the Zod object schema
 */
export const createRequestSchema = (messages: RequestErrorMessages) =>
    z.object({
        tradeId: z.string().min(1, messages.trade),
        title: z
            .string()
            .trim()
            .min(REQUEST_LIMITS.titleMin, messages.titleMin)
            .max(REQUEST_LIMITS.titleMax, messages.titleMax),
        description: z
            .string()
            .trim()
            .min(REQUEST_LIMITS.descriptionMin, messages.descriptionMin)
            .max(REQUEST_LIMITS.descriptionMax, messages.descriptionMax),
        // ChipSelector works with arrays; a single choice = array of length 1
        urgency: z.array(z.enum(REQUEST_URGENCIES)).length(1, messages.urgency),
        location: locationSchema,
        // Optional photos (0 to 3)
        photos: z.array(z.string()).max(REQUEST_LIMITS.photosMax, messages.photosMax),
    });

export const requestSchema = createRequestSchema(Strings.request.form.errors);

// What the fields hold while typing / what a successful validation returns
export type RequestFormInput = z.input<typeof requestSchema>;
export type RequestFormOutput = z.output<typeof requestSchema>;
