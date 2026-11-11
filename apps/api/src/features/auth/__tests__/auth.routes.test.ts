import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { eq } from 'drizzle-orm';
import type { Express } from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TERMS_VERSION } from '../../../config/authConfig';
import { profiles, session, user, verification } from '../../../db/schema';
import type { MemoryEmailSender } from '../../../shared/email/memoryEmailSender';
import {
    APP_ORIGIN,
    cookieHeaderFrom,
    createAuthTestApp,
    nextTestIp,
    signInForTest,
} from '../../../test/auth';
import { createTestDb } from '../../../test/db';
import { resetContent } from '../../../test/factories';
import { profileWriter } from '../signUpGuard';

// ============================================
// /v1/auth (Better Auth): sign-in and sign-up by e-mail code, the sign-up
// guard (first name + terms), what the client may not choose, the limits on
// codes, sign-out, and what never reaches the logs.
// ============================================

const { db, close } = createTestDb();
let app: Express;
let mail: MemoryEmailSender;

beforeEach(async () => {
    await resetContent(db);
    // Fresh instance and mailbox per test. Better Auth's memory limiter store is
    // module-global (shared by every instance): tests stay independent because
    // every call uses its own network address (nextTestIp)
    ({ app, mail } = createAuthTestApp(db));
});

afterEach(() => {
    vi.restoreAllMocks();
});

afterAll(async () => {
    await resetContent(db);
    await close();
});

/** POST send-verification-otp (type sign-in) from one network address */
const requestCode = (target: Express, email: string, ip: string) =>
    request(target)
        .post('/v1/auth/email-otp/send-verification-otp')
        .set('cf-connecting-ip', ip)
        .send({ email, type: 'sign-in' });

/** POST sign-in/email-otp with any body, from one network address */
const submitCode = (target: Express, body: Record<string, unknown>, ip: string) =>
    request(target).post('/v1/auth/sign-in/email-otp').set('cf-connecting-ip', ip).send(body);

/** Asks a code and returns it (fails the test when no e-mail was sent) */
const codeFor = async (email: string, ip: string): Promise<string> => {
    const sent = await requestCode(app, email, ip);
    expect(sent.status).toBe(200);
    const code = mail.lastCodeFor(email);
    expect(code).toMatch(/^\d{6}$/);
    return code as string;
};

const userRows = () => db.select().from(user);

describe('sign-up by e-mail code', () => {
    it('signs up with a code: user, profile with terms date and version, session cookie', async () => {
        const ip = nextTestIp();
        const otp = await codeFor('sophie@example.fr', ip);
        const before = Date.now();

        const response = await submitCode(app, { email: 'sophie@example.fr', otp, name: '  Sophie ', acceptTerms: true }, ip);

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('Sophie');
        const [created] = await userRows();
        expect(created).toMatchObject({ email: 'sophie@example.fr', name: 'Sophie', emailVerified: true, image: null });

        const [profile] = await db.select().from(profiles).where(eq(profiles.userId, created.id));
        expect(profile.firstName).toBe('Sophie');
        expect(profile.termsVersion).toBe(TERMS_VERSION);
        expect(profile.termsAcceptedAt?.getTime()).toBeGreaterThanOrEqual(before - 1000);

        expect(cookieHeaderFrom(response)).toContain('session_token=');
        const sessions = await db.select().from(session).where(eq(session.userId, created.id));
        expect(sessions).toHaveLength(1);
    });

    it.each([
        ['missing', undefined],
        ['false', false],
        ['the string "true"', 'true'],
    ])('refuses a sign-up without acceptTerms (%s): 400 TERMS_NOT_ACCEPTED, no user row', async (_label, acceptTerms) => {
        const ip = nextTestIp();
        const otp = await codeFor('nina@example.fr', ip);

        const response = await submitCode(app, { email: 'nina@example.fr', otp, name: 'Nina', acceptTerms }, ip);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('TERMS_NOT_ACCEPTED');
        expect(await userRows()).toHaveLength(0);
        expect(await db.select().from(profiles)).toHaveLength(0);
    });

    it.each([
        ['empty', ''],
        ['absent', undefined],
        ['51 characters', 'a'.repeat(51)],
        ['with a digit', 'Jean2'],
        ['a phone number', '06 12 34 56 78'],
    ])('refuses invalid first names (%s): 400 FIRST_NAME_INVALID, no user row', async (_label, name) => {
        const ip = nextTestIp();
        const otp = await codeFor('jean@example.fr', ip);

        const response = await submitCode(app, { email: 'jean@example.fr', otp, name, acceptTerms: true }, ip);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('FIRST_NAME_INVALID');
        expect(await userRows()).toHaveLength(0);
    });

    it('an existing account signs in again without acceptTerms nor name', async () => {
        await signInForTest(app, mail, 'marc@example.fr', { firstName: 'Marc' });
        const ip = nextTestIp();
        const otp = await codeFor('marc@example.fr', ip);

        const response = await submitCode(app, { email: 'marc@example.fr', otp }, ip);

        expect(response.status).toBe(200);
        const users = await userRows();
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Marc');
        expect(await db.select().from(profiles)).toHaveLength(1);
    });

    it('Paul@X.fr and paul@x.fr are the same account', async () => {
        await signInForTest(app, mail, 'Paul@X.fr', { firstName: 'Paul' });
        const ip = nextTestIp();
        const otp = await codeFor('paul@x.fr', ip);

        const response = await submitCode(app, { email: 'paul@x.fr', otp }, ip);

        expect(response.status).toBe(200);
        const users = await userRows();
        expect(users).toHaveLength(1);
        expect(users[0].email).toBe('paul@x.fr');
    });

    it('ignores client-chosen server fields (image, emailVerified, id, role)', async () => {
        const ip = nextTestIp();
        const otp = await codeFor('lea@example.fr', ip);

        const response = await submitCode(
            app,
            {
                email: 'lea@example.fr',
                otp,
                name: 'Léa',
                acceptTerms: true,
                image: 'https://attacker.example/avatar.png',
                emailVerified: false,
                id: 'chosen-by-the-client',
                role: 'admin',
            },
            ip,
        );

        expect(response.status).toBe(200);
        const [created] = await userRows();
        expect(created.id).not.toBe('chosen-by-the-client');
        expect(created.image).toBeNull();
        expect(created.emailVerified).toBe(true);
        // Nothing role-like stored, neither in the row nor in the answer
        expect(Object.keys(created)).not.toContain('role');
        expect(JSON.stringify(created)).not.toContain('admin');
        expect(JSON.stringify(response.body.user)).not.toContain('admin');
    });

    it('removes the account when its profile cannot be created', async () => {
        vi.spyOn(profileWriter, 'insertForUser').mockRejectedValueOnce(new Error('profile insert failed'));
        const ip = nextTestIp();
        const otp = await codeFor('hugo@example.fr', ip);

        const response = await submitCode(app, { email: 'hugo@example.fr', otp, name: 'Hugo', acceptTerms: true }, ip);

        expect(response.status).toBeGreaterThanOrEqual(500);
        expect(await userRows()).toHaveLength(0);
        expect(await db.select().from(session)).toHaveLength(0);
        expect(await db.select().from(profiles)).toHaveLength(0);
    });
});

describe('codes', () => {
    it('refuses after 5 wrong codes: 403 TOO_MANY_ATTEMPTS', async () => {
        const otp = await codeFor('eve@example.fr', nextTestIp());
        const wrong = otp === '000000' ? '111111' : '000000';

        // Each attempt from another address: the attempt counter belongs to the
        // code, so spreading the guesses over many addresses does not help
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await submitCode(app, { email: 'eve@example.fr', otp: wrong }, nextTestIp());
            expect(response.status).toBe(400);
            expect(response.body.code).toBe('INVALID_OTP');
        }
        const sixth = await submitCode(
            app,
            { email: 'eve@example.fr', otp, name: 'Eve', acceptTerms: true },
            nextTestIp(),
        );

        expect(sixth.status).toBe(403);
        expect(sixth.body.code).toBe('TOO_MANY_ATTEMPTS');
        expect(await userRows()).toHaveLength(0);
    });

    it('stores the code hashed', async () => {
        const otp = await codeFor('hash@example.fr', nextTestIp());

        const rows = await db.select().from(verification);

        expect(rows).toHaveLength(1);
        expect(rows[0].value).not.toContain(otp);
        expect(rows[0].identifier).not.toContain(otp);
    });

    it('limits code requests per network address: 4th send in a minute from one cf-connecting-ip → 429, another address still allowed', async () => {
        const ip = nextTestIp();
        for (const email of ['a@example.fr', 'b@example.fr', 'c@example.fr']) {
            expect((await requestCode(app, email, ip)).status).toBe(200);
        }

        expect((await requestCode(app, 'd@example.fr', ip)).status).toBe(429);
        expect((await requestCode(app, 'd@example.fr', nextTestIp())).status).toBe(200);
    });
});

describe('sign-out', () => {
    it('sign-out with Origin sialty:// deletes the session', async () => {
        const cookie = await signInForTest(app, mail, 'out@example.fr');
        expect(await db.select().from(session)).toHaveLength(1);

        const response = await request(app)
            .post('/v1/auth/sign-out')
            .set('cf-connecting-ip', nextTestIp())
            .set('Origin', APP_ORIGIN)
            .set('Cookie', cookie)
            .send({});

        expect(response.status).toBe(200);
        expect(await db.select().from(session)).toHaveLength(0);
    });

    it('refuses a sign-out from an untrusted origin (https://evil.example): the session stays', async () => {
        const cookie = await signInForTest(app, mail, 'stay@example.fr');

        const response = await request(app)
            .post('/v1/auth/sign-out')
            .set('cf-connecting-ip', nextTestIp())
            .set('Origin', 'https://evil.example')
            .set('Cookie', cookie)
            .send({});

        expect(response.status).toBe(403);
        expect(response.body.code).toBe('INVALID_ORIGIN');
        expect(await db.select().from(session)).toHaveLength(1);
    });
});

describe('allowlist of Better Auth routes', () => {
    it.each([
        ['POST', '/v1/auth/update-user'],
        ['POST', '/v1/auth/email-otp/reset-password'],
        ['POST', '/v1/auth/forget-password/email-otp'],
        ['POST', '/v1/auth/email-otp/check-verification-otp'],
        ['POST', '/v1/auth/change-password'],
        ['POST', '/v1/auth/sign-up/email'],
        ['GET', '/v1/auth/list-accounts'],
        // Variations of an allowed route are refused too, never guessed
        ['GET', '/v1/auth/sign-in/email-otp'],
        ['POST', '/v1/auth/Sign-Out'],
        ['POST', '/v1/auth/sign-out/'],
    ])('answers 404 (problem document) to %s %s, even signed in', async (method, path) => {
        const cookie = await signInForTest(app, mail, 'list@example.fr', { firstName: 'Lise' });

        const call = method === 'GET' ? request(app).get(path) : request(app).post(path).send({ name: 'Jean2' });
        const response = await call
            .set('cf-connecting-ip', nextTestIp())
            .set('Origin', APP_ORIGIN)
            .set('Cookie', cookie);

        expect(response.status).toBe(404);
        expect(response.headers['content-type']).toContain('application/problem+json');
        const [row] = await userRows();
        expect(row.name).toBe('Lise');
    });

    it('lets the session routes through: get-session reads the signed-in account', async () => {
        const cookie = await signInForTest(app, mail, 'session@example.fr', { firstName: 'Sam' });

        const response = await request(app)
            .get('/v1/auth/get-session')
            .set('cf-connecting-ip', nextTestIp())
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('Sam');
    });
});

describe('body size of /v1/auth', () => {
    it('answers 413 to a 200 kb body, before Better Auth reads it', async () => {
        const response = await request(app)
            .post('/v1/auth/sign-in/email-otp')
            .set('cf-connecting-ip', nextTestIp())
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ email: 'big@example.fr', otp: '123456', name: 'x'.repeat(200 * 1024) }));

        expect(response.status).toBe(413);
        expect(response.headers['content-type']).toContain('application/problem+json');
    });

    it('answers 411 to a chunked body without Content-Length', async () => {
        const server = app.listen(0, '127.0.0.1');
        await once(server, 'listening');
        try {
            const { port } = server.address() as AddressInfo;
            const status = await new Promise<number>((resolve, reject) => {
                const outgoing = http.request(
                    {
                        host: '127.0.0.1',
                        port,
                        method: 'POST',
                        path: '/v1/auth/email-otp/send-verification-otp',
                        // No Content-Length: Node sends the body chunked
                        headers: { 'content-type': 'application/json', 'cf-connecting-ip': nextTestIp() },
                    },
                    (incoming) => {
                        incoming.resume();
                        resolve(incoming.statusCode ?? 0);
                    },
                );
                outgoing.on('error', reject);
                outgoing.write('{"email":"chunk@example.fr",');
                outgoing.end('"type":"sign-in"}');
            });

            expect(status).toBe(411);
            expect(mail.sent).toHaveLength(0);
        } finally {
            server.close();
        }
    });

    it('a normal sign-in is not affected', async () => {
        await expect(signInForTest(app, mail, 'normal@example.fr')).resolves.toContain('session_token=');
    });
});

describe('logs', () => {
    it('never logs the code, the token or the e-mail', async () => {
        const lines: string[] = [];
        const logger = pino({ level: 'debug' }, { write: (line: string) => lines.push(line) });
        const logged = createAuthTestApp(db, { logger });
        const email = 'secret.person@example.fr';
        const ip = nextTestIp();

        const sent = await requestCode(logged.app, email, ip);
        expect(sent.status).toBe(200);
        const otp = logged.mail.lastCodeFor(email) as string;
        const signedIn = await submitCode(logged.app, { email, otp, name: 'Secret', acceptTerms: true }, ip);
        expect(signedIn.status).toBe(200);
        const token = signedIn.body.token as string;
        const cookieValue = cookieHeaderFrom(signedIn).split('=').slice(1).join('=');

        const output = lines.join('');
        expect(output).toContain('request completed');
        expect(token.length).toBeGreaterThan(10);
        expect(cookieValue.length).toBeGreaterThan(10);
        // Not inside a longer number: a 6-digit code could appear by chance in a timestamp
        expect(output).not.toMatch(new RegExp(`(?<!\\d)${otp}(?!\\d)`));
        expect(output).not.toContain(token);
        expect(output).not.toContain(cookieValue);
        expect(output).not.toContain(email);
        expect(output).not.toContain('secret.person');
    });
});
