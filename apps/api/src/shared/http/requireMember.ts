import type { RequestHandler } from 'express';
import { HttpProblem } from './problem';

/**
 * Lets only a signed-in member through.
 * Security: reads `req.viewer`, set by loadViewer from a server-checked
 * session; nothing the client sends is trusted as an identity.
 * @returns 401 `Sign-in required` as a problem document when nobody is signed in
 */
export const requireMember: RequestHandler = (req, _res, next) => {
    if (!req.viewer) {
        next(new HttpProblem(401, 'Sign-in required'));
        return;
    }
    next();
};
