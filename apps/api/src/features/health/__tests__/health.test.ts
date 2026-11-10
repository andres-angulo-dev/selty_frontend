import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app';
import type { Database } from '../../../db/client';
import { createTestDb } from '../../../test/db';

// ============================================
// /v1/health also says whether the database answers: a server that runs but
// cannot reach its data is not healthy.
// ============================================

const { db, close } = createTestDb();

afterAll(async () => {
    await close();
});

describe('GET /v1/health with a database', () => {
    it('answers ok when the database answers', async () => {
        const response = await request(createApp({ db })).get('/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok', database: 'ok' });
    });

    it('answers 503 when the database does not answer', async () => {
        // Only what the health route uses: a query that fails
        const brokenDb = {
            execute: () => Promise.reject(new Error('connect ECONNREFUSED 127.0.0.1:5432')),
        } as unknown as Database;

        const response = await request(createApp({ db: brokenDb })).get('/v1/health');
        expect(response.status).toBe(503);
        expect(response.headers['content-type']).toMatch(/^application\/problem\+json/);
        expect(response.body.title).toBe('Database unavailable');
        // The driver's message (address, port) stays in the logs
        expect(response.text).not.toMatch(/ECONNREFUSED|5432/);
    });
});
