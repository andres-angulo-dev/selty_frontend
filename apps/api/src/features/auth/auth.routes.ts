import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';
import type { Auth } from './auth';

// ============================================
// AUTH ROUTES — Better Auth's own routes under /v1/auth/* (send a code, sign
// in, get the session, sign out...). Their answers keep Better Auth's format
// ({ code, message } on error), not our problem documents.
// Mounted BEFORE express.json() (app.ts): Better Auth reads the raw body
// itself; a body already read by express.json() would leave it waiting.
// ============================================

/**
 * @param auth The Better Auth instance (createAuth)
 * @returns Router handing every /v1/auth/* request to Better Auth
 */
export const authRoutes = (auth: Auth): Router => {
    const router = Router();
    // Express 5 wildcard syntax: "*splat" (a bare "*" is refused)
    router.all('/v1/auth/*splat', toNodeHandler(auth));
    return router;
};
