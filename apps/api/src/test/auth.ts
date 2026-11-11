import type { Express } from 'express';
import { pino, type Logger } from 'pino';
import request from 'supertest';
import { createApp } from '../app';
import { TERMS_VERSION, type AuthConfig } from '../config/authConfig';
import type { Database } from '../db/client';
import { createAuth, type Auth } from '../features/auth/auth';
import { MemoryEmailSender } from '../shared/email/memoryEmailSender';

// ============================================
// AUTH TEST HELPERS — an app with a real Better Auth instance on the test
// database, e-mails kept in memory, and a one-call sign-in for the tests of
// member routes.
// ============================================

/** Settings of the test instance. The secret is a test value, never used outside the tests */
export const TEST_AUTH_CONFIG: AuthConfig = {
    secret: 'test-only-secret-not-used-anywhere-else-0123456789',
    allowedHosts: ['localhost:4000', '127.0.0.1:4000'],
    fallbackUrl: 'http://localhost:4000',
    ipAddressHeaders: ['cf-connecting-ip'],
    trustedOrigins: ['sialty://', 'exp://'],
    termsVersion: TERMS_VERSION,
};

/** Origin sent by the app (the expo plugin turns its `expo-origin` header into this) */
export const APP_ORIGIN = 'sialty://';

// Better Auth limits per network address (3 code requests a minute): every
// call gets its own address, so one test never uses up another one's quota
let ipCounter = 0;

/** @returns A network address no other call of this test run has used (TEST-NET / private ranges) */
export const nextTestIp = (): string => {
    ipCounter += 1;
    return `10.${Math.floor(ipCounter / 65_536) % 256}.${Math.floor(ipCounter / 256) % 256}.${ipCounter % 256}`;
};

/**
 * Builds an app with its own Better Auth instance (own memory rate limiter).
 * @param db The test database
 * @param options logger: to capture the logs (silent by default)
 * @returns The app, the auth instance and the in-memory mailbox
 */
export const createAuthTestApp = (
    db: Database,
    options: { logger?: Logger } = {},
): { app: Express; auth: Auth; mail: MemoryEmailSender } => {
    const logger = options.logger ?? pino({ level: 'silent' });
    const mail = new MemoryEmailSender();
    const auth = createAuth({ db, emailSender: mail, config: TEST_AUTH_CONFIG, logger });
    return { app: createApp({ db, auth, logger }), auth, mail };
};

/**
 * Asks a sign-in code, reads it from the mailbox, signs in (creates the
 * account the first time).
 * @param options firstName (default 'Sophie'), acceptTerms (default true), ip (default: a new one)
 * @returns The `Cookie` header value to send with member requests
 */
export const signInForTest = async (
    app: Express,
    mail: MemoryEmailSender,
    email: string,
    options: { firstName?: string; acceptTerms?: boolean; ip?: string } = {},
): Promise<string> => {
    const ip = options.ip ?? nextTestIp();
    const sent = await request(app)
        .post('/v1/auth/email-otp/send-verification-otp')
        .set('cf-connecting-ip', ip)
        .send({ email, type: 'sign-in' });
    if (sent.status !== 200) throw new Error(`code request refused: ${sent.status}`);

    const otp = mail.lastCodeFor(email);
    const signedIn = await request(app)
        .post('/v1/auth/sign-in/email-otp')
        .set('cf-connecting-ip', ip)
        .send({ email, otp, name: options.firstName ?? 'Sophie', acceptTerms: options.acceptTerms ?? true });
    if (signedIn.status !== 200) throw new Error(`sign-in refused: ${signedIn.status} ${String(signedIn.body?.code)}`);

    return cookieHeaderFrom(signedIn);
};

/**
 * @param response An answer carrying Set-Cookie headers
 * @returns The "name=value; name2=value2" string a client sends back
 */
export const cookieHeaderFrom = (response: request.Response): string => {
    const setCookie = response.headers['set-cookie'] as unknown as string[] | undefined;
    return (setCookie ?? []).map((cookie) => cookie.split(';')[0]).join('; ');
};
