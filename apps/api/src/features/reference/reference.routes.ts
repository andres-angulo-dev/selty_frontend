import { asc } from 'drizzle-orm';
import { Router } from 'express';
import type { Database } from '../../db/client';
import { categories, trades } from '../../db/schema';

// ============================================
// REFERENCE ROUTES — the trades and categories the app shows in its lists.
// Read from the tables (filled from @sialty/domain by syncReference), so the
// app and the server's foreign keys always agree on the ids.
// ============================================

/** Reference data changes with a deploy only: cache for an hour */
const REFERENCE_CACHE_CONTROL = 'public, max-age=3600';

/**
 * @param db The database holding the reference tables
 * @returns GET /v1/trades → { items: Trade[] }, GET /v1/categories → { items: { id, name }[] }
 */
export const referenceRoutes = (db: Database): Router => {
    const router = Router();

    router.get('/v1/trades', async (_req, res) => {
        const items = await db
            .select({
                id: trades.id,
                label: trades.label,
                categoryId: trades.categoryId,
                isRemoteCapable: trades.isRemoteCapable,
            })
            .from(trades)
            .orderBy(asc(trades.label));
        res.set('Cache-Control', REFERENCE_CACHE_CONTROL).json({ items });
    });

    router.get('/v1/categories', async (_req, res) => {
        const items = await db
            .select({ id: categories.id, name: categories.name })
            .from(categories)
            .orderBy(asc(categories.name));
        res.set('Cache-Control', REFERENCE_CACHE_CONTROL).json({ items });
    });

    return router;
};
