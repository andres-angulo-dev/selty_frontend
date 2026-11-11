import express, { type Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../errorHandler';
import { memberReadLimit } from '../memberReadLimit';

// ============================================
// Read limit per member: counted by account, visitors left to the per-IP baseline.
// A tiny app: the header x-test-user stands for what loadViewer would set.
// ============================================

let app: Express;

beforeEach(() => {
    app = express();
    app.use((req, _res, next) => {
        const userId = req.header('x-test-user');
        if (userId) req.viewer = { userId, profileId: `profile-${userId}` };
        next();
    });
    app.use(memberReadLimit(2));
    app.get('/read', (_req, res) => {
        res.json({ ok: true });
    });
    app.use(errorHandler);
});

const read = (userId?: string) => {
    const pending = request(app).get('/read');
    return userId ? pending.set('x-test-user', userId) : pending;
};

describe('memberReadLimit', () => {
    it('the 3rd read with a limit of 2 → 429 for that account only', async () => {
        expect((await read('a')).status).toBe(200);
        expect((await read('a')).status).toBe(200);
        const third = await read('a');

        expect(third.status).toBe(429);
        expect(third.headers['content-type']).toContain('application/problem+json');
        expect((await read('b')).status).toBe(200);
    });

    it('visitors are not counted', async () => {
        for (let i = 0; i < 5; i += 1) expect((await read()).status).toBe(200);
    });
});
