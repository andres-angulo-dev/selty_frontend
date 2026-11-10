import { describe, expect, it } from 'vitest';
import { isOfferLive } from '../index';

// Fixed clock so the tests do not depend on the day they run.
const now = new Date('2026-11-10T12:00:00Z');
const base = { isActive: true, startsAt: null, expiresAt: null };

describe('isOfferLive', () => {
    it('is false when the offer is inactive', () => {
        expect(isOfferLive({ ...base, isActive: false }, now)).toBe(false);
    });

    it('is false when the offer starts tomorrow', () => {
        expect(isOfferLive({ ...base, startsAt: new Date('2026-11-12T12:00:00Z') }, now)).toBe(false);
    });

    it('is false when the offer ended yesterday', () => {
        expect(isOfferLive({ ...base, expiresAt: new Date('2026-11-08T12:00:00Z') }, now)).toBe(false);
    });

    it('is true when the offer ends today (valid all day)', () => {
        expect(isOfferLive({ ...base, expiresAt: new Date('2026-11-10T12:00:00Z') }, now)).toBe(true);
    });

    it('is true when the offer started earlier today', () => {
        expect(isOfferLive({ ...base, startsAt: new Date('2026-11-10T12:30:00Z') }, now)).toBe(true);
    });

    it('is true when active with no dates', () => {
        expect(isOfferLive(base, now)).toBe(true);
    });

    it('accepts ISO strings', () => {
        expect(isOfferLive({ isActive: true, startsAt: '2026-11-01T00:00:00Z', expiresAt: '2026-11-30T00:00:00Z' }, now)).toBe(true);
        expect(isOfferLive({ isActive: true, startsAt: '2026-11-12T12:00:00Z', expiresAt: null }, now)).toBe(false);
    });
});
