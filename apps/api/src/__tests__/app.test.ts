import { Router } from 'express';
import { pino } from 'pino';
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

describe('logs', () => {
    it('never write the session token or the cookies', async () => {
        const lines: string[] = [];
        const logger = pino({ level: 'info' }, { write: (line: string) => lines.push(line) });

        await request(createApp({ logger }))
            .get('/v1/health')
            .set('Authorization', 'Bearer secret-token')
            .set('Cookie', 'session=secret-cookie');

        const output = lines.join('');
        expect(output).toContain('request completed');
        expect(output).not.toContain('secret-token');
        expect(output).not.toContain('secret-cookie');
    });
});

describe('rate limit behind the tunnel', () => {
    // "r=" in the RateLimit header = requests left for this client
    const remaining = (response: request.Response): string | undefined =>
        /r=(\d+)/.exec(String(response.headers.ratelimit))?.[1];

    it('counts each real client separately when one proxy hop is trusted', async () => {
        const proxied = createApp({ trustProxyHops: 1 });
        const first = await request(proxied).get('/v1/health').set('X-Forwarded-For', '203.0.113.1');
        const second = await request(proxied).get('/v1/health').set('X-Forwarded-For', '203.0.113.2');
        expect(remaining(first)).toBe('299');
        expect(remaining(second)).toBe('299');
    });

    it('ignores X-Forwarded-For when no proxy is trusted, so a client cannot fake its address', async () => {
        const direct = createApp({});
        await request(direct).get('/v1/health').set('X-Forwarded-For', '203.0.113.1');
        const second = await request(direct).get('/v1/health').set('X-Forwarded-For', '203.0.113.2');
        expect(remaining(second)).toBe('298');
    });
});

describe('security headers', () => {
    it('sets nosniff and hides the framework', async () => {
        const response = await request(app).get('/v1/health');
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-powered-by']).toBeUndefined();
    });
});
