import request from 'supertest';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../../app';
import { createTestDb } from '../../../test/db';
import {
    insertAnnonce,
    insertCommune,
    insertOffer,
    insertPro,
    insertProfile,
    insertRequest,
    resetContent,
    type CommuneInput,
} from '../../../test/factories';

// ============================================
// GET /v1/feed: what a visitor sees around a position, in which order, how
// the radius widens when nothing is near, and how pages follow each other.
// ============================================

const { db, close } = createTestDb();
let app: ReturnType<typeof createApp>;

// Own communes (synthetic codes, deleted at the end): the test controls their positions
const MELUN = { code: '77911', name: 'Melun-Test', departmentCode: '77', lat: 48.5421, lng: 2.6553 };
const DAMMARIE = { code: '77912', name: 'Dammarie-Test', departmentCode: '77', lat: 48.5167, lng: 2.6386 }; // ~3 km
const FONTAINEBLEAU = { code: '77913', name: 'Fontainebleau-Test', departmentCode: '77', lat: 48.4047, lng: 2.7016 }; // ~16 km
const PROVINS = { code: '77914', name: 'Provins-Test', departmentCode: '77', lat: 48.5597, lng: 3.2994 }; // ~47 km
// A 77 commune ~8 km from Évry: makes the Essonne (91) a neighbour of the Seine-et-Marne
const LIEUSAINT = { code: '77915', name: 'Lieusaint-Test', departmentCode: '77', lat: 48.6333, lng: 2.55 };
const EVRY = { code: '91911', name: 'Evry-Test', departmentCode: '91', lat: 48.6297, lng: 2.4411 }; // ~19 km
const LYON = { code: '69911', name: 'Lyon-Test', departmentCode: '69', regionCode: '84', lat: 45.764, lng: 4.8357 };
const COMMUNES: CommuneInput[] = [MELUN, DAMMARIE, FONTAINEBLEAU, PROVINS, LIEUSAINT, EVRY, LYON];

const AT_MELUN = `lat=${MELUN.lat}&lng=${MELUN.lng}`;
const DAY_MS = 24 * 60 * 60 * 1000;

interface Item {
    kind: string;
    id: string;
    publishedAt: string;
    distanceKm: number;
    [key: string]: unknown;
}

/** One annonce of a new validated professional living in `communeCode` */
const annonceAt = async (communeCode: string, extra: { createdAt?: Date; isActive?: boolean } = {}) => {
    const { professionalId } = await insertPro(db, { communeCode });
    return insertAnnonce(db, { professionalId, communeCode, ...extra });
};

const ids = (items: Item[]) => items.map((item) => item.id);

beforeAll(async () => {
    app = createApp({ db });
    for (const commune of COMMUNES) await insertCommune(db, commune);
});

beforeEach(async () => {
    await resetContent(db);
});

afterAll(async () => {
    await resetContent(db);
    await db.execute(sql`delete from communes where code in (${sql.join(COMMUNES.map((c) => sql`${c.code}`), sql`, `)})`);
    await close();
});

describe('GET /v1/feed: content', () => {
    it('includes annonces, live offers and open requests within 30 km, newest first', async () => {
        const now = Date.now();
        const { professionalId } = await insertPro(db, { communeCode: DAMMARIE.code });
        const annonceId = await insertAnnonce(db, { professionalId, communeCode: MELUN.code, createdAt: new Date(now - 3000) });
        // The offer has no commune: it is placed at its professional's (Dammarie)
        const offerId = await insertOffer(db, { professionalId, createdAt: new Date(now - 1000) });
        const authorId = await insertProfile(db);
        const requestId = await insertRequest(db, { authorId, communeCode: FONTAINEBLEAU.code, createdAt: new Date(now - 2000) });
        await annonceAt(PROVINS.code); // ~47 km: outside

        const response = await request(app).get(`/v1/feed?${AT_MELUN}`);

        expect(response.status).toBe(200);
        expect(response.body.items.map((item: Item) => [item.kind, item.id])).toEqual([
            ['offer', offerId],
            ['request', requestId],
            ['annonce', annonceId],
        ]);
        expect(response.body).toMatchObject({ radius: '30', widenTo: null, nextCursor: null });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
        expect(response.headers.vary).toMatch(/Authorization/);
    });

    it('excludes offers not live and requests not open', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        await insertOffer(db, { professionalId, startsAt: new Date(Date.now() + 2 * DAY_MS) }); // upcoming
        await insertOffer(db, { professionalId, expiresAt: new Date(Date.now() - 2 * DAY_MS) }); // ended
        await insertOffer(db, { professionalId, isActive: false });
        await insertAnnonce(db, { professionalId, communeCode: MELUN.code, isActive: false });
        const authorId = await insertProfile(db);
        await insertRequest(db, { authorId, communeCode: MELUN.code, status: 'fulfilled' });
        await insertRequest(db, { authorId, communeCode: MELUN.code, expiresAt: new Date(Date.now() - DAY_MS) });
        const liveOfferId = await insertOffer(db, { professionalId });

        const response = await request(app).get(`/v1/feed?${AT_MELUN}`);

        expect(response.status).toBe(200);
        expect(ids(response.body.items)).toEqual([liveOfferId]);
    });

    it('hides content of a pending professional', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, status: 'pending' });
        await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        await insertOffer(db, { professionalId });

        const response = await request(app).get(`/v1/feed?${AT_MELUN}`);

        expect(response.status).toBe(200);
        expect(response.body.items).toEqual([]);
    });

    it('visitor item: no latitude, blurred description, whole kilometers', async () => {
        await annonceAt(DAMMARIE.code);

        const response = await request(app).get(`/v1/feed?${AT_MELUN}`);

        const [item] = response.body.items as Item[];
        expect(item).toMatchObject({ kind: 'annonce', city: DAMMARIE.name, description: { blurred: true } });
        expect(item).not.toHaveProperty('latitude');
        expect(item).not.toHaveProperty('longitude');
        expect(item).not.toHaveProperty('communeCode');
        expect(Number.isInteger(item.distanceKm)).toBe(true);
        expect(item.distanceKm).toBe(3);
        expect(response.text).not.toContain('Carrelage');
    });
});

describe('GET /v1/feed: radius', () => {
    it('offers to widen to 100 km when nothing is within 30 km, and 100 km finds it', async () => {
        const annonceId = await annonceAt(PROVINS.code);

        const near = await request(app).get(`/v1/feed?${AT_MELUN}`);
        expect(near.body).toMatchObject({ items: [], radius: '30', widenTo: '100', nextCursor: null });

        const wide = await request(app).get(`/v1/feed?${AT_MELUN}&radius=100`);
        expect(ids(wide.body.items)).toEqual([annonceId]);
        expect(wide.body).toMatchObject({ radius: '100', widenTo: null });
        expect(wide.body.items[0].distanceKm).toBeGreaterThan(40);
    });

    it('offers the department when nothing is within 100 km', async () => {
        await annonceAt(LYON.code);
        const response = await request(app).get(`/v1/feed?${AT_MELUN}&radius=100`);
        expect(response.body).toMatchObject({ items: [], radius: '100', widenTo: 'department' });
    });

    it('department from Melun includes a neighbouring Essonne item, excludes Lyon', async () => {
        const evryId = await annonceAt(EVRY.code);
        const provinsId = await annonceAt(PROVINS.code);
        await annonceAt(LYON.code);

        const response = await request(app).get(`/v1/feed?${AT_MELUN}&radius=department`);

        expect(response.status).toBe(200);
        expect(new Set(ids(response.body.items))).toEqual(new Set([evryId, provinsId]));
        expect(response.body).toMatchObject({ radius: 'department', widenTo: null });
    });
});

describe('GET /v1/feed: pages', () => {
    it('walks 25 items 10 by 10: no item twice, order kept, last cursor null', async () => {
        const base = Date.now() - 60_000;
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        const authorId = await insertProfile(db);
        // 12 annonces inside ONE millisecond (microseconds apart): the first page
        // ends in the middle of them, so a cursor cut to milliseconds would lose
        // the last two. Offers share dates three by three (the id breaks the tie),
        // requests are one second apart.
        for (let i = 0; i < 12; i += 1) await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        await db.execute(sql`
            update annonces set created_at = ${new Date(base + 5000).toISOString()}::timestamptz + numbered.n * interval '1 microsecond'
            from (select id, row_number() over (order by id) as n from annonces) as numbered
            where numbered.id = annonces.id
        `);
        for (let i = 0; i < 6; i += 1) {
            await insertOffer(db, { professionalId, createdAt: new Date(base - Math.floor(i / 3) * 1000) });
        }
        for (let i = 0; i < 7; i += 1) {
            await insertRequest(db, { authorId, communeCode: MELUN.code, createdAt: new Date(base - 500 - i * 1000) });
        }

        const all = await request(app).get(`/v1/feed?${AT_MELUN}&limit=50`);
        expect(all.body.items).toHaveLength(25);
        const allIds = ids(all.body.items);
        const dates = (all.body.items as Item[]).map((item) => item.publishedAt);
        expect([...dates].sort().reverse()).toEqual(dates);

        const pages: Item[][] = [];
        let cursor: string | null = null;
        do {
            const query: string = `/v1/feed?${AT_MELUN}&limit=10${cursor ? `&cursor=${cursor}` : ''}`;
            const page = await request(app).get(query);
            expect(page.status).toBe(200);
            pages.push(page.body.items);
            cursor = page.body.nextCursor;
        } while (cursor && pages.length < 5);

        expect(pages.map((page) => page.length)).toEqual([10, 10, 5]);
        expect(pages.flat().map((item) => item.id)).toEqual(allIds);
        expect(new Set(allIds).size).toBe(25);
    });

    it('refuses a limit over the maximum', async () => {
        const response = await request(app).get(`/v1/feed?${AT_MELUN}&limit=51`);
        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual([{ field: 'limit', message: expect.any(String) }]);
    });

    it('refuses a cursor it did not make', async () => {
        const response = await request(app).get(`/v1/feed?${AT_MELUN}&cursor=garbage`);
        expect(response.status).toBe(400);
        expect(response.body.title).toBe('Invalid cursor');
        expect(response.headers.vary).toMatch(/Authorization/);
    });

    it.each([
        ['no position', ''],
        ['latitude out of range', 'lat=91&lng=2'],
        ['longitude out of range', 'lat=48&lng=181'],
        ['empty latitude', 'lat=&lng=2'],
        ['unknown radius', `${AT_MELUN}&radius=50`],
    ])('answers 400 for %s', async (_label, query) => {
        const response = await request(app).get(`/v1/feed?${query}`);
        expect(response.status).toBe(400);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });
});

describe('GET /v1/feed: privacy of the SQL', () => {
    // Same rule as the detail routes: the visitor queries never read these columns
    const FORBIDDEN_COLUMNS = /"(description|display_name|first_name|last_name|phone)"/;
    const SELECTED_SERVICES = /(?<!unnest\("professional_profiles"\.)"services"/;

    it('visitor queries never read description, names, phone or services', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, phone: '0612345678' });
        await insertAnnonce(db, { professionalId, communeCode: MELUN.code });
        await insertOffer(db, { professionalId });
        await insertRequest(db, { authorId: await insertProfile(db, { firstName: 'Bérangère' }), communeCode: MELUN.code });

        const texts: string[] = [];
        const original = db.$client.query.bind(db.$client);
        const spy = vi.spyOn(db.$client, 'query').mockImplementation(((config: unknown, ...rest: unknown[]) => {
            texts.push(typeof config === 'string' ? config : String((config as { text: string }).text));
            return (original as (...args: unknown[]) => unknown)(config, ...rest);
        }) as typeof db.$client.query);
        let response: request.Response;
        try {
            response = await request(app).get(`/v1/feed?${AT_MELUN}`);
        } finally {
            spy.mockRestore();
        }

        expect(response.body.items).toHaveLength(3);
        expect(texts.length).toBeGreaterThan(0);
        for (const text of texts) {
            expect(text).not.toMatch(FORBIDDEN_COLUMNS);
            expect(text).not.toMatch(SELECTED_SERVICES);
        }
        expect(response.text).not.toContain('Bérangère');
        expect(response.text).not.toContain('0612345678');
    });
});
