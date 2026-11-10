import { z } from 'zod';
import { DEPARTMENT_PATTERN } from './patterns';

// ============================================
// Location of a form (postal code + city), shared by every form asking for it.
// The department and the coordinates are not typed: they come with the chosen
// commune. The app checks for comfort, the server validates again with the
// same schema. Messages come from the caller (the app passes its French texts).
// ============================================

export const LOCATION_LIMITS = {
    postalCodeLength: 5,
    cityMin: 2,
    cityMax: 60,
} as const;

/** Texts shown for each location rule */
export interface LocationErrorMessages {
    postalCode: string;
    city: string;
    cityMax: string;
}

/**
 * Builds the location schema with the given error messages.
 * @param messages user-facing texts for each rule
 * @returns the Zod object schema
 */
export const createLocationSchema = (messages: LocationErrorMessages) =>
    z.object({
        postalCode: z.string().regex(/^\d{5}$/, messages.postalCode),
        city: z
            .string()
            .trim()
            .min(LOCATION_LIMITS.cityMin, messages.city)
            .max(LOCATION_LIMITS.cityMax, messages.cityMax),
        // Filled with the city. Empty = the city was typed but not picked from the list
        department: z.string().regex(DEPARTMENT_PATTERN, messages.city),
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
        // Filled with the commune; null when the city was typed by hand (API unavailable)
        communeCode: z.string().nullable(),
        surfaceHectares: z.number().nullable(),
    });

export type LocationValue = z.output<ReturnType<typeof createLocationSchema>>;

export const EMPTY_LOCATION: LocationValue = {
    postalCode: '',
    city: '',
    department: '',
    latitude: null,
    longitude: null,
    communeCode: null,
    surfaceHectares: null,
};
