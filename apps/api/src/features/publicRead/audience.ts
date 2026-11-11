import type { Audience } from '@sialty/domain';
import type { Request, Response } from 'express';

// ============================================
// AUDIENCE — who reads a public route: a visitor (no account) or a member
// (signed in). It decides which columns the repository reads, how the
// serializers shape the answer, and how caches may keep it.
// ============================================

/** Cache header of every member answer, success or error */
export const MEMBER_CACHE_CONTROL = 'private, no-store';

/**
 * @param req The incoming request, after loadViewer
 * @returns 'member' when loadViewer found a signed-in person, else 'visitor'.
 *          Security: only the server-checked session counts, never a
 *          client-sent flag.
 */
export const resolveAudience = (req: Request): Audience => (req.viewer ? 'member' : 'visitor');

/**
 * @param audience    Who reads
 * @param publicValue The route's shared-cache value for visitors
 * @returns 'private, no-store' for a member (Security: clear texts must never
 *          sit in a shared cache nor on the phone's disk), else publicValue
 */
export const cacheControlFor = (audience: Audience, publicValue: string): string =>
    audience === 'member' ? MEMBER_CACHE_CONTROL : publicValue;

/**
 * Marks an answer as depending on who asks, before the route runs, so error
 * answers carry it too. The session travels in `Cookie` (the Expo client) and
 * possibly `Authorization`: shared caches must key on both. A member's answer
 * (404 / 410 / 400 included) is private from here; the route sets the
 * success value with cacheControlFor.
 * @param req The incoming request, after loadViewer
 * @param res The answer being built
 */
export const markAudienceDependent = (req: Request, res: Response): void => {
    res.vary('Authorization');
    res.vary('Cookie');
    if (resolveAudience(req) === 'member') res.set('Cache-Control', MEMBER_CACHE_CONTROL);
};
