import type { RequestAuthor, RequestStatus, ServiceRequest } from '@/shared/types';
import { REQUEST_RULES } from '@/shared/constants/requestRules';

// ============================================
// Service request helpers (status, lifetime, public author name)
// ============================================

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Status shown to users. "Expired" is computed, never stored: a stored status
 * would need a job to flip it at the right time, a date comparison cannot drift.
 * @param request the request
 * @param now     current time (injectable for tests)
 */
export const getRequestStatus = (request: ServiceRequest, now: Date = new Date()): RequestStatus => {
    if (request.status === 'fulfilled') {
        return 'fulfilled';
    }
    return new Date(request.expiresAt).getTime() <= now.getTime() ? 'expired' : 'open';
};

/**
 * Expiry date of a request published at `createdAt`.
 * @returns ISO date, createdAt + the lifetime set in REQUEST_RULES
 */
export const computeRequestExpiry = (createdAt: Date): string =>
    new Date(createdAt.getTime() + REQUEST_RULES.lifetimeDays * DAY_MS).toISOString();

/**
 * Whole days left before expiry (0 when it expires today or already did).
 */
export const getDaysUntilExpiry = (request: ServiceRequest, now: Date = new Date()): number =>
    Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - now.getTime()) / DAY_MS));

/** Public author name: "Sophie M." (never the full last name) */
export const formatAuthorName = (author: RequestAuthor): string =>
    `${author.firstName} ${author.lastNameInitial}.`;
