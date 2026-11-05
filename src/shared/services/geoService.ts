import { z } from 'zod';

// ============================================
// geoService — French communes, via the official API (geo.api.gouv.fr).
// Free, no key, no package: plain fetch.
//
// Privacy: only what the user types (postal code or city name) is sent, never
// a name or an account ID. The API still sees the phone's IP address, like any
// web service: to mention in the privacy policy before release.
// Robustness: an external answer is never trusted, it is validated with Zod.
// ============================================

const BASE_URL = 'https://geo.api.gouv.fr/communes';
const FIELDS = 'nom,code,codesPostaux,codeDepartement,centre';
const TIMEOUT_MS = 8000;
const NAME_RESULTS_LIMIT = 5;

export interface Commune {
    code: string;                    // INSEE code: unique, unlike the name
    name: string;
    department: string;
    postalCodes: string[];
    latitude: number | null;         // Center of the commune, never an address
    longitude: number | null;
}

// Shape expected from the API. `centre` is [longitude, latitude] (GeoJSON order)
const apiCommunesSchema = z.array(
    z.object({
        nom: z.string(),
        code: z.string(),
        codeDepartement: z.string(),
        codesPostaux: z.array(z.string()),
        centre: z.object({ coordinates: z.tuple([z.number(), z.number()]) }).optional(),
    }),
);

/**
 * Calls the API and returns validated communes.
 * @param params query parameters
 * @param signal lets the caller cancel an outdated search
 * @throws when the network fails, times out, or the answer is not as expected
 */
const fetchCommunes = async (params: Record<string, string>, signal: AbortSignal): Promise<Commune[]> => {
    // Own controller so the search stops after TIMEOUT_MS or when the caller cancels it
    const controller = new AbortController();
    const cancel = () => controller.abort();
    const timeout = setTimeout(cancel, TIMEOUT_MS);
    signal.addEventListener('abort', cancel);

    try {
        const query = new URLSearchParams({ ...params, fields: FIELDS }).toString();
        const response = await fetch(`${BASE_URL}?${query}`, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`Geo API error ${response.status}`);
        }

        const communes = apiCommunesSchema.parse(await response.json());
        return communes.map((commune) => ({
            code: commune.code,
            name: commune.nom,
            department: commune.codeDepartement,
            postalCodes: commune.codesPostaux,
            longitude: commune.centre?.coordinates[0] ?? null,
            latitude: commune.centre?.coordinates[1] ?? null,
        }));
    } finally {
        clearTimeout(timeout);
        signal.removeEventListener('abort', cancel);
    }
};

/** Communes of a 5-digit postal code (a code can cover several communes) */
export const searchCommunesByPostalCode = (postalCode: string, signal: AbortSignal): Promise<Commune[]> =>
    fetchCommunes({ codePostal: postalCode }, signal);

/** Communes whose name matches, the most populated first ("saint den" → Saint-Denis...) */
export const searchCommunesByName = (name: string, signal: AbortSignal): Promise<Commune[]> =>
    fetchCommunes({ nom: name, boost: 'population', limit: String(NAME_RESULTS_LIMIT) }, signal);

/**
 * Department of a postal code, used only when the API is unavailable.
 * Overseas: 3 digits (97400 → 974). Corsica: 200-201 → 2A, others → 2B.
 */
export const departmentFromPostalCode = (postalCode: string): string => {
    if (postalCode.startsWith('97') || postalCode.startsWith('98')) {
        return postalCode.slice(0, 3);
    }
    if (postalCode.startsWith('20')) {
        return Number(postalCode.slice(0, 3)) <= 201 ? '2A' : '2B';
    }
    return postalCode.slice(0, 2);
};
