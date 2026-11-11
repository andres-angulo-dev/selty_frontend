import { eq } from 'drizzle-orm';
import type { MeResponse } from '@sialty/domain';
import type { Database } from '../../db/client';
import { professionalProfiles, profiles, user } from '../../db/schema';
import type { Viewer } from '../auth/viewer';
import { toMemberSinceMonth } from '../publicRead/serializers/common';

/**
 * Reads the account of the signed-in member: person, login e-mail and optional
 * professional profile (any status: the owner may see a pending or refused one).
 * Security: the e-mail comes from the user's own row (by viewer.userId) and is
 * only ever sent back to that user; the last name is cut to its initial and no
 * phone number is read at all.
 * @param db     The database
 * @param viewer The signed-in member (from loadViewer)
 * @returns The answer of GET /v1/me
 * @throws Error when the account vanished between loadViewer and this read (a 500)
 */
export const readMe = async (db: Database, viewer: Viewer): Promise<MeResponse> => {
    const [row] = await db
        .select({
            profileId: profiles.id,
            email: user.email,
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            memberSince: profiles.memberSince,
            professionalId: professionalProfiles.id,
            professionalStatus: professionalProfiles.status,
            professionalDisplayName: professionalProfiles.displayName,
        })
        .from(profiles)
        .innerJoin(user, eq(user.id, profiles.userId))
        .leftJoin(professionalProfiles, eq(professionalProfiles.profileId, profiles.id))
        .where(eq(profiles.id, viewer.profileId))
        .limit(1);
    if (!row) throw new Error('Signed-in member without profile');

    const initial = row.lastName?.trim().charAt(0).toUpperCase();
    return {
        profileId: row.profileId,
        email: row.email,
        firstName: row.firstName,
        lastInitial: initial ? initial : null,
        memberSince: toMemberSinceMonth(row.memberSince) as MeResponse['memberSince'],
        professional:
            row.professionalId && row.professionalStatus && row.professionalDisplayName !== null
                ? { id: row.professionalId, status: row.professionalStatus, displayName: row.professionalDisplayName }
                : null,
    };
};
