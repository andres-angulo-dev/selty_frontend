import type { Audience, MemberAnnonce, PublicAnnonce, VisitorAnnonce } from '@sialty/domain';
import { assertMemberRow, blurred, toMemberMedia, toMemberPlace, toVisitorMedia, toVisitorPlace } from './common';
import { serializeProfessionalSummary } from './professional';
import type { MemberAnnonceRow, VisitorAnnonceRow } from './rows';

// ============================================
// ANNONCE serializers. Readable for everyone: title, trade, price, city,
// department, date. Visitor: description and photos blurred, no location.
// ============================================

/**
 * @param row      annonce row (a member row is accepted for a visitor: only allowed keys are read)
 * @param audience who reads; 'member' requires a member row, or throws
 */
export function serializeAnnonce(row: VisitorAnnonceRow, audience: 'visitor'): VisitorAnnonce;
export function serializeAnnonce(row: MemberAnnonceRow, audience: 'member'): MemberAnnonce;
export function serializeAnnonce(row: VisitorAnnonceRow | MemberAnnonceRow, audience: Audience): PublicAnnonce;
export function serializeAnnonce(row: VisitorAnnonceRow | MemberAnnonceRow, audience: Audience): PublicAnnonce {
    // Fields both audiences read the same way
    const common = {
        id: row.id,
        title: row.title,
        tradeId: row.tradeId,
        categoryId: row.categoryId,
        priceType: row.priceType,
        ...(row.price !== null && { price: row.price }),
        publishedAt: row.createdAt.toISOString(),
    };

    if (audience === 'member') {
        assertMemberRow(row, ['description', 'latitude', 'longitude', 'communeCode'], 'annonce');
        const member = row as MemberAnnonceRow;
        return {
            ...common,
            ...toMemberPlace(member),
            description: member.description,
            photos: member.photos.map(toMemberMedia),
            professional: serializeProfessionalSummary(member.professional, 'member'),
        };
    }
    return {
        ...common,
        ...toVisitorPlace(row),
        description: blurred(row.descriptionLength),
        photos: row.photos.map(toVisitorMedia),
        professional: serializeProfessionalSummary(row.professional, 'visitor'),
    };
}
