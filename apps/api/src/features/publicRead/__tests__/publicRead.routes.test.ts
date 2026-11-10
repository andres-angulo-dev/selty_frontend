import request from 'supertest';
import { sql } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../../app';
import { createTestDb } from '../../../test/db';
import {
    insertAnnonce,
    insertCommune,
    insertMedia,
    insertOffer,
    insertPro,
    insertProfile,
    insertRequest,
    resetContent,
} from '../../../test/factories';
import { findAnnonce, findOffer, findProfessional, findRequest } from '../publicRead.repository';

// ============================================
// Detail routes of the public read API: what a visitor gets for one
// professional, annonce, offer or request, and which states answer 404 / 410.
// The member queries are called directly (plan 3 switches the audience).
// ============================================

const { db, close } = createTestDb();
let app: ReturnType<typeof createApp>;

// Own commune (not one of the fixture communes, whose values the test would not control)
const MELUN = { code: '77901', name: 'Melun-Test', departmentCode: '77', lat: 48.5421, lng: 2.6554, surfaceHa: 805 };
const RANDOM_UUID = '3f1c2a7e-9b4d-4c8e-a1f2-6d5e4b3a2c10';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Paris calendar date ("YYYY-MM-DD") of an instant */
const parisDate = (date: Date): string =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/** Paris wall-clock time ("HH:MM") of an instant */
const parisTime = (date: Date): string =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);

/**
 * Midnight in Paris, `dayOffset` days from today (France is UTC+1 or UTC+2:
 * try both offsets and keep the one that lands on 00:00 of the right day).
 */
const parisMidnight = (dayOffset: number): Date => {
    const [year, month, day] = parisDate(new Date()).split('-').map(Number);
    const target = parisDate(new Date(Date.UTC(year, month - 1, day + dayOffset, 12)));
    for (const hours of [1, 2]) {
        const candidate = new Date(Date.UTC(year, month - 1, day + dayOffset) - hours * 60 * 60 * 1000);
        if (parisDate(candidate) === target && parisTime(candidate) === '00:00') return candidate;
    }
    throw new Error('no Paris midnight found');
};

beforeAll(() => {
    app = createApp({ db });
});

beforeEach(async () => {
    await resetContent(db);
    await insertCommune(db, MELUN);
});

afterAll(async () => {
    await resetContent(db);
    // The test's own commune goes too, so no other test file finds it
    await db.execute(sql`delete from communes where code = ${MELUN.code}`);
    await close();
});

describe('GET /v1/professionals/:id', () => {
    it('answers a visitor page: blurred name, no phone, only active annonces', async () => {
        const avatarMediaId = await insertMedia(db);
        const { professionalId } = await insertPro(db, {
            communeCode: MELUN.code,
            phone: '0612345678',
            showPhone: true,
            avatarMediaId,
            zones: [{ id: 'department-77', kind: 'department', departmentCode: '77' }],
        });
        const activeId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        await insertAnnonce(db, { professionalId, communeCode: MELUN.code, isActive: false });
        const liveOfferId = await insertOffer(db, { professionalId });
        await insertOffer(db, { professionalId, expiresAt: new Date(Date.now() - 3 * DAY_MS) });

        const response = await request(app).get(`/v1/professionals/${professionalId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(professionalId);
        expect(response.body.displayName).toMatchObject({ blurred: true });
        expect(response.body.description).toMatchObject({ blurred: true });
        expect(response.body.avatar.blurUrl).toMatch(/blur\.webp$/);
        expect(response.body.city).toBe(MELUN.name);
        expect(response.body.zones).toEqual([{ kind: 'department', code: '77', name: 'Seine-et-Marne' }]);
        expect(response.text).not.toContain('0612345678');
        expect(response.body).not.toHaveProperty('phone');
        expect(response.body).not.toHaveProperty('latitude');
        expect(response.body.annonces.map((annonce: { id: string }) => annonce.id)).toEqual([activeId]);
        expect(response.body.annonces[0].description).toMatchObject({ blurred: true });
        expect(response.body.offers.map((offer: { id: string }) => offer.id)).toEqual([liveOfferId]);
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('hides content of a pending professional', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, status: 'pending' });
        const response = await request(app).get(`/v1/professionals/${professionalId}`);
        expect(response.status).toBe(404);
        expect(response.body.title).toBe('Not found');
    });

    it('answers 404 for an unknown id', async () => {
        expect((await request(app).get(`/v1/professionals/${RANDOM_UUID}`)).status).toBe(404);
    });

    it('answers 404, not 400, for an id that is not a uuid', async () => {
        const response = await request(app).get('/v1/professionals/not-a-uuid');
        expect(response.status).toBe(404);
        expect(response.body.title).toBe('Not found');
    });
});

describe('GET /v1/annonces/:id', () => {
    it('answers the visitor shape', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        const photoId = await insertMedia(db);
        const annonceId = await insertAnnonce(db, {
            professionalId,
            communeCode: MELUN.code,
            priceType: 'fixed',
            price: 120,
        });
        await db.execute(
            // annonce_media has no factory: one photo in position 0
            sql`insert into annonce_media (annonce_id, media_id, position) values (${annonceId}, ${photoId}, 0)`,
        );

        const response = await request(app).get(`/v1/annonces/${annonceId}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: annonceId,
            title: 'Rénovation de salle de bain',
            tradeId: 'trade-painter',
            priceType: 'fixed',
            price: 120,
            city: MELUN.name,
            departmentCode: '77',
            department: 'Seine-et-Marne',
            description: { blurred: true },
            professional: { id: professionalId, displayName: { blurred: true }, tradeIds: ['trade-painter'] },
        });
        expect(response.body.photos).toHaveLength(1);
        expect(Object.keys(response.body.photos[0])).toEqual(['blurUrl']);
        expect(response.body).not.toHaveProperty('latitude');
        expect(response.text).not.toContain('Carrelage');
    });

    it('answers 410 Ended for an inactive annonce', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        const annonceId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code, isActive: false });
        const response = await request(app).get(`/v1/annonces/${annonceId}`);
        expect(response.status).toBe(410);
        expect(response.body).toMatchObject({ title: 'Ended' });
    });

    it('hides content of a pending professional', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, status: 'pending' });
        const annonceId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        expect((await request(app).get(`/v1/annonces/${annonceId}`)).status).toBe(404);
    });
});

describe('GET /v1/offers/:id', () => {
    const offerWith = async (dates: { startsAt?: Date; expiresAt?: Date; isActive?: boolean }) => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        return insertOffer(db, { professionalId, ...dates });
    };

    it('answers 200 for a live offer, placed at the professional commune', async () => {
        const offerId = await offerWith({});
        const response = await request(app).get(`/v1/offers/${offerId}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ id: offerId, discount: '-20 %', city: MELUN.name, description: { blurred: true } });
    });

    it('answers 410 when it starts tomorrow', async () => {
        const offerId = await offerWith({ startsAt: new Date(Date.now() + DAY_MS) });
        expect((await request(app).get(`/v1/offers/${offerId}`)).status).toBe(410);
    });

    it('answers 410 when it ended yesterday', async () => {
        const offerId = await offerWith({ expiresAt: new Date(Date.now() - DAY_MS) });
        expect((await request(app).get(`/v1/offers/${offerId}`)).status).toBe(410);
    });

    it('answers 410 when it is inactive', async () => {
        const offerId = await offerWith({ isActive: false });
        expect((await request(app).get(`/v1/offers/${offerId}`)).status).toBe(410);
    });

    it('counts the whole Paris day: starting at 23:59 today is live, at 00:00 tomorrow is not', async () => {
        const lastMinuteToday = new Date(parisMidnight(1).getTime() - 60 * 1000);
        expect((await request(app).get(`/v1/offers/${await offerWith({ startsAt: lastMinuteToday })}`)).status).toBe(200);
        expect((await request(app).get(`/v1/offers/${await offerWith({ startsAt: parisMidnight(1) })}`)).status).toBe(410);
    });

    it('counts the whole Paris day: ending at 00:00 today is live, at 23:59 yesterday is not', async () => {
        const todayMidnight = parisMidnight(0);
        const lastMinuteYesterday = new Date(todayMidnight.getTime() - 60 * 1000);
        expect((await request(app).get(`/v1/offers/${await offerWith({ expiresAt: todayMidnight })}`)).status).toBe(200);
        expect(
            (await request(app).get(`/v1/offers/${await offerWith({ expiresAt: lastMinuteYesterday, startsAt: new Date(lastMinuteYesterday.getTime() - DAY_MS) })}`)).status,
        ).toBe(410);
    });

    it('hides the offer of a pending professional', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, status: 'pending' });
        const offerId = await insertOffer(db, { professionalId });
        expect((await request(app).get(`/v1/offers/${offerId}`)).status).toBe(404);
    });
});

describe('GET /v1/requests/:id', () => {
    it('answers 200 with status expired, author first name blurred, no initial', async () => {
        const authorId = await insertProfile(db, { firstName: 'Bérangère', lastName: 'Zanetti' });
        const requestId = await insertRequest(db, {
            authorId,
            communeCode: MELUN.code,
            status: 'open',
            expiresAt: new Date(Date.now() - DAY_MS),
        });

        const response = await request(app).get(`/v1/requests/${requestId}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('expired');
        expect(response.body.author.firstName).toMatchObject({ blurred: true });
        expect(response.body.author).not.toHaveProperty('lastNameInitial');
        expect(response.text).not.toContain('Bérangère');
        expect(response.text).not.toContain('Zanetti');
    });

    it('answers 200 with status fulfilled', async () => {
        const authorId = await insertProfile(db);
        const requestId = await insertRequest(db, { authorId, communeCode: MELUN.code, status: 'fulfilled' });
        const response = await request(app).get(`/v1/requests/${requestId}`);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('fulfilled');
    });

    it('answers 404 for an unknown or malformed id', async () => {
        expect((await request(app).get(`/v1/requests/${RANDOM_UUID}`)).status).toBe(404);
        expect((await request(app).get('/v1/requests/123')).status).toBe(404);
    });
});

describe('headers', () => {
    it('varies on Authorization, success or not', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        const ok = await request(app).get(`/v1/professionals/${professionalId}`);
        const missing = await request(app).get(`/v1/annonces/${RANDOM_UUID}`);
        expect(ok.headers.vary).toMatch(/Authorization/);
        expect(missing.headers.vary).toMatch(/Authorization/);
    });
});

describe('repository', () => {
    // Column names the visitor query must never read (the *_length columns are allowed)
    const FORBIDDEN_COLUMNS = /"(description|display_name|first_name|last_name|phone)"/;

    /** Runs `action` and returns the text of every SQL query sent to the pool meanwhile */
    const capturedSql = async (action: () => Promise<unknown>): Promise<string[]> => {
        const texts: string[] = [];
        const original = db.$client.query.bind(db.$client);
        const spy = vi.spyOn(db.$client, 'query').mockImplementation(((config: unknown, ...rest: unknown[]) => {
            texts.push(typeof config === 'string' ? config : String((config as { text: string }).text));
            return (original as (...args: unknown[]) => unknown)(config, ...rest);
        }) as typeof db.$client.query);
        try {
            await action();
        } finally {
            spy.mockRestore();
        }
        return texts;
    };

    let ids: { professionalId: string; annonceId: string; offerId: string; requestId: string };

    beforeEach(async () => {
        const avatarMediaId = await insertMedia(db);
        const { professionalId } = await insertPro(db, {
            communeCode: MELUN.code,
            phone: '0612345678',
            avatarMediaId,
            coverMediaId: await insertMedia(db),
            zones: [
                { id: 'city-77901', kind: 'city', communeCode: MELUN.code, radiusKm: 10 },
                { id: 'region-11', kind: 'region', regionCode: '11' },
            ],
        });
        const annonceId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        const offerId = await insertOffer(db, { professionalId, mediaId: await insertMedia(db) });
        const authorId = await insertProfile(db, { firstName: 'Sophie', lastName: 'Martin' });
        const requestId = await insertRequest(db, { authorId, communeCode: MELUN.code });
        ids = { professionalId, annonceId, offerId, requestId };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('visitor query never selects description', async () => {
        const texts = await capturedSql(async () => {
            expect((await findProfessional(db, ids.professionalId, 'visitor')).state).toBe('found');
            expect((await findAnnonce(db, ids.annonceId, 'visitor')).state).toBe('found');
            expect((await findOffer(db, ids.offerId, 'visitor')).state).toBe('found');
            expect((await findRequest(db, ids.requestId, 'visitor')).state).toBe('found');
        });
        expect(texts).toHaveLength(4);
        for (const text of texts) expect(text).not.toMatch(FORBIDDEN_COLUMNS);
    });

    it('the spy sees the columns a member query reads (proves the check above can fail)', async () => {
        const texts = await capturedSql(() => findAnnonce(db, ids.annonceId, 'member'));
        expect(texts.join('\n')).toMatch(FORBIDDEN_COLUMNS);
    });

    it('member professional: clear texts, city zone with center and surface, never the phone', async () => {
        const result = await findProfessional(db, ids.professionalId, 'member');
        if (result.state !== 'found') throw new Error('not found');
        const { row } = result;
        expect(row.displayName).toBe('Atelier Martin');
        expect(row.description).toContain('Peinture');
        expect(row).not.toHaveProperty('phone');
        expect(row.latitude).toBeCloseTo(MELUN.lat);
        expect(row.longitude).toBeCloseTo(MELUN.lng);
        expect(row.avatar?.key1080).toMatch(/1080\.webp$/);
        expect(row.cover?.key1080).toMatch(/1080\.webp$/);
        expect(row.zones).toEqual(
            expect.arrayContaining([
                {
                    kind: 'city',
                    id: 'city-77901',
                    city: MELUN.name,
                    departmentCode: '77',
                    radiusKm: 10,
                    communeCode: MELUN.code,
                    latitude: expect.closeTo(MELUN.lat, 4),
                    longitude: expect.closeTo(MELUN.lng, 4),
                    surfaceHectares: 805,
                },
                { kind: 'region', id: 'region-11', regionCode: '11' },
            ]),
        );
        expect(row.memberSince).toBeInstanceOf(Date);
    });

    it('visitor professional zones carry no id and no coordinates', async () => {
        const result = await findProfessional(db, ids.professionalId, 'visitor');
        if (result.state !== 'found') throw new Error('not found');
        expect(result.row.zones).toEqual(
            expect.arrayContaining([
                { kind: 'city', city: MELUN.name, departmentCode: '77', radiusKm: 10 },
                { kind: 'region', regionCode: '11' },
            ]),
        );
    });

    it('member annonce and offer: clear description, commune center, photo 1080 key', async () => {
        const annonce = await findAnnonce(db, ids.annonceId, 'member');
        if (annonce.state !== 'found') throw new Error('annonce not found');
        expect(annonce.row.description).toContain('Carrelage');
        expect(annonce.row.communeCode).toBe(MELUN.code);
        expect(annonce.row.professional.displayName).toBe('Atelier Martin');
        expect(annonce.row.professional.avatar?.key1080).toMatch(/1080\.webp$/);

        const offer = await findOffer(db, ids.offerId, 'member');
        if (offer.state !== 'found') throw new Error('offer not found');
        expect(offer.row.description).toContain('devis');
        expect(offer.row.photo?.key1080).toMatch(/1080\.webp$/);
        expect(offer.row.latitude).toBeCloseTo(MELUN.lat);
    });

    it('member request: first name and only the initial of the last name', async () => {
        const result = await findRequest(db, ids.requestId, 'member');
        if (result.state !== 'found') throw new Error('not found');
        expect(result.row.authorFirstName).toBe('Sophie');
        expect(result.row.authorLastNameInitial).toBe('M');
        expect(JSON.stringify(result.row)).not.toContain('Martin');
        expect(result.row.authorMemberSince).toBeInstanceOf(Date);
    });

    it('ended and missing states', async () => {
        await db.execute(sql`update annonces set is_active = false`);
        await db.execute(sql`update offers set is_active = false`);
        expect(await findAnnonce(db, ids.annonceId, 'member')).toEqual({ state: 'ended' });
        expect(await findOffer(db, ids.offerId, 'visitor')).toEqual({ state: 'ended' });
        expect(await findRequest(db, RANDOM_UUID, 'visitor')).toEqual({ state: 'missing' });
        expect(await findProfessional(db, RANDOM_UUID, 'member')).toEqual({ state: 'missing' });
    });
});
