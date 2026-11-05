import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServiceRequest } from '@/shared/types';

// ============================================
// requests slice
// Service requests shown in the feed. Today: the mocks + what the current
// user publishes, in memory (lost on restart). With a backend this slice
// becomes a cache of the API (or is replaced by React Query).
// ============================================

export interface RequestsState {
    items: ServiceRequest[];             // Most recent first
}

export const EMPTY_REQUESTS: RequestsState = { items: [] };

const requestsSlice = createSlice({
    name: 'requests',
    initialState: EMPTY_REQUESTS,
    reducers: {
        /** A request just published by the current user goes on top of the feed */
        addRequest: (state, action: PayloadAction<ServiceRequest>) => {
            state.items.unshift(action.payload);
        },

        /**
         * The author found a pro: the request leaves the open feed.
         * Security: the backend must check that the caller IS the author.
         */
        markRequestFulfilled: (state, action: PayloadAction<{ id: string }>) => {
            const request = state.items.find((item) => item.id === action.payload.id);
            if (request) {
                request.status = 'fulfilled';
            }
        },
    },
});

export const { addRequest, markRequestFulfilled } = requestsSlice.actions;
export const requestsReducer = requestsSlice.reducer;

// --- Selectors ---

interface StateWithRequests {
    requests: RequestsState;
}

/** Every request, most recent first (same array reference while unchanged) */
export const selectRequests = (state: StateWithRequests): ServiceRequest[] => state.requests.items;

/** One request by ID */
export const selectRequestById = (state: StateWithRequests, id: string): ServiceRequest | undefined =>
    state.requests.items.find((item) => item.id === id);
