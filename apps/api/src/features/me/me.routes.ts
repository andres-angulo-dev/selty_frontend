import { Router, type RequestHandler } from 'express';
import type { Database } from '../../db/client';
import { requireMember } from '../../shared/http/requireMember';
import { MEMBER_CACHE_CONTROL } from '../publicRead/audience';
import { readMe } from './me.repository';

// ============================================
// ME ROUTE — GET /v1/me: who is signed in. The app reads `professional.status`
// to offer (or not) the professional mode.
// ============================================

/**
 * @param db The database
 * @returns The router with GET /v1/me (members only)
 */
export const meRoutes = (db: Database): Router => {
    const router = Router();

    // Security: the answer depends on the cookie and holds the e-mail, so it is
    // never cached by a shared cache nor kept on disk. Set BEFORE requireMember
    // so the 401 carries the same headers.
    const markPrivate: RequestHandler = (_req, res, next) => {
        res.vary('Authorization');
        res.vary('Cookie');
        res.set('Cache-Control', MEMBER_CACHE_CONTROL);
        next();
    };

    router.get('/v1/me', markPrivate, requireMember, async (req, res, next) => {
        try {
            // requireMember guarantees the viewer
            res.json(await readMe(db, req.viewer!));
        } catch (error) {
            next(error);
        }
    });

    return router;
};
