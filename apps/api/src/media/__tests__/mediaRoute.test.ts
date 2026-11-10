import sharp from 'sharp';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { media } from '../../db/schema';
import { createTestDb } from '../../test/db';
import { insertProfile, resetContent } from '../../test/factories';
import { LocalDiskStorage } from '../objectStorage';
import { processImage, storeImage } from '../processImage';

// ============================================
// GET /v1/media/*: only the blurred version is public; the path is checked
// before the disk is touched.
// ============================================

const { db, close } = createTestDb();
let root: string;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'sialty-media-'));
    await mkdir(path.join(root, 'a/b'), { recursive: true });
    await writeFile(path.join(root, 'a/b/blur.webp'), 'blur-bytes');
    await writeFile(path.join(root, 'a/b/1080.webp'), 'big-bytes');
    app = createApp({ storage: new LocalDiskStorage(root) });
});

afterAll(async () => {
    await resetContent(db);
    await close();
    await rm(root, { recursive: true, force: true });
});

describe('GET /v1/media/*key', () => {
    it('serves a blurred image with long immutable caching', async () => {
        const response = await request(app).get('/v1/media/a/b/blur.webp');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('image/webp');
        expect(response.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    });

    it('refuses the sharp versions', async () => {
        expect((await request(app).get('/v1/media/a/b/1080.webp')).status).toBe(404);
    });

    it('refuses an encoded path traversal', async () => {
        expect((await request(app).get('/v1/media/..%2F..%2Fpackage.json')).status).toBe(404);
    });

    it('refuses dot segments', async () => {
        expect((await request(app).get('/v1/media/a/../../x/blur.webp')).status).toBe(404);
    });

    it('answers a problem document when the file is missing', async () => {
        const response = await request(app).get('/v1/media/a/zzz/blur.webp');
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
        expect(response.body).toMatchObject({ status: 404 });
    });
});

describe('storeImage', () => {
    it('stores three files, a media row, and the blur is then served', async () => {
        const ownerId = await insertProfile(db);
        const input = await sharp({
            create: { width: 600, height: 400, channels: 3, background: '#36c' },
        })
            .jpeg()
            .toBuffer();
        const storage = new LocalDiskStorage(root);

        const mediaId = await storeImage(storage, db, input, 'annonce', ownerId);
        const rows = await db.select().from(media);
        const row = rows.find((r) => r.id === mediaId)!;

        expect(row).toMatchObject({
            ownerProfileId: ownerId,
            width: 600,
            height: 400,
        });
        expect(row.blurKey).toMatch(/^annonce\/[0-9a-f-]{36}\/blur\.webp$/);
        expect(await storage.get(row.key400)).not.toBeNull();
        expect(await storage.get(row.key1080)).not.toBeNull();

        const response = await request(app).get(`/v1/media/${row.blurKey}`);
        expect(response.status).toBe(200);
        expect((await processImage(input)).blur.length).toBeGreaterThan(0);
    });
});
