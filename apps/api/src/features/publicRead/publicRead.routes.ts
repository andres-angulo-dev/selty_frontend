import type {
    Audience,
    MemberProfessionalPage,
    ProfessionalPage,
    PublicAnnonce,
    PublicOffer,
    PublicRequest,
    VisitorProfessionalPage,
} from '@sialty/domain';
import { Router, type Response } from 'express';
import { z } from 'zod';
import type { Database } from '../../db/client';
import { HttpProblem } from '../../shared/http/problem';
import { cacheControlFor, markAudienceDependent, resolveAudience } from './audience';
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
// for the audience (visitor, or member when loadViewer found a session).
// 404 "Not found": unknown id, malformed id, or professional not validated.
// 410 "Ended": the annonce is inactive or the offer no longer live (the
// favorites tab tells "ended" from "deleted").
// ============================================

/** Short shared cache for visitors: content changes, but a detail page is read many times (members: private) */
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

/** Every body a detail route may send: typed so the compiler checks the contract the app reads */
type DetailBody = ProfessionalPage | PublicAnnonce | PublicOffer | PublicRequest;

/** Sends a found resource with the detail cache header of its audience (private for a member) */
const sendDetail = (res: Response, body: DetailBody, audience: Audience): void => {
    res.set('Cache-Control', cacheControlFor(audience, DETAIL_CACHE_CONTROL)).json(body);
};

/**
 * Reads and shapes one professional's page: the profile and its nested lists.
 * One branch per audience, so every part of a page has the SAME audience's
 * shape (the compiler refuses a visitor profile carrying member annonces).
 * @param db       The database
 * @param id       The professional's id (already a valid uuid)
 * @param audience Who reads
 * @returns The page, or null when the professional is unknown or not validated
 */
const readProfessionalPage = async (db: Database, id: string, audience: Audience): Promise<ProfessionalPage | null> => {
    if (audience === 'member') {
        const result = await findProfessional(db, id, 'member');
        if (result.state !== 'found') return null;
        const [annonceRows, offerRows] = await Promise.all([
            listProfessionalAnnonces(db, id, 'member'),
            listProfessionalOffers(db, id, 'member'),
        ]);
        return {
            ...serializeProfessional(result.row, 'member'),
            annonces: annonceRows.map((row) => serializeAnnonce(row, 'member')),
            offers: offerRows.map((row) => serializeOffer(row, 'member')),
        } satisfies MemberProfessionalPage;
    }
    const result = await findProfessional(db, id, 'visitor');
    if (result.state !== 'found') return null;
    const [annonceRows, offerRows] = await Promise.all([
        listProfessionalAnnonces(db, id, 'visitor'),
        listProfessionalOffers(db, id, 'visitor'),
    ]);
    return {
        ...serializeProfessional(result.row, 'visitor'),
        annonces: annonceRows.map((row) => serializeAnnonce(row, 'visitor')),
        offers: offerRows.map((row) => serializeOffer(row, 'visitor')),
    } satisfies VisitorProfessionalPage;
};

/**
 * @param db The database the repository reads
 * @returns GET /v1/professionals/:id, /v1/annonces/:id, /v1/offers/:id, /v1/requests/:id
 */
export const publicReadRoutes = (db: Database): Router => {
    const router = Router();

    // Runs before every route below (and before the error they may throw):
    // every answer, error included, depends on who asks
    router.use(['/v1/professionals', '/v1/annonces', '/v1/offers', '/v1/requests'], (req, res, next) => {
        markAudienceDependent(req, res);
        next();
    });

    router.get('/v1/professionals/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const page = await readProfessionalPage(db, parseId(req.params.id), audience);
        if (!page) throw new HttpProblem(404, 'Not found');
        sendDetail(res, page, audience);
    });

    router.get('/v1/annonces/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findAnnonce(db, parseId(req.params.id), audience);
        if (result.state === 'missing') throw new HttpProblem(404, 'Not found');
        if (result.state === 'ended') throw new HttpProblem(410, 'Ended');
        sendDetail(res, serializeAnnonce(result.row, audience), audience);
    });

    router.get('/v1/offers/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findOffer(db, parseId(req.params.id), audience);
        if (result.state === 'missing') throw new HttpProblem(404, 'Not found');
        if (result.state === 'ended') throw new HttpProblem(410, 'Ended');
        sendDetail(res, serializeOffer(result.row, audience), audience);
    });

    // A fulfilled or expired request still answers 200: its status says so
    router.get('/v1/requests/:id', async (req, res) => {
        const audience = resolveAudience(req);
        const result = await findRequest(db, parseId(req.params.id), audience);
        if (result.state !== 'found') throw new HttpProblem(404, 'Not found');
        sendDetail(res, serializeRequest(result.row, audience), audience);
    });

    return router;
};
