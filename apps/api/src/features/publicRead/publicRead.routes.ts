import { Router, type Response } from 'express';
import { z } from 'zod';
import type { Database } from '../../db/client';
import { HttpProblem } from '../../shared/http/problem';
import { resolveAudience } from './audience';
import {
    findAnnonce,
    findOffer,
    findProfessional,
    findRequest,
    listProfessionalAnnonces,
    listProfessionalOffers,
} from './publicRead.repository';
import { serializeAnnonce } from './serializers/annonce';
import { serializeOffer } from './serializers/offer';
import { serializeProfessional } from './serializers/professional';
import { serializeRequest } from './serializers/request';

// ============================================
// PUBLIC DETAIL ROUTES — one professional, annonce, offer or request, shaped
// for the audience (visitor today, member from plan 3).
// 404 "Not found": unknown id, malformed id, or professional not validated.
// 410 "Ended": the annonce is inactive or the offer no longer live (the
// favorites tab tells "ended" from "deleted").
// ============================================

/** Short shared cache: content changes, but a detail page is read many times */
const DETAIL_CACHE_CONTROL = 'public, max-age=60';

const idSchema = z.uuid();

/**
 * Reads the :id parameter. Not through `validate` on purpose: a malformed id
 * is not a form field the client can fix, it names nothing → 404, not 400.
 * (It also keeps a non-uuid away from Postgres, which would reject the cast.)
 */
const parseId = (raw: unknown): string => {
    const result = idSchema.safeParse(raw);
    if (!result.success) throw new HttpProblem(404, 'Not found');
    return result.data;
};

/**
 * Every answer, error included, depends on who asks (plan 3: the session in
 * Authorization), so shared caches must key on it.
 */
const varyOnAudience = (res: Response): void => {
    res.vary('Authorization');
};

/** Sends a found resource with the detail cache header */
const sendDetail = (res: Response, body: unknown): void => {
    res.set('Cache-Control', DETAIL_CACHE_CONTROL).json(body);
};

/**
 * @param db The database the repository reads
 * @returns GET /v1/professionals/:id, /v1/annonces/:id, /v1/offers/:id, /v1/requests/:id
 */
export const publicReadRoutes = (db: Database): Router => {
    const router = Router();

    // Runs before every route below (and before the error they may throw)
    router.use(['/v1/professionals', '/v1/annonces', '/v1/offers', '/v1/requests'], (_req, res, next) => {
        varyOnAudience(res);
        next();
    });

    router.get('/v1/professionals/:id', async (req, res) => {
        const id = parseId(req.params.id);
        const audience = resolveAudience(req);
        const result = await findProfessional(db, id, audience);
        if (result.state !== 'found') throw new HttpProblem(404, 'Not found');

        const [annonceRows, offerRows] = await Promise.all([
            listProfessionalAnnonces(db, id, audience),
            listProfessionalOffers(db, id, audience),
        ]);
        sendDetail(res, {
            ...serializeProfessional(result.row, audience),
            annonces: annonceRows.map((row) => serializeAnnonce(row, audience)),
            offers: offerRows.map((row) => serializeOffer(row, audience)),
        });
    });

    router.get('/v1/annonces/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findAnnonce(db, parseId(req.params.id), audience);
        if (result.state === 'missing') throw new HttpProblem(404, 'Not found');
        if (result.state === 'ended') throw new HttpProblem(410, 'Ended');
        sendDetail(res, serializeAnnonce(result.row, audience));
    });

    router.get('/v1/offers/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findOffer(db, parseId(req.params.id), audience);
        if (result.state === 'missing') throw new HttpProblem(404, 'Not found');
        if (result.state === 'ended') throw new HttpProblem(410, 'Ended');
        sendDetail(res, serializeOffer(result.row, audience));
    });

    // A fulfilled or expired request still answers 200: its status says so
    router.get('/v1/requests/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findRequest(db, parseId(req.params.id), audience);
        if (result.state !== 'found') throw new HttpProblem(404, 'Not found');
        sendDetail(res, serializeRequest(result.row, audience));
    });

    return router;
};
