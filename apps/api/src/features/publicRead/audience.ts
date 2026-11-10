import type { Audience } from '@sialty/domain';
import type { Request } from 'express';

// ============================================
// AUDIENCE — who reads a public route: a visitor (no account) or a member
// (signed in). It decides which columns the repository reads and how the
// serializers shape the answer.
// ============================================

/**
 * @param _req The incoming request (its Authorization header, from plan 3)
 * @returns Always 'visitor' for now: there is no sign-in yet. Plan 3 returns
 *          'member' for a valid session. Never trust a client-sent flag here.
 */
export const resolveAudience = (_req: Request): Audience => 'visitor';
