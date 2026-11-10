import { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from '../app';
import { validate } from '../shared/http/validate';

// ============================================
// The skeleton: health route, problem+json errors (RFC 9457), security headers.
// Routes under /v1/__test exist only in this file, to trigger each error case.
// ============================================

const testRoutes = Router();
testRoutes.post('/v1/__test/echo', validate({ body: z.object({ title: z.string().min(1) }) }), (req, res) => {
    res.json(req.body);
});
testRoutes.get('/v1/__test/crash', () => {
    throw new Error('secret internal detail');
});
testRoutes.get('/v1/__test/async-crash', async () => {
    throw new Error('secret async detail');
});

const app = createApp({ extraRoutes: testRoutes });

describe('GET /v1/health', () => {
    it('answers ok', async () => {
        const response = await request(app).get('/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});

describe('errors', () => {
    it('answers 404 as a problem document for an unknown route', async () => {
        const response = await request(app).get('/v1/nope');
        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toMatch(/^application\/problem\+json/);
        expect(response.body).toEqual({ type: 'about:blank', title: 'Not found', status: 404, instance: '/v1/nope' });
    });

    it('answers 400 Malformed JSON for a broken body', async () => {
        const response = await request(app)
            .post('/v1/__test/echo')
            .set('Content-Type', 'application/json')
            .send('{"title":');
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({ title: 'Malformed JSON', status: 400 });
    });

    it('answers 400 with the invalid fields', async () => {
        const response = await request(app).post('/v1/__test/echo').send({ title: '' });
        expect(response.status).toBe(400);
        expect(response.body.title).toBe('Invalid request');
        expect(response.body.errors).toEqual([{ field: 'title', message: expect.any(String) }]);
    });

    it('passes a valid body to the route, parsed', async () => {
        const response = await request(app).post('/v1/__test/echo').send({ title: 'Bonjour', extra: 1 });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ title: 'Bonjour' });
    });

    it('answers 413 when the body is too large', async () => {
        const response = await request(app)
            .post('/v1/__test/echo')
            .send({ title: 'x'.repeat(200_000) });
        expect(response.status).toBe(413);
        expect(response.body.title).toBe('Payload too large');
    });

    it.each(['/v1/__test/crash', '/v1/__test/async-crash'])(
        'answers 500 on %s without leaking the message or the stack',
        async (path) => {
            const response = await request(app).get(path);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ type: 'about:blank', title: 'Internal error', status: 500, instance: path });
            expect(response.text).not.toMatch(/secret/);
            expect(response.text).not.toMatch(/\bat\s/);
        },
    );
});

describe('security headers', () => {
    it('sets nosniff and hides the framework', async () => {
        const response = await request(app).get('/v1/health');
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-powered-by']).toBeUndefined();
    });
});
