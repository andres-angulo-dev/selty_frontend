import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Annonce, Offer } from '@/shared/types';

// ============================================
// publications slice
// What the signed-in professional publishes, in memory (lost on restart).
// Redux only keeps serializable values, so dates are ISO strings, and the
// professional and category are stored by ID only: shared/utils/publications.ts
// turns these records back into normal annonces and offers for the screens.
// With a backend this slice becomes a cache of the API.
// ============================================

export interface PublishedAnnonce extends Omit<Annonce, 'professional' | 'category' | 'createdAt'> {
    createdAt: string;
}

export interface PublishedOffer
    extends Omit<Offer, 'professional' | 'category' | 'createdAt' | 'startsAt' | 'expiresAt'> {
    createdAt: string;
    startsAt: string | null;
    expiresAt: string | null;
}

export interface PublicationsState {
    annonces: PublishedAnnonce[];        // Most recent first
    offers: PublishedOffer[];            // Most recent first
}

const initialState: PublicationsState = { annonces: [], offers: [] };

const publicationsSlice = createSlice({
    name: 'publications',
    initialState,
    reducers: {
        /** Security: the backend must check the caller is a professional of this trade */
        addAnnonce: (state, action: PayloadAction<PublishedAnnonce>) => {
            state.annonces.unshift(action.payload);
        },
        /** Security: the backend must check the caller is a professional of this trade */
        addOffer: (state, action: PayloadAction<PublishedOffer>) => {
            state.offers.unshift(action.payload);
        },
    },
});

export const { addAnnonce, addOffer } = publicationsSlice.actions;
export const publicationsReducer = publicationsSlice.reducer;

// --- Selectors ---

interface StateWithPublications {
    publications: PublicationsState;
}

export const selectPublishedAnnonces = (state: StateWithPublications) => state.publications.annonces;
export const selectPublishedOffers = (state: StateWithPublications) => state.publications.offers;
