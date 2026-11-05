import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FavoriteKind, FavoriteSnapshot } from '@/shared/types';

// ============================================
// favorites slice
// What the current user saved, by kind. Each entry keeps:
// - the item ID (the live item comes from mocks today, the API later)
// - when it was saved
// - a small COPY of the item (title, subtitle, image) taken at save time, so
//   a favorite whose item was deleted or ended can still be shown (greyed).
// Kept in memory (lost on app restart) until persistence or the backend.
// ============================================

export interface FavoriteEntry {
    id: string;
    savedAt: string;                 // ISO date — Redux state must stay serializable (no Date object)
    snapshot: FavoriteSnapshot;
}

/** Saved entries per kind, most recently saved first */
export type FavoritesState = Record<FavoriteKind, FavoriteEntry[]>;

export const EMPTY_FAVORITES: FavoritesState = {
    professional: [],
    annonce: [],
    offer: [],
};

interface ToggleFavoritePayload {
    kind: FavoriteKind;
    id: string;
    snapshot?: FavoriteSnapshot;     // Required to ADD; ignored when removing
}

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: EMPTY_FAVORITES,
    reducers: {
        /**
         * Saves the item if it is not saved yet, removes it otherwise.
         * The code looks like a mutation, but Redux Toolkit runs reducers through
         * Immer: it records these changes and builds a NEW state object, the old
         * one is never modified.
         */
        toggleFavorite: (state, action: PayloadAction<ToggleFavoritePayload>) => {
            const { kind, id, snapshot } = action.payload;
            const entries = state[kind];
            const index = entries.findIndex((entry) => entry.id === id);

            if (index !== -1) {
                entries.splice(index, 1);
                return;
            }
            // Adding needs the copy: without it a deleted item could not be shown
            if (!snapshot) {
                return;
            }
            // Newest first, the list shows it on top
            entries.unshift({ id, savedAt: new Date().toISOString(), snapshot });
        },
    },
});

export const { toggleFavorite } = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;

// --- Selectors: the only way screens read this slice ---

/** Shape of the root state seen by these selectors (avoids importing the store here) */
interface StateWithFavorites {
    favorites: FavoritesState;
}

/** True when the item is saved by the current user */
export const selectIsFavorite = (state: StateWithFavorites, kind: FavoriteKind, id: string): boolean =>
    state.favorites[kind].some((entry) => entry.id === id);

/** Saved entries of one kind, most recent first (same array reference while unchanged) */
export const selectFavoriteEntries = (state: StateWithFavorites, kind: FavoriteKind): FavoriteEntry[] =>
    state.favorites[kind];
