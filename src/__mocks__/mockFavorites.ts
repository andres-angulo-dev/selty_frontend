import type { FavoritesState } from '@/stores/favorites/favoritesSlice';
import type { FavoriteSnapshot } from '@/shared/types';
import { mockProfessionals } from './mockProfessionals';
import { mockAnnonces } from './mockAnnonces';
import { mockOffers } from './mockOffers';
import {
    snapshotFromAnnonce,
    snapshotFromOffer,
    snapshotFromProfessional,
} from '@/shared/utils/favoriteSnapshot';

// Favorites saved at app start, so the Favorites tab can be tested right away
// (including the "no longer available" cards). Empty the arrays to start with
// no favorites. Replaced by the API later.

/** Copy of an existing mock item, or a placeholder if the mock was removed */
const copyOf = <T extends { id: string }>(
    items: T[],
    id: string,
    toSnapshot: (item: T) => FavoriteSnapshot,
): FavoriteSnapshot => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? toSnapshot(item) : { title: id };
};

export const mockFavorites: FavoritesState = {
    professional: [
        { id: 'pro-1', savedAt: '2026-10-30T10:00:00.000Z', snapshot: copyOf(mockProfessionals, 'pro-1', snapshotFromProfessional) },
    ],
    annonce: [
        { id: 'annonce-2', savedAt: '2026-10-31T09:00:00.000Z', snapshot: copyOf(mockAnnonces, 'annonce-2', snapshotFromAnnonce) },
        // Test case "deleted": no annonce has this ID, only the copy remains
        {
            id: 'annonce-deleted-1',
            savedAt: '2026-09-12T18:30:00.000Z',
            snapshot: {
                title: 'Pose de parquet flottant',
                subtitle: 'Savigny-le-Temple (77)',
                imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&h=500&fit=crop&q=80',
            },
        },
    ],
    offer: [
        { id: 'offer-1', savedAt: '2026-10-29T08:00:00.000Z', snapshot: copyOf(mockOffers, 'offer-1', snapshotFromOffer) },
        // Test case "ended": offer-4 expired on 2025-05-31 in the mocks
        { id: 'offer-4', savedAt: '2025-04-02T12:00:00.000Z', snapshot: copyOf(mockOffers, 'offer-4', snapshotFromOffer) },
    ],
};
