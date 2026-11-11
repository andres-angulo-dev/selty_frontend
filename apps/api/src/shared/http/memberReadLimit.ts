import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { HttpProblem } from './problem';

// ============================================
// MEMBER READ LIMIT — members read the public data in clear, so one account
// must not be able to scrape it. Counted per ACCOUNT over one hour (a new IP
// does not reset it); visitors are skipped (they see blurred data and stay
// under the per-IP baseline).
// ============================================

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * @param maxPerHour Reads allowed per account and hour (LIMITS.memberReadsPerHour)
 * @returns A middleware to mount on the routes that answer in clear.
 *          Security: keyed by `req.viewer.userId` (server-checked session);
 *          the 429 is a problem document and carries no counter headers.
 */
export const memberReadLimit = (maxPerHour: number): RequestHandler =>
    rateLimit({
        windowMs: ONE_HOUR_MS,
        limit: maxPerHour,
        standardHeaders: false,
        legacyHeaders: false,
        skip: (req) => !req.viewer,
        // Non-null: skip() already let only requests with a viewer through
        keyGenerator: (req) => req.viewer!.userId,
        handler: (_req, _res, next) => next(new HttpProblem(429, 'Too many requests')),
        // The key is an account id, not an IP address
        validate: { keyGeneratorIpFallback: false },
    });
