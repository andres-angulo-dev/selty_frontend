import { z } from 'zod';
import { Strings } from '@/shared/constants';
import { DEPARTMENT_PATTERN } from './validation';

// ============================================
// Location of a form (postal code + city), shared by every form asking for it.
// The department and the coordinates are not typed: they come with the chosen
// commune. Client-side checks are for comfort, the server validates again.
// ============================================

export const LOCATION_LIMITS = {
    postalCodeLength: 5,
    cityMin: 2,
    cityMax: 60,
} as const;

type LocationErrorMessages = typeof Strings.locationFields.errors;

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
    });

export const locationSchema = createLocationSchema(Strings.locationFields.errors);

export type LocationValue = z.output<typeof locationSchema>;

export const EMPTY_LOCATION: LocationValue = {
    postalCode: '',
    city: '',
    department: '',
    latitude: null,
    longitude: null,
};
