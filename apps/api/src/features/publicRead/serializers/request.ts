import { getRequestStatus, type Audience, type MemberRequest, type PublicRequest, type VisitorRequest } from '@sialty/domain';
import { assertMemberRow, blurred, toMemberMedia, toMemberPlace, toMemberSinceMonth, toVisitorMedia, toVisitorPlace } from './common';
import type { MemberRequestRow, VisitorRequestRow } from './rows';

// ============================================
// REQUEST serializers (an individual's need). Visitor: the author's first name
// is a fixed 10-character fake (the visitor query never reads first_name, not
// even its length), no initial. Member: "Sophie M.", never the last name.
// ============================================

/** Fake first name length: always the smallest bucket, whatever the real name */
const FIRST_NAME_PLACEHOLDER_LENGTH = 10;

/**
 * @param row      request row (a member row is accepted for a visitor: only allowed keys are read)
 * @param audience who reads; 'member' requires a member row, or throws
 * @param now      current time, for the computed 'expired' status (injectable for tests)
 */
export function serializeRequest(row: VisitorRequestRow, audience: 'visitor', now?: Date): VisitorRequest;
export function serializeRequest(row: MemberRequestRow, audience: 'member', now?: Date): MemberRequest;
export function serializeRequest(
    row: VisitorRequestRow | MemberRequestRow,
    audience: Audience,
    now?: Date,
): PublicRequest;
export function serializeRequest(
    row: VisitorRequestRow | MemberRequestRow,
    audience: Audience,
    now: Date = new Date(),
): PublicRequest {
    const expiresAt = row.expiresAt.toISOString();
    // Fields both audiences read the same way
    const common = {
        id: row.id,
        title: row.title,
        tradeId: row.tradeId,
        categoryId: row.categoryId,
        urgency: row.urgency,
        status: getRequestStatus({ status: row.status, expiresAt }, now),
        publishedAt: row.createdAt.toISOString(),
        expiresAt,
    };
    // Month only ("YYYY-MM"): the exact timestamp would link all the requests of one person
    const memberSince = toMemberSinceMonth(row.authorMemberSince);

    if (audience === 'member') {
        assertMemberRow(
            row,
            ['description', 'authorFirstName', 'authorLastNameInitial', 'latitude', 'longitude', 'communeCode'],
            'request',
        );
        const member = row as MemberRequestRow;
        return {
            ...common,
            ...toMemberPlace(member),
            description: member.description,
            photos: member.photos.map(toMemberMedia),
            author: {
                firstName: member.authorFirstName,
                // Defensive: keep one character even if the repository sent more
                lastNameInitial: member.authorLastNameInitial?.slice(0, 1) ?? null,
                memberSince,
            },
        };
    }
    return {
        ...common,
        ...toVisitorPlace(row),
        description: blurred(row.descriptionLength),
        photos: row.photos.map(toVisitorMedia),
        author: { firstName: blurred(FIRST_NAME_PLACEHOLDER_LENGTH), memberSince },
    };
}
