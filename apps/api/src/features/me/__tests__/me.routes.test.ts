import { sql } from 'drizzle-orm';
import type { Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { professionalProfiles, profiles } from '../../../db/schema';
import type { MemoryEmailSender } from '../../../shared/email/memoryEmailSender';
import { createAuthTestApp, signInForTest } from '../../../test/auth';
import { createTestDb } from '../../../test/db';
import { insertCommune, resetContent } from '../../../test/factories';

// ============================================
// GET /v1/me — who is signed in: the person, and their professional profile
// (any status: it is the owner reading). Private answers, never the phone nor
// the full last name.
// ============================================

const { db, close } = createTestDb();
let app: Express;
let mail: MemoryEmailSender;

// Own commune (synthetic code, deleted at the end)
const MELUN = { code: '77922', name: 'Melun-Me', departmentCode: '77', lat: 48.5421, lng: 2.6553 };
const EMAIL = 'me@example.fr';

/** GET /v1/me with an optional Cookie header */
const getMe = (cookie?: string) => {
    const pending = request(app).get('/v1/me');
    return cookie ? pending.set('Cookie', cookie) : pending;
};

beforeAll(async () => {
    await insertCommune(db, MELUN);
});

beforeEach(async () => {
    await resetContent(db);
    ({ app, mail } = createAuthTestApp(db));
});

afterAll(async () => {
    await resetContent(db);
    await db.execute(sql`delete from communes where code = ${MELUN.code}`);
    await close();
});

describe('GET /v1/me', () => {
    it('401 problem without session', async () => {
        const response = await getMe();

        expect(response.status).toBe(401);
        expect(response.headers['content-type']).toContain('application/problem+json');
        expect(response.body.title).toBe('Sign-in required');
    });

    it('answers the account of the viewer', async () => {
        const cookie = await signInForTest(app, mail, EMAIL, { firstName: 'Sophie' });

        const response = await getMe(cookie);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ email: EMAIL, firstName: 'Sophie', lastInitial: null, professional: null });
        expect(response.body.memberSince).toMatch(/^\d{4}-\d{2}$/);
        expect(typeof response.body.profileId).toBe('string');
        expect(response.headers['cache-control']).toBe('private, no-store');
        expect(response.headers.vary).toMatch(/Authorization/);
        expect(response.headers.vary).toMatch(/Cookie/);
    });

    it('includes the professional profile with its status, even pending', async () => {
        const cookie = await signInForTest(app, mail, EMAIL);
        const [profile] = await db.select({ id: profiles.id }).from(profiles).limit(1);
        const [pro] = await db
            .insert(professionalProfiles)
            .values({
                profileId: profile.id,
                displayName: 'Atelier Me',
                description: 'Peinture intérieure, devis gratuit.',
                locationType: 'mobile',
                communeCode: MELUN.code,
                status: 'pending',
            })
            .returning({ id: professionalProfiles.id });

        const response = await getMe(cookie);

        expect(response.status).toBe(200);
        expect(response.body.professional).toEqual({ id: pro.id, status: 'pending', displayName: 'Atelier Me' });
    });

    it('never answers the phone or the last name in full', async () => {
        const cookie = await signInForTest(app, mail, EMAIL);
        await db.update(profiles).set({ lastName: 'Martin' });

        const response = await getMe(cookie);

        expect(response.body.lastInitial).toBe('M');
        expect(JSON.stringify(response.body)).not.toContain('Martin');
        expect(response.body).not.toHaveProperty('phone');
        expect(response.body).not.toHaveProperty('lastName');
    });
});
