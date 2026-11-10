import { FEED_RULES, type Audience, type FeedItem, type FeedPage, type FeedRadius } from '@sialty/domain';
import { Router } from 'express';
import { z } from 'zod';
import type { Database } from '../../db/client';
import { HttpProblem } from '../../shared/http/problem';
import { validate } from '../../shared/http/validate';
import { resolveAudience } from '../publicRead/audience';
import { serializeAnnonce } from '../publicRead/serializers/annonce';
import { serializeOffer } from '../publicRead/serializers/offer';
import { serializeRequest } from '../publicRead/serializers/request';
import { decodeCursor, encodeCursor } from './feed.cursor';
import { findFeedPage, type FeedArea, type FeedEntry } from './feed.repository';

// ============================================
// FEED ROUTE — GET /v1/feed: the newest annonces, live offers and open
// requests around a position, page by page. When the first page of a radius
// is empty, `widenTo` names the next radius for the app to offer
// (30 km → 100 km → department, from FEED_RULES).
// Privacy: the position is in the query string, which the logs never write
// (see the req serializer in app.ts).
// ============================================

/** Same short shared cache as the detail routes */
const FEED_CACHE_CONTROL = 'public, max-age=60';

/** Every radius in widening order: the distance steps, then the department */
const RADIUS_STEPS: FeedRadius[] = [
    ...FEED_RULES.radiusStepsKm.map((km) => String(km) as FeedRadius),
    FEED_RULES.finalStep,
];

/** Longest accepted ?cursor= (base64url of { createdAt with microseconds, uuid } is ~120) */
const MAX_CURSOR_LENGTH = 200;

/** A required number in the query string: an empty value is missing, not 0 */
const coordinate = (min: number, max: number) =>
    z.string().trim().min(1).pipe(z.coerce.number<string>().min(min).max(max));

const feedQuerySchema = z.object({
    lat: coordinate(-90, 90),
    lng: coordinate(-180, 180),
    radius: z.enum(RADIUS_STEPS as [FeedRadius, ...FeedRadius[]]).default('30'),
    // A real cursor is ~120 characters: anything much longer is refused before any decoding work
    cursor: z.string().max(MAX_CURSOR_LENGTH).optional(),
    limit: z.coerce.number().int().min(1).max(FEED_RULES.maxPageSize).default(FEED_RULES.pageSize),
});

type FeedQueryInput = z.infer<typeof feedQuerySchema>;

/** The radius as the repository's area */
const toArea = (radius: FeedRadius): FeedArea =>
    radius === 'department' ? { kind: 'department' } : { kind: 'distance', km: Number(radius) };

/**
 * @param nothingSelected the page's selection (step 1) found no item at all:
 *        the radius really holds nothing, not just items skipped while reading
 * @returns the next radius when the FIRST page of `radius` is empty, else null
 *          (a later empty page only means the end of a radius already shown)
 */
const widenToFor = (radius: FeedRadius, isFirstPage: boolean, nothingSelected: boolean): FeedRadius | null => {
    if (!isFirstPage || !nothingSelected) return null;
    return RADIUS_STEPS[RADIUS_STEPS.indexOf(radius) + 1] ?? null;
};

/** One entry as an item: its resource serializer, then its kind and distance */
const toFeedItem = (entry: FeedEntry, audience: Audience): FeedItem => {
    switch (entry.kind) {
        case 'annonce':
            return { kind: 'annonce', ...serializeAnnonce(entry.row, audience), distanceKm: entry.distanceKm };
        case 'offer':
            return { kind: 'offer', ...serializeOffer(entry.row, audience), distanceKm: entry.distanceKm };
        case 'request':
            return { kind: 'request', ...serializeRequest(entry.row, audience), distanceKm: entry.distanceKm };
    }
};

/**
 * @param db The database the repository reads
 * @returns GET /v1/feed?lat=&lng=&radius=30|100|department&cursor=&limit=
 */
export const feedRoutes = (db: Database): Router => {
    const router = Router();

    // Before validation: a 400 also depends on who asks (plan 3), shared caches must key on it
    router.use('/v1/feed', (_req, res, next) => {
        res.vary('Authorization');
        next();
    });

    router.get('/v1/feed', validate({ query: feedQuerySchema }), async (req, res) => {
        const input = res.locals.query as FeedQueryInput;
        const cursor = input.cursor === undefined ? null : decodeCursor(input.cursor);
        if (input.cursor !== undefined && !cursor) throw new HttpProblem(400, 'Invalid cursor');

        const audience = resolveAudience(req);
        const { entries, nextCursor, nothingSelected } = await findFeedPage(
            db,
            { lat: input.lat, lng: input.lng, area: toArea(input.radius), cursor, limit: input.limit },
            audience,
        );

        const body: FeedPage = {
            items: entries.map((entry) => toFeedItem(entry, audience)),
            nextCursor: nextCursor ? encodeCursor(nextCursor) : null,
            radius: input.radius,
            widenTo: widenToFor(input.radius, cursor === null, nothingSelected),
        };
        res.set('Cache-Control', FEED_CACHE_CONTROL).json(body);
    });

    return router;
};
