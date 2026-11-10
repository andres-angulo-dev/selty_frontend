import type { Annonce, Offer } from '@/shared/types';
import type { PublishedAnnonce, PublishedOffer } from '@/stores/publications/publicationsSlice';
import { mockAnnonces } from '@/__mocks__/mockAnnonces';
import { mockCategories } from '@/__mocks__/mockCategories';
import { mockOffers } from '@/__mocks__/mockOffers';
import { mockProfessionals } from '@/__mocks__/mockProfessionals';
import { CURRENT_PROFESSIONAL_ID } from '@/__mocks__/mockSession';

// ============================================
// Publications — from what the store keeps to what the screens read.
// Pure functions. TEMPORARY: the API will return full annonces and offers.
// ============================================

const findProfessional = (id: string) => mockProfessionals.find((professional) => professional.id === id) ?? null;
const findCategory = (id: string) => mockCategories.find((category) => category.id === id) ?? null;

/** Whether a publication belongs to the signed-in professional */
export const isMine = (publication: { professionalId: string }): boolean =>
    publication.professionalId === CURRENT_PROFESSIONAL_ID;

/**
 * @param record An annonce as the store keeps it
 * @returns The annonce the screens expect: real dates, populated relations
 */
export const hydrateAnnonce = (record: PublishedAnnonce): Annonce => ({
    ...record,
    createdAt: new Date(record.createdAt),
    professional: findProfessional(record.professionalId),
    category: findCategory(record.categoryId),
});

/**
 * @param record An offer as the store keeps it
 * @returns The offer the screens expect: real dates, populated relations
 */
export const hydrateOffer = (record: PublishedOffer): Offer => ({
    ...record,
    createdAt: new Date(record.createdAt),
    startsAt: record.startsAt ? new Date(record.startsAt) : null,
    expiresAt: record.expiresAt ? new Date(record.expiresAt) : null,
    professional: findProfessional(record.professionalId),
    category: findCategory(record.categoryId),
});

/**
 * @param records Published annonces, most recent first
 * @returns Every annonce of the app: the published ones first, then the mocks
 */
export const listAnnonces = (records: PublishedAnnonce[]): Annonce[] => [
    ...records.map(hydrateAnnonce),
    ...mockAnnonces,
];

/**
 * @param records Published offers, most recent first
 * @returns Every offer of the app: the published ones first, then the mocks
 */
export const listOffers = (records: PublishedOffer[]): Offer[] => [
    ...records.map(hydrateOffer),
    ...mockOffers,
];
