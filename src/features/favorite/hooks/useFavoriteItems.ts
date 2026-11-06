import { useMemo } from 'react';
import { Annonce, FavoriteSnapshot, Offer, Professional } from '@/shared/types';
import { useFavoriteEntries } from '@/shared/hooks/useFavorite';
import {
    Availability,
    getAnnonceAvailability,
    getOfferAvailability,
    getProfessionalAvailability,
} from '@/shared/utils/availability';
import { useAnnonces, useOffers } from '@/shared/hooks/usePublications';
import { mockProfessionals } from '@/__mocks__/mockProfessionals';

// ============================================
// useFavoriteItems
// Turns the saved entries (favorites store) into what the Favorites tab shows:
// for each favorite, its availability, the live item when it is available,
// and the copy taken at save time (used by the greyed card otherwise).
// Today the live items come from the mocks and the publications store; with a backend this hook becomes
// the API call (e.g. GET /me/favorites) and the screen does not change.
// ============================================

export type FavoriteListItem<T> =
    | { id: string; status: 'available'; item: T; snapshot: FavoriteSnapshot }
    | { id: string; status: 'ended' | 'deleted'; snapshot: FavoriteSnapshot };

export interface FavoriteItems {
    professionals: FavoriteListItem<Professional>[];
    annonces: FavoriteListItem<Annonce>[];
    offers: FavoriteListItem<Offer>[];
}

/** Index a list by ID */
const indexById = <T extends { id: string }>(items: T[]): Map<string, T> =>
    new Map(items.map((item) => [item.id, item]));

// Module level: mock professionals never change at runtime
const PROFESSIONALS_BY_ID = indexById(mockProfessionals);

/**
 * Keeps the saved order (most recent first). Unavailable favorites stay in
 * place: the user decides to remove them.
 */
const resolve = <T>(
    entries: { id: string; snapshot: FavoriteSnapshot }[],
    byId: Map<string, T>,
    getAvailability: (item: T | undefined) => Availability,
): FavoriteListItem<T>[] =>
    entries.map(({ id, snapshot }) => {
        const item = byId.get(id);
        const status = getAvailability(item);
        return status === 'available' && item
            ? { id, status, item, snapshot }
            : { id, status: status === 'available' ? 'deleted' : status, snapshot };
    });

/**
 * @returns saved professionals, annonces and offers with their availability
 */
export const useFavoriteItems = (): FavoriteItems => {
    const professionalEntries = useFavoriteEntries('professional');
    const annonceEntries = useFavoriteEntries('annonce');
    const offerEntries = useFavoriteEntries('offer');
    // Published items can be saved too: they must resolve like the mocks
    const allAnnonces = useAnnonces();
    const allOffers = useOffers();

    // Recomputed only when a list of entries or of items changes (same array reference otherwise)
    const professionals = useMemo(
        () => resolve(professionalEntries, PROFESSIONALS_BY_ID, getProfessionalAvailability),
        [professionalEntries],
    );
    const annonces = useMemo(
        () => resolve(annonceEntries, indexById(allAnnonces), getAnnonceAvailability),
        [annonceEntries, allAnnonces],
    );
    const offers = useMemo(
        () => resolve(offerEntries, indexById(allOffers), getOfferAvailability),
        [offerEntries, allOffers],
    );

    return { professionals, annonces, offers };
};
