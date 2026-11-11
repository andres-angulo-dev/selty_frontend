import { fromNodeHeaders } from 'better-auth/node';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';
import type { Database } from '../../db/client';
import { profiles } from '../../db/schema';
import type { Auth } from './auth';

// ============================================
// VIEWER — who sends the request: the signed-in person behind a valid session
// cookie, or nobody (a visitor). Read once per request, before the routes, so
// every route asks the same question the same way (resolveAudience).
// ============================================

/** A signed-in member: the login (Better Auth user) and the person (profile) */
export interface Viewer {
    userId: string;
    profileId: string;
}

// Express Request augmentation. Express 5 types declare Request in
// 'express-serve-static-core' (the 'express' Request extends it), so the field
// is added there; kept next to the middleware that sets it.
declare module 'express-serve-static-core' {
    interface Request {
        /** Set by loadViewer for a signed-in member; absent for a visitor */
        viewer?: Viewer;
    }
}

/**
 * Reads the session cookie and sets `req.viewer` for a signed-in member.
 * - No `Cookie` header → visitor, without any database call (most public reads).
 * - Session unknown, forged, expired or revoked → visitor (Better Auth answers null).
 * - Valid session whose user has no profile → visitor: only a person is a member.
 * - Thrown error (database down) → next(error): a 500, never a silent visitor
 *   answer that would hide the outage.
 * Security: the session is checked by Better Auth on the server (signature,
 * database row, expiry); nothing the client sends is trusted as a role.
 * Security: the cookie is never logged here (pino-http redacts the header).
 * @param auth The Better Auth instance
 * @param db   The database (profile lookup)
 * @returns The middleware
 */
export const loadViewer = (auth: Auth, db: Database): RequestHandler => async (req, _res, next) => {
    if (!req.headers.cookie) {
        next();
        return;
    }
    try {
        const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!result) {
            next();
            return;
        }
        const [profile] = await db
            .select({ id: profiles.id })
            .from(profiles)
            .where(eq(profiles.userId, result.user.id))
            .limit(1);
        if (profile) req.viewer = { userId: result.user.id, profileId: profile.id };
        next();
    } catch (error) {
        next(error);
    }
};
