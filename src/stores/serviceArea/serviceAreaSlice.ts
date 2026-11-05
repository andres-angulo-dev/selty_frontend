import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProServiceArea, ServiceZone } from '@/shared/types';

// ============================================
// serviceArea slice
// Trades and zones of the current professional. The rules (no duplicates,
// limits) live in shared/utils/serviceZones.ts: this slice only stores the result.
// In memory (lost on restart) until the backend.
// ============================================

export const EMPTY_SERVICE_AREA: ProServiceArea = { userId: '', tradeIds: [], zones: [] };

const serviceAreaSlice = createSlice({
    name: 'serviceArea',
    initialState: EMPTY_SERVICE_AREA,
    reducers: {
        setZones: (state, action: PayloadAction<ServiceZone[]>) => {
            state.zones = action.payload;
        },
        setTradeIds: (state, action: PayloadAction<string[]>) => {
            state.tradeIds = action.payload;
        },
    },
});

export const { setZones, setTradeIds } = serviceAreaSlice.actions;
export const serviceAreaReducer = serviceAreaSlice.reducer;

/** The current professional's trades and zones */
export const selectServiceArea = (state: { serviceArea: ProServiceArea }): ProServiceArea => state.serviceArea;
