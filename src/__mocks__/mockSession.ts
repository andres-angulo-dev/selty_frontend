import type { ProServiceArea, RequestAuthor } from '@/shared/types';

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
 * Trades and zones of the current user in professional mode, at app start.
 * One account, two modes: the same user can be an individual and a professional.
 */
export const CURRENT_PRO_AREA: ProServiceArea = {
    userId: CURRENT_USER_ID,
    tradeIds: ['trade-plumber'],
    zones: [
        {
            kind: 'city',
            id: 'city-77288',
            communeCode: '77288',
            city: 'Melun',
            department: '77',
            latitude: 48.5421,
            longitude: 2.6552,
            cityRadiusKm: 1.6,
            radiusKm: 20,
        },
        { kind: 'department', id: 'department-77', code: '77', name: 'Seine-et-Marne' },
        { kind: 'department', id: 'department-75', code: '75', name: 'Paris' },
    ],
};
