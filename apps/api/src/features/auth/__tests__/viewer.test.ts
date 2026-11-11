import { sql } from 'drizzle-orm';
import type { Express } from 'express';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MemoryEmailSender } from '../../../shared/email/memoryEmailSender';
import { APP_ORIGIN, createAuthTestApp, nextTestIp, signInForTest } from '../../../test/auth';
import { createTestDb } from '../../../test/db';
import { insertAnnonce, insertCommune, insertPro, resetContent } from '../../../test/factories';
import type { Auth } from '../auth';

// ============================================
// The viewer: a valid session whose user has a profile reads the public
// routes as a member (texts in clear, private answers); anything else (no
// cookie, forged, expired, revoked cookie, no profile) reads as a visitor.
// ============================================

const { db, close } = createTestDb();
let app: Express;
let auth: Auth;
let mail: MemoryEmailSender;

// Own commune (synthetic code, deleted at the end)
const MELUN = { code: '77921', name: 'Melun-Viewer', departmentCode: '77', lat: 48.5421, lng: 2.6553 };
const AT_MELUN = `lat=${MELUN.lat}&lng=${MELUN.lng}`;
const RANDOM_UUID = '3f1c2a7e-9b4d-4c8e-a1f2-6d5e4b3a2c10';
const DISPLAY_NAME = 'Atelier Viewer';
const DESCRIPTION = 'Peinture intérieure, travail soigné, devis offert.';

/** A validated professional with one active annonce at Melun */
const insertProWithAnnonce = async (): Promise<{ professionalId: string; annonceId: string }> => {
    const { professionalId } = await insertPro(db, {
        communeCode: MELUN.code,
        displayName: DISPLAY_NAME,
        description: DESCRIPTION,
    });
    const annonceId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
    return { professionalId, annonceId };
};

/** GET with an optional Cookie header */
const get = (path: string, cookie?: string) => {
    const pending = request(app).get(path);
    return cookie ? pending.set('Cookie', cookie) : pending;
};

beforeAll(async () => {
    await insertCommune(db, MELUN);
});

beforeEach(async () => {
    await resetContent(db);
    ({ app, auth, mail } = createAuthTestApp(db));
});

afterEach(() => {
    vi.restoreAllMocks();
});

afterAll(async () => {
    await resetContent(db);
    await db.execute(sql`delete from communes where code = ${MELUN.code}`);
    await close();
});

describe('member', () => {
    it('a member reads a professional in clear', async () => {
        const { professionalId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'member@example.fr');

        const response = await get(`/v1/professionals/${professionalId}`, cookie);

        expect(response.status).toBe(200);
        expect(response.body.displayName).toBe(DISPLAY_NAME);
        expect(response.body.description).toBe(DESCRIPTION);
        expect(response.headers['cache-control']).toBe('private, no-store');
    });

    it('a member feed page is private and in clear', async () => {
        const { annonceId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'feed@example.fr');

        const response = await get(`/v1/feed?${AT_MELUN}`, cookie);

        expect(response.status).toBe(200);
        expect(response.body.items.map((item: { id: string }) => item.id)).toEqual([annonceId]);
        expect(typeof response.body.items[0].description).toBe('string');
        expect(response.text).toContain('Carrelage, plomberie');
        expect(response.headers['cache-control']).toBe('private, no-store');
    });

    it('a member error answer is private too (404, 410, 400)', async () => {
        const cookie = await signInForTest(app, mail, 'errors@example.fr');
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        const endedId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code, isActive: false });

        const missing = await get(`/v1/annonces/${RANDOM_UUID}`, cookie);
        const ended = await get(`/v1/annonces/${endedId}`, cookie);
        const invalid = await get('/v1/feed?lat=abc&lng=2', cookie);

        expect(missing.status).toBe(404);
        expect(ended.status).toBe(410);
        expect(invalid.status).toBe(400);
        for (const response of [missing, ended, invalid]) {
            expect(response.headers['cache-control']).toBe('private, no-store');
        }
    });

    it('a session whose user has no profile reads as a visitor', async () => {
        const { professionalId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'noprofile@example.fr');
        await db.execute(sql`update profiles set user_id = null where user_id is not null`);

        const response = await get(`/v1/professionals/${professionalId}`, cookie);

        expect(response.status).toBe(200);
        expect(response.body.displayName).toMatchObject({ blurred: true });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });
});

describe('visitor', () => {
    it('a visitor answer stays public and blurred', async () => {
        const { professionalId } = await insertProWithAnnonce();

        const page = await get(`/v1/professionals/${professionalId}`);
        const feed = await get(`/v1/feed?${AT_MELUN}`);

        expect(page.status).toBe(200);
        expect(page.body.displayName).toMatchObject({ blurred: true });
        expect(page.body.description).toMatchObject({ blurred: true });
        expect(page.text).not.toContain(DESCRIPTION);
        expect(page.headers['cache-control']).toBe('public, max-age=60');
        expect(feed.status).toBe(200);
        expect(feed.body.items[0].description).toMatchObject({ blurred: true });
        expect(feed.headers['cache-control']).toBe('public, max-age=60');
    });

    // Review Focus 2: a cookie that names no live session is a visitor, never an error
    it('an expired cookie reads as a visitor (200)', async () => {
        const { professionalId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'expired@example.fr');
        await db.execute(sql`update session set expires_at = now() - interval '1 day'`);

        const response = await get(`/v1/professionals/${professionalId}`, cookie);

        expect(response.status).toBe(200);
        expect(response.body.displayName).toMatchObject({ blurred: true });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('a revoked cookie reads as a visitor (200)', async () => {
        const { professionalId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'revoked@example.fr');
        const signedOut = await request(app)
            .post('/v1/auth/sign-out')
            .set('cf-connecting-ip', nextTestIp())
            .set('Origin', APP_ORIGIN)
            .set('Cookie', cookie)
            .send({});
        expect(signedOut.status).toBe(200);

        const response = await get(`/v1/professionals/${professionalId}`, cookie);

        expect(response.status).toBe(200);
        expect(response.body.displayName).toMatchObject({ blurred: true });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('a forged cookie reads as a visitor (200)', async () => {
        const { professionalId } = await insertProWithAnnonce();
        // Real cookie name, made-up token and signature
        const realCookie = await signInForTest(app, mail, 'forged@example.fr');
        const cookieName = realCookie.split('=')[0];
        const forged = `${cookieName}=${crypto.randomUUID()}.${'A'.repeat(43)}%3D`;

        const response = await get(`/v1/professionals/${professionalId}`, forged);

        expect(response.status).toBe(200);
        expect(response.body.displayName).toMatchObject({ blurred: true });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('no cookie: no session lookup', async () => {
        await insertProWithAnnonce();
        const getSession = vi.spyOn(auth.api, 'getSession');

        const withoutCookie = await get(`/v1/feed?${AT_MELUN}`);
        expect(withoutCookie.status).toBe(200);
        expect(getSession).not.toHaveBeenCalled();

        // The spy does see the lookup when a cookie is sent
        await get(`/v1/feed?${AT_MELUN}`, 'some=cookie');
        expect(getSession).toHaveBeenCalledTimes(1);
    });
});

describe('failure', () => {
    it('a session lookup that throws (database down) answers 500, never a silent visitor page', async () => {
        const { professionalId } = await insertProWithAnnonce();
        vi.spyOn(auth.api, 'getSession').mockRejectedValue(new Error('connection refused'));

        const response = await get(`/v1/professionals/${professionalId}`, 'some=cookie');

        expect(response.status).toBe(500);
        expect(response.text).not.toContain('connection refused');
        expect(response.text).not.toContain(DESCRIPTION);
    });
});

describe('headers', () => {
    it('Vary lists Authorization and Cookie, success or error, visitor or member', async () => {
        const { professionalId } = await insertProWithAnnonce();
        const cookie = await signInForTest(app, mail, 'vary@example.fr');

        const responses = await Promise.all([
            get(`/v1/professionals/${professionalId}`),
            get(`/v1/professionals/${professionalId}`, cookie),
            get(`/v1/annonces/${RANDOM_UUID}`),
            get(`/v1/annonces/${RANDOM_UUID}`, cookie),
            get(`/v1/feed?${AT_MELUN}`),
            get(`/v1/feed?${AT_MELUN}`, cookie),
            get('/v1/feed?lat=abc&lng=2'),
        ]);

        for (const response of responses) {
            expect(response.headers.vary).toMatch(/Authorization/);
            expect(response.headers.vary).toMatch(/Cookie/);
        }
    });
});
