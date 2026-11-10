import { z } from 'zod';

// ============================================
// FEED CURSOR — "the page after this item", as an opaque URL-safe token
// (base64url of a small JSON). Opaque on purpose: the app passes it back
// untouched, and the server stays free to change what it holds.
// The date is kept as the database wrote it, WITH microseconds: a JS Date
// stops at milliseconds, and a cut date would move the cursor back to the
// start of its millisecond: the next page would skip every item created later
// in that same millisecond (items are lost, without any error).
// ============================================

/** Position of the last item of a page: its creation instant and its id (tie-breaker) */
export interface FeedCursor {
    /** ISO 8601 instant in UTC, up to microseconds ("2026-11-10T09:15:42.123456Z") */
    createdAt: string;
    id: string;
}

// Strict ISO shape, then a real-date check: the value goes into SQL as a timestamptz
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;

const cursorSchema = z.object({
    createdAt: z
        .string()
        .regex(ISO_INSTANT)
        // Real calendar date: "2026-02-30" parses in JS (rolled to March) but would crash Postgres,
        // so the date read back must be the one written, to the second
        .refine((value) => {
            const time = Date.parse(value);
            return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 19) === value.slice(0, 19);
        }),
    id: z.uuid(),
});

/**
 * @param cursor position of the last item of a page
 * @returns the token to send as `nextCursor`
 */
export const encodeCursor = (cursor: FeedCursor): string =>
    Buffer.from(JSON.stringify({ createdAt: cursor.createdAt, id: cursor.id })).toString('base64url');

/**
 * @param raw token received in `?cursor=`
 * @returns the position, or null when the token is not one the server made
 *          (bad base64, bad JSON, wrong shape, impossible date, id not a uuid)
 */
export const decodeCursor = (raw: string): FeedCursor | null => {
    let parsed: unknown;
    try {
        parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
    const result = cursorSchema.safeParse(parsed);
    return result.success ? { createdAt: result.data.createdAt, id: result.data.id } : null;
};
