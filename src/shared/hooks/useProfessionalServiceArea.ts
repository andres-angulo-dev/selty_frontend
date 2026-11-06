import { CURRENT_PROFESSIONAL_ID } from '@/__mocks__/mockSession';
import type { ProServiceArea, Professional } from '@/shared/types';
import { useServiceArea } from '@/shared/hooks/useServiceArea';

type PublicServiceArea = Pick<ProServiceArea, 'tradeIds' | 'zones'>;

// Shared empty result: a new object at each render would defeat memoization
const EMPTY_AREA: PublicServiceArea = { tradeIds: [], zones: [] };

/**
 * Trades and zones to show for a professional. The signed-in professional's page
 * reads the store, so a change in "Mes zones" shows at once without a restart.
 * TEMPORARY: the API will return the same data for everyone.
 *
 * @param professional The displayed professional, or null when there is none
 * @returns Their trades and zones (empty when there is no professional)
 */
export const useProfessionalServiceArea = (professional: Professional | null): PublicServiceArea => {
    // Always called, whatever the branch below: rules of hooks
    const ownArea = useServiceArea();

    if (!professional) return EMPTY_AREA;
    return professional.id === CURRENT_PROFESSIONAL_ID ? ownArea : professional;
};
