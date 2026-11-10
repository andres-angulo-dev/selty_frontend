import { count, eq } from 'drizzle-orm';
import sharp from 'sharp';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
    annonceMedia,
    annonces,
    professionalProfiles,
    professionalZones,
    requests,
} from '../../../db/schema';
import type { ObjectStorage } from '../../../media/objectStorage';
import { createTestDb } from '../../../test/db';
import { insertCommune, resetContent } from '../../../test/factories';
import { seedContent, type SeedData } from '../seedContent';

// ============================================
// seedContent: fills the development database from plain data. Runs against
// the test database with a fake image downloader and an in-memory storage.
// ============================================

const { db, close } = createTestDb();

/** In-memory storage: the seed only needs put */
const memoryStorage = (): ObjectStorage & { keys: string[] } => {
    const files = new Map<string, Buffer>();
    return {
        get keys() {
            return [...files.keys()];
        },
        put: async (key, body) => {
            files.set(key, body);
        },
        get: async (key) => files.get(key) ?? null,
    };
};

/** @returns A 600x400 JPEG, whatever the URL */
const fakeFetchImage = async (): Promise<Buffer> =>
    sharp({ create: { width: 600, height: 400, channels: 3, background: '#39c' } })
        .jpeg()
        .toBuffer();

/** Three items: one pro in Melun, one annonce with 2 photos, one request */
const smallData = (city = 'Melun', department = '77'): SeedData => ({
    professionals: [
        {
            ref: 'pro-a',
            firstName: 'Jean',
            lastName: 'Dupont',
            description: 'Plombier expérimenté depuis 15 ans.',
            services: ['Plomberie'],
            place: { city, department },
            locationType: 'mobile',
            phone: '06 12 34 56 78',
            startingPrice: 60,
            tradeIds: ['trade-plumber'],
            zones: [
                { kind: 'city', place: { city: 'Melun', department: '77' }, radiusKm: 20 },
                { kind: 'department', code: '77' },
            ],
            coverImage: 'https://example.test/cover.jpg',
            memberSinceDaysAgo: 400,
        },
    ],
    annonces: [
        {
            professionalRef: 'pro-a',
            title: 'Intervention plomberie',
            description: 'Disponible 7j/7 pour tous vos travaux de plomberie.',
            images: ['https://example.test/a1.jpg', 'https://example.test/a2.jpg'],
            place: { city: 'Melun', department: '77' },
            tradeId: 'trade-plumber',
            priceType: 'quote',
            createdDaysAgo: 2,
        },
    ],
    offers: [],
    requests: [
        {
            author: { firstName: 'Sophie', lastName: 'M', memberSinceDaysAgo: 300 },
            tradeId: 'trade-painter',
            title: 'Peinture salon',
            description: 'Repeindre un salon de 20 m².',
            urgency: 'this_week',
            photos: [],
            place: { city: 'Melun', department: '77' },
            status: 'open',
            createdHoursAgo: 2,
            expiresInDays: 29,
        },
    ],
});

const countRows = async (table: typeof annonces | typeof requests | typeof professionalProfiles): Promise<number> => {
    const [row] = await db.select({ n: count() }).from(table);
    return row.n;
};

beforeAll(async () => {
    // The test database only holds fixture communes: Melun is added here
    await insertCommune(db, { code: '77288', name: 'Melun', departmentCode: '77', lat: 48.5421, lng: 2.6552 });
});

afterEach(async () => {
    await resetContent(db);
});

afterAll(async () => {
    await resetContent(db);
    await close();
});

describe('seedContent', () => {
    it('inserts the data and returns the counts', async () => {
        const result = await seedContent(db, memoryStorage(), smallData(), fakeFetchImage);
        // 2 annonce photos + 1 cover
        expect(result).toEqual({ professionals: 1, annonces: 1, offers: 0, requests: 1, photos: 3 });

        const [annonce] = await db.select().from(annonces);
        const photos = await db.select().from(annonceMedia).where(eq(annonceMedia.annonceId, annonce.id));
        expect(photos.map((photo) => photo.position)).toEqual([0, 1]);
        expect(annonce.communeCode).toBe('77288');
        expect(annonce.priceType).toBe('quote');
    });

    it('creates validated professionals with their zones, never showing the phone', async () => {
        await seedContent(db, memoryStorage(), smallData(), fakeFetchImage);
        const [pro] = await db.select().from(professionalProfiles);
        expect(pro.status).toBe('validated');
        expect(pro.showPhone).toBe(false);
        expect(pro.displayName).toBe('Jean Dupont');
        expect(pro.coverMediaId).not.toBeNull();

        const zones = await db.select().from(professionalZones);
        expect(zones.map((zone) => zone.id).sort()).toEqual(['city-77288', 'department-77']);
    });

    it('fetches each photo url once and stores it under the seed prefix', async () => {
        const storage = memoryStorage();
        const fetched: string[] = [];
        await seedContent(db, storage, smallData(), async (url) => {
            fetched.push(url);
            return fakeFetchImage();
        });
        expect(fetched.sort()).toEqual([
            'https://example.test/a1.jpg',
            'https://example.test/a2.jpg',
            'https://example.test/cover.jpg',
        ]);
        expect(storage.keys.every((key) => key.startsWith('seed/'))).toBe(true);
    });

    it('leaves the same counts when run twice', async () => {
        await seedContent(db, memoryStorage(), smallData(), fakeFetchImage);
        const second = await seedContent(db, memoryStorage(), smallData(), fakeFetchImage);
        expect(second).toEqual({ professionals: 1, annonces: 1, offers: 0, requests: 1, photos: 3 });
        expect(await countRows(professionalProfiles)).toBe(1);
        expect(await countRows(annonces)).toBe(1);
        expect(await countRows(requests)).toBe(1);
    });

    it('throws on an unknown commune and leaves the tables unchanged', async () => {
        await seedContent(db, memoryStorage(), smallData(), fakeFetchImage);
        await expect(
            seedContent(db, memoryStorage(), smallData('Atlantis', '99'), fakeFetchImage),
        ).rejects.toThrow('Unknown commune: Atlantis (99)');
        // The first seed is still there: the truncate was rolled back
        expect(await countRows(professionalProfiles)).toBe(1);
        expect(await countRows(annonces)).toBe(1);
    });
});
