import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';
import { requestsReducer } from './requests/requestsSlice';
import { mockFavorites } from '@/__mocks__/mockFavorites';
import { mockRequests } from '@/__mocks__/mockRequests';

// ============================================
// Redux store — one slice per domain (favorites, requests; likes, comments,
// auth later). configureStore adds the dev checks (accidental mutation,
// non-serializable values) and Redux DevTools support.
// ============================================

export const store = configureStore({
    reducer: {
        favorites: favoritesReducer,
        requests: requestsReducer,
    },
    // Starting data while there is no backend
    preloadedState: {
        favorites: mockFavorites,
        requests: { items: mockRequests },
    },
});

// Types derived from the store itself, so they follow new slices automatically
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
