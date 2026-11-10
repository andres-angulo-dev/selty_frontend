import { sql } from 'drizzle-orm';
import { Router } from 'express';
import type { Database } from '../../db/client';
import { HttpProblem } from '../../shared/http/problem';

// ============================================
// HEALTH — tells whether the server answers, and whether its database does.
// Used to check the tunnel from the iPhone, and later by the host to restart
// a stuck server. Without a database (skeleton tests), only the server is checked.
// ============================================

/**
 * @param db The database to probe; omitted in the tests of the bare skeleton
 */
export const healthRoutes = (db?: Database): Router => {
    const router = Router();

    router.get('/v1/health', async (req, res) => {
        if (!db) {
            res.json({ status: 'ok' });
            return;
        }

        try {
            // Cheapest possible query: proves a connection can be opened and used
            await db.execute(sql`select 1`);
        } catch (error) {
            // Security: the driver's message (host, port, user) stays in the logs
            req.log.error({ err: error }, 'database health check failed');
            throw new HttpProblem(503, 'Database unavailable');
        }
        res.json({ status: 'ok', database: 'ok' });
    });

    return router;
};
