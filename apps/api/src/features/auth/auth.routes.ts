import { toNodeHandler } from 'better-auth/node';
import { Router, type RequestHandler } from 'express';
import { LIMITS } from '../../config/limits';
import { HttpProblem } from '../../shared/http/problem';
import type { Auth } from './auth';

// ============================================
// AUTH ROUTES — the Better Auth routes the app uses, under /v1/auth/* (send a
// code, sign in, read the session, sign out, manage one's sessions). Their
// answers keep Better Auth's format ({ code, message } on error); what this
// file refuses itself answers with our problem documents.
// Mounted BEFORE express.json() (app.ts): Better Auth reads the raw body
// itself; a body already read by express.json() would leave it waiting.
// ============================================

/**
 * The only "METHOD path" pairs that reach Better Auth.
 * Security: fail-closed; a Better Auth upgrade cannot open a new route
 * silently. Everything else (update-user, the password endpoints of the code
 * plugin, check-verification-otp, sign-up/email, social and account routes...)
 * answers 404 before Better Auth sees it. `auth.api` (server calls) is not
 * concerned: it never goes through HTTP.
 */
export const AUTH_ALLOWED_ROUTES: readonly string[] = [
    'POST /v1/auth/email-otp/send-verification-otp',
    'POST /v1/auth/sign-in/email-otp',
    'GET /v1/auth/get-session',
    'POST /v1/auth/sign-out',
    'GET /v1/auth/list-sessions',
    'POST /v1/auth/revoke-session',
    'POST /v1/auth/revoke-sessions',
    'POST /v1/auth/revoke-other-sessions',
    'GET /v1/auth/ok',
];

const ALLOWED = new Set(AUTH_ALLOWED_ROUTES);

/**
 * Security: express.json() and its size cap run after this router, so the cap
 * is applied here, before Better Auth reads the body: a body must announce its
 * size (Content-Length), and that size must fit LIMITS.jsonBodyMax. Node reads
 * exactly Content-Length bytes, so the announced size is the real one.
 * A chunked body (Transfer-Encoding, no length) → 411; too big → 413.
 */
export const authBodySizeGuard: RequestHandler = (req, _res, next) => {
    const length = req.headers['content-length'];
    if (length === undefined) {
        next(req.headers['transfer-encoding'] !== undefined ? new HttpProblem(411, 'Length required') : undefined);
        return;
    }
    // Fail closed: a length that is not a whole number counts as too large
    const size = Number(length);
    next(!Number.isInteger(size) || size > LIMITS.jsonBodyMax ? new HttpProblem(413, 'Payload too large') : undefined);
};

/**
 * Lets through only the AUTH_ALLOWED_ROUTES. The comparison is exact (case,
 * trailing slash, encoded characters): any variation is refused, never guessed.
 */
const authAllowlist: RequestHandler = (req, _res, next) => {
    next(ALLOWED.has(`${req.method} ${req.path}`) ? undefined : new HttpProblem(404, 'Not found'));
};

/**
 * Security: sign-in answers carry the session token in their body, so no
 * cache (browser, proxy, tunnel) may keep any /v1/auth answer. Set before the
 * guards so the 404 / 411 / 413 problems carry it too.
 */
const noStore: RequestHandler = (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
};

/**
 * @param auth The Better Auth instance (createAuth)
 * @returns Router: no-store header, body size guard, then the allowlist, then Better Auth
 */
export const authRoutes = (auth: Auth): Router => {
    const router = Router();
    // Express 5 wildcard syntax: "*splat" (a bare "*" is refused)
    router.all('/v1/auth/*splat', noStore, authBodySizeGuard, authAllowlist, toNodeHandler(auth));
    return router;
};
