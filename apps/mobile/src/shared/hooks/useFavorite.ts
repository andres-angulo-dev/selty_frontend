import { useCallback } from 'react';
import { FavoriteKind, FavoriteSnapshot } from '@/shared/types';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
    FavoriteEntry,
    selectFavoriteEntries,
    selectIsFavorite,
    toggleFavorite,
} from '@/stores/favorites/favoritesSlice';

// ============================================
// Favorites hooks — screens use these and never touch Redux directly.
// If storage changes (persistence, API), only this file and the slice change.
// ============================================

/**
 * Saved state of one item + a toggle.
 * The component re-renders only when THIS item's saved state changes.
 * @param kind     type of item ('professional' | 'annonce' | 'offer')
 * @param id       item ID
 * @param snapshot copy stored when saving (build it with shared/utils/favoriteSnapshot).
 *                 Undefined while the item is not loaded: saving is then ignored.
 * @returns isFavorite, toggle
 */
export const useFavorite = (
    kind: FavoriteKind,
    id: string,
    snapshot?: FavoriteSnapshot,
): { isFavorite: boolean; toggle: () => void } => {
    const isFavorite = useAppSelector((state) => selectIsFavorite(state, kind, id));
    const dispatch = useAppDispatch();

    const toggle = useCallback(() => {
        dispatch(toggleFavorite({ kind, id, snapshot }));
    }, [dispatch, kind, id, snapshot]);

    return { isFavorite, toggle };
};

/**
 * Saved entries of one kind, most recent first (used by the Favorites tab).
 * @param kind type of item
 * @returns entries { id, savedAt, snapshot }
 */
export const useFavoriteEntries = (kind: FavoriteKind): FavoriteEntry[] =>
    useAppSelector((state) => selectFavoriteEntries(state, kind));

/**
 * Removes a saved item from a list, where one hook per item is not possible
 * (hooks cannot be called inside a loop / renderItem). An item already saved
 * is removed, so no snapshot is needed.
 * @returns remove(kind, id)
 */
export const useRemoveFavorite = (): ((kind: FavoriteKind, id: string) => void) => {
    const dispatch = useAppDispatch();
    return useCallback((kind: FavoriteKind, id: string) => {
        dispatch(toggleFavorite({ kind, id }));
    }, [dispatch]);
};
