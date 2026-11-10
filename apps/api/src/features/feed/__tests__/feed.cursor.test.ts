import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor } from '../feed.cursor';

// ============================================
// Feed cursor: an opaque token for "the page after this item". Anything the
// server did not produce itself must decode to null (the route answers 400).
// ============================================

const POSITION = { createdAt: '2026-11-10T09:15:42.123456Z', id: '3f1c2a7e-9b4d-4c8e-a1f2-6d5e4b3a2c10' };

describe('feed cursor', () => {
    it('round-trips, keeping the microseconds of the date', () => {
        expect(decodeCursor(encodeCursor(POSITION))).toEqual(POSITION);
    });

    it('is URL-safe (base64url: no +, / or =)', () => {
        expect(encodeCursor(POSITION)).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it.each([
        ['garbage', 'garbage'],
        ['empty', ''],
        ['not JSON', Buffer.from('{oops').toString('base64url')],
        ['JSON but not an object', Buffer.from('42').toString('base64url')],
        ['id not a uuid', encodeCursor({ ...POSITION, id: 'x' })],
        ['date not a date', encodeCursor({ ...POSITION, createdAt: 'yesterday' })],
        ['date impossible', encodeCursor({ ...POSITION, createdAt: '2026-13-45T99:00:00Z' })],
        ['missing id', Buffer.from(JSON.stringify({ createdAt: POSITION.createdAt })).toString('base64url')],
    ])('decodes %s to null', (_label, raw) => {
        expect(decodeCursor(raw)).toBeNull();
    });
});
