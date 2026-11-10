import { useCallback } from 'react';
import type { ProServiceArea, ServiceZone } from '@/shared/types';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { selectServiceArea, setTradeIds, setZones } from '@/stores/serviceArea/serviceAreaSlice';
import { AddZoneResult, addZone, RemoveTradeResult, removeTrade, removeZone } from '@/shared/utils/serviceZones';

// ============================================
// Service area hooks — screens use these and never touch Redux directly.
// Each action applies the rules, stores the result if it is accepted, and
// returns the outcome so the screen can show the right message.
// ============================================

/** Trades and zones of the current professional */
export const useServiceArea = (): ProServiceArea => useAppSelector(selectServiceArea);

export const useServiceAreaActions = () => {
    const area = useServiceArea();
    const dispatch = useAppDispatch();

    const add = useCallback((zone: ServiceZone): AddZoneResult => {
        const result = addZone(area.zones, zone);
        if (result.outcome === 'added' || result.outcome === 'updated') {
            dispatch(setZones(result.zones));
        }
        return result;
    }, [area.zones, dispatch]);

    /** @returns false when it is the last zone: a professional keeps at least one */
    const remove = useCallback((zoneId: string): boolean => {
        const zones = removeZone(area.zones, zoneId);
        if (!zones) {
            return false;
        }
        dispatch(setZones(zones));
        return true;
    }, [area.zones, dispatch]);

    const addTrade = useCallback((tradeId: string) => {
        if (!area.tradeIds.includes(tradeId)) {
            dispatch(setTradeIds([...area.tradeIds, tradeId]));
        }
    }, [area.tradeIds, dispatch]);

    const dropTrade = useCallback((tradeId: string, isRemoteCapable: (id: string) => boolean): RemoveTradeResult => {
        const result = removeTrade(area, tradeId, isRemoteCapable);
        if (result.outcome === 'removed') {
            dispatch(setTradeIds(result.area.tradeIds));
            dispatch(setZones(result.area.zones));
        }
        return result;
    }, [area, dispatch]);

    return { addZone: add, removeZone: remove, addTrade, removeTrade: dropTrade };
};
