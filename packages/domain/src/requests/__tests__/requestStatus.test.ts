import { describe, expect, it } from 'vitest';
import type { RequestAuthor, ServiceRequest } from '../../types';
import {
    computeRequestExpiry,
    formatAuthorName,
    getDaysUntilExpiry,
    getRequestStatus,
} from '../requestStatus';
import { REQUEST_RULES } from '../requestRules';

const now = new Date('2026-11-06T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS).toISOString();

const request = (over: Partial<ServiceRequest>) =>
    ({ status: 'open', expiresAt: inDays(10), ...over }) as ServiceRequest;

describe('getRequestStatus', () => {
    it('is open before its expiry', () => {
        expect(getRequestStatus(request({}), now)).toBe('open');
    });

    it('expires by itself, at the exact expiry date', () => {
        expect(getRequestStatus(request({ expiresAt: now.toISOString() }), now)).toBe('expired');
        expect(getRequestStatus(request({ expiresAt: inDays(-1) }), now)).toBe('expired');
    });

    it('stays fulfilled, even after the expiry date', () => {
        expect(getRequestStatus(request({ status: 'fulfilled', expiresAt: inDays(-1) }), now)).toBe('fulfilled');
    });
});

describe('computeRequestExpiry', () => {
    it('adds the lifetime set in the rules', () => {
        expect(computeRequestExpiry(now)).toBe(inDays(REQUEST_RULES.lifetimeDays));
    });
});

describe('getDaysUntilExpiry', () => {
    it('counts the days left, a started day counting as a whole', () => {
        expect(getDaysUntilExpiry(request({ expiresAt: inDays(2) }), now)).toBe(2);
        expect(getDaysUntilExpiry(request({ expiresAt: inDays(1.5) }), now)).toBe(2);
    });

    it('never goes below 0', () => {
        expect(getDaysUntilExpiry(request({ expiresAt: inDays(-5) }), now)).toBe(0);
    });
});

describe('formatAuthorName', () => {
    it('shows the first name and an initial, never the last name', () => {
        const author = { firstName: 'Sophie', lastNameInitial: 'M' } as RequestAuthor;
        expect(formatAuthorName(author)).toBe('Sophie M.');
    });
});
