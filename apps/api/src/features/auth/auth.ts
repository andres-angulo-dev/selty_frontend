import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import type { Logger } from 'pino';
import type { AuthConfig } from '../../config/authConfig';
import type { Database } from '../../db/client';
import { account, session, user, verification } from '../../db/schema';
import type { EmailSender } from '../../shared/email/emailSender';
import { signInCodeEmail } from './emails';
import { createSignUpGuard } from './signUpGuard';

// ============================================
// AUTH — the Better Auth instance: sign-in (and sign-up) by e-mail code only,
// sessions stored in the database. Its routes are mounted by auth.routes.ts;
// `auth.api` gives the server calls (getSession) to our own routes.
// Values checked by the spike of 2026-11-11 (tasks/specs, Better Auth 1.7.20).
// ============================================

/** E-mail code: 6 digits, valid 10 minutes, 5 tries */
const CODE = { length: 6, validSeconds: 600, allowedAttempts: 5 } as const;

/** Session: 30 days, pushed back at most once a day while the account is used */
const SESSION = { expiresInSeconds: 2_592_000, updateAgeSeconds: 86_400 } as const;

export interface AuthDeps {
    db: Database;
    /** Sends the codes (SMTP in development, memory in tests) */
    emailSender: EmailSender;
    config: AuthConfig;
    logger: Logger;
}

/**
 * Better Auth's own messages go to our logger, message only.
 * Security: the extra arguments (errors, objects) can carry an e-mail or a
 * token, so they are dropped; the message text alone is kept.
 * @param logger The server logger
 * @returns Better Auth's `logger` option
 */
const betterAuthLogger = (logger: Logger) => ({
    level: 'warn' as const,
    log: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => {
        logger[level]({ source: 'better-auth' }, message);
    },
});

/**
 * @param deps Database, e-mail sender, settings, logger
 * @returns The Better Auth instance (`handler` for the routes, `api` for server calls)
 */
export const createAuth = ({ db, emailSender, config, logger }: AuthDeps) => {
    const signUpGuard = createSignUpGuard({ db, termsVersion: config.termsVersion, logger });

    return betterAuth({
        // Under /v1 like the rest of the API (Better Auth's default is /api/auth)
        basePath: '/v1/auth',
        // The tunnel address changes at each start: the allowed hosts may hold a
        // wildcard outside production (env.ts refuses it in production)
        baseURL: { allowedHosts: config.allowedHosts, fallback: config.fallbackUrl },
        // Security: signs the session cookie. From the environment, checked at start-up
        secret: config.secret,
        database: drizzleAdapter(db, { provider: 'pg', schema: { user, session, account, verification } }),
        // Security: origins allowed to send cookie requests (sign-out...): the app
        // scheme always, Expo Go's exp:// outside production only (authConfig.ts)
        trustedOrigins: config.trustedOrigins,
        session: { expiresIn: SESSION.expiresInSeconds, updateAge: SESSION.updateAgeSeconds },
        advanced: {
            // Security: the header that carries the client address behind the
            // tunnel. Only trustworthy when the API is reached through that proxy
            // (HOST=127.0.0.1 keeps it so locally); used by the limits below.
            ipAddress: { ipAddressHeaders: config.ipAddressHeaders },
            // Security: Better Auth 1.7.20 skips its Origin check (cookie requests
            // from an untrusted origin) when it detects a test run. Forced on so
            // the tests check what production does.
            disableOriginCheck: false,
        },
        // Security: Better Auth turns its limiter off outside production; forced
        // on so dev and tests run the same limits (e-mail code plugin: 3 requests
        // a minute per address on send and sign-in). Memory store: one process
        // only, until the hosting choice (a shared store is needed with several).
        rateLimit: { enabled: true },
        logger: betterAuthLogger(logger),
        databaseHooks: {
            user: {
                create: { before: signUpGuard.before, after: signUpGuard.after },
            },
        },
        plugins: [
            // Reads the app's `expo-origin` header as its Origin
            expo(),
            emailOTP({
                otpLength: CODE.length,
                expiresIn: CODE.validSeconds,
                allowedAttempts: CODE.allowedAttempts,
                // Security: stored hashed, a database leak gives no usable code
                storeOTP: 'hashed',
                sendVerificationOTP: async ({ email, otp, type }) => {
                    // Only the sign-in code is used (no password, no e-mail change yet):
                    // other types send nothing
                    if (type !== 'sign-in') return;
                    await emailSender.send(signInCodeEmail(email, otp, CODE.validSeconds / 60));
                    // Security: the type only, never the code nor the address
                    logger.info({ type }, 'sign-in code sent');
                },
            }),
        ],
    });
};

export type Auth = ReturnType<typeof createAuth>;
