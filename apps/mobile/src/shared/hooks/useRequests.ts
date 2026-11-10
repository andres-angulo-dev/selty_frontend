import { useCallback } from 'react';
import type { ServiceRequest } from '@/shared/types';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
    addRequest,
    markRequestFulfilled,
    selectRequestById,
    selectRequests,
} from '@/stores/requests/requestsSlice';

// ============================================
// Service request hooks — screens (feed, form, detail, "Mes demandes")
// use these and never touch Redux directly.
// ============================================

/** Every request, most recent first */
export const useRequests = (): ServiceRequest[] => useAppSelector(selectRequests);

/** One request by ID (undefined when unknown) */
export const useRequest = (id: string): ServiceRequest | undefined =>
    useAppSelector((state) => selectRequestById(state, id));

/**
 * Actions on requests.
 * @returns publish(request), markFulfilled(id)
 */
export const useRequestActions = () => {
    const dispatch = useAppDispatch();

    const publish = useCallback((request: ServiceRequest) => {
        dispatch(addRequest(request));
    }, [dispatch]);

    const markFulfilled = useCallback((id: string) => {
        dispatch(markRequestFulfilled({ id }));
    }, [dispatch]);

    return { publish, markFulfilled };
};
