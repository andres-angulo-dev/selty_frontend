import type { Audience, MemberOffer, PublicOffer, VisitorOffer } from '@sialty/domain';
import {
    assertMemberRow,
    blurred,
    isoOrUndefined,
    toMemberMedia,
    toMemberPlace,
    toVisitorMedia,
    toVisitorPlace,
} from './common';
import { serializeProfessionalSummary } from './professional';
import type { MemberOfferRow, VisitorOfferRow } from './rows';

// ============================================
// OFFER serializers. Readable for everyone: title, trade, offer type (discount,
// conditions), dates, city, department. Placed at the professional's commune.
// ============================================

/**
 * @param row      offer row (a member row is accepted for a visitor: only allowed keys are read)
 * @param audience who reads; 'member' requires a member row, or throws
 */
export function serializeOffer(row: VisitorOfferRow, audience: 'visitor'): VisitorOffer;
export function serializeOffer(row: MemberOfferRow, audience: 'member'): MemberOffer;
export function serializeOffer(row: VisitorOfferRow | MemberOfferRow, audience: Audience): PublicOffer;
export function serializeOffer(row: VisitorOfferRow | MemberOfferRow, audience: Audience): PublicOffer {
    const startsAt = isoOrUndefined(row.startsAt);
    const expiresAt = isoOrUndefined(row.expiresAt);
    // Fields both audiences read the same way; absent dates / discount are left out
    const common = {
        id: row.id,
        title: row.title,
        tradeId: row.tradeId,
        categoryId: row.categoryId,
        ...(row.discount !== null && { discount: row.discount }),
        conditions: [...row.conditions],
        publishedAt: row.createdAt.toISOString(),
        ...(startsAt && { startsAt }),
        ...(expiresAt && { expiresAt }),
    };

    if (audience === 'member') {
        assertMemberRow(row, ['description', 'latitude', 'longitude', 'communeCode'], 'offer');
        const member = row as MemberOfferRow;
        return {
            ...common,
            ...toMemberPlace(member),
            description: member.description,
            ...(member.photo && { photo: toMemberMedia(member.photo) }),
            professional: serializeProfessionalSummary(member.professional, 'member'),
        };
    }
    return {
        ...common,
        ...toVisitorPlace(row),
        description: blurred(row.descriptionLength),
        ...(row.photo && { photo: toVisitorMedia(row.photo) }),
        professional: serializeProfessionalSummary(row.professional, 'visitor'),
    };
}
