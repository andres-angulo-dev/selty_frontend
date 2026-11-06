import { configureStore } from '@reduxjs/toolkit';
import { favoritesReducer } from './favorites/favoritesSlice';
import { publicationsReducer } from './publications/publicationsSlice';
import { requestsReducer } from './requests/requestsSlice';
import { serviceAreaReducer } from './serviceArea/serviceAreaSlice';
import { mockFavorites } from '@/__mocks__/mockFavorites';
import { mockRequests } from '@/__mocks__/mockRequests';
import { CURRENT_PRO_AREA } from '@/__mocks__/mockSession';

// ============================================
// Redux store — one slice per domain (favorites, publications, requests, serviceArea; likes, comments,
// auth later). configureStore adds the dev checks (accidental mutation,
// non-serializable values) and Redux DevTools support.
// ============================================

export const store = configureStore({
    reducer: {
        favorites: favoritesReducer,
        publications: publicationsReducer,
        requests: requestsReducer,
        serviceArea: serviceAreaReducer,
    },
    // Starting data while there is no backend
    preloadedState: {
        favorites: mockFavorites,
        requests: { items: mockRequests },
        serviceArea: CURRENT_PRO_AREA,
    },
});

// Types derived from the store itself, so they follow new slices automatically
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
