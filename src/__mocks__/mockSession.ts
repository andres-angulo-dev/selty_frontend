import type { RequestAuthor } from '@/shared/types';

// The signed-in user as other features need it (author of a request, "is it
// mine?"). TEMPORARY: the authentication store will provide it. Kept in sync
// by hand with features/profile/data/mockUser (same id 'user_001').
export const CURRENT_USER_ID = 'user_001';

/** Public author card of the current user (first name + initial only) */
export const CURRENT_USER_AUTHOR: RequestAuthor = {
    id: CURRENT_USER_ID,
    firstName: 'Alex',
    lastNameInitial: 'M',
    memberSince: '2025-01-15T00:00:00.000Z',
};

/**
 * Trades of the current user when in professional mode. Kept in sync by hand with
 * features/profile/data/mockProfessionalSummary (profession: 'Plombier').
 * An array: a pro can practise several trades.
 */
export const CURRENT_PRO_TRADE_IDS: string[] = ['trade-plumber'];
