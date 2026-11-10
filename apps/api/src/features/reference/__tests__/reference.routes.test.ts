import { CATEGORIES, TRADES } from '@sialty/domain';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app';
import { createTestDb } from '../../../test/db';
import { resetContent } from '../../../test/factories';

// ============================================
// Reference routes: the trades and categories, read from the tables that
// syncReference fills from @sialty/domain (done by the test globalSetup).
// ============================================

const { db, close } = createTestDb();
let app: ReturnType<typeof createApp>;

beforeAll(() => {
    app = createApp({ db });
});

afterAll(async () => {
    await resetContent(db);
    await close();
});

describe('GET /v1/trades', () => {
    it('lists the 20 trades with a long cache', async () => {
        const response = await request(app).get('/v1/trades');
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('public, max-age=3600');
        expect(response.body.items).toHaveLength(20);
        expect(response.body.items).toHaveLength(TRADES.length);
        const painter = response.body.items.find((trade: { id: string }) => trade.id === 'trade-painter');
        expect(Object.keys(painter).sort()).toEqual(['categoryId', 'id', 'isRemoteCapable', 'label']);
    });
});

describe('GET /v1/categories', () => {
    it('lists the 8 categories as id and name only, never the app-only "Toutes"', async () => {
        const response = await request(app).get('/v1/categories');
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('public, max-age=3600');
        expect(response.body.items).toHaveLength(8);
        expect(response.body.items.map((item: { id: string }) => item.id)).not.toContain('cat-all');
        expect(response.body.items).toHaveLength(CATEGORIES.length);
        for (const item of response.body.items) expect(Object.keys(item).sort()).toEqual(['id', 'name']);
    });
});
