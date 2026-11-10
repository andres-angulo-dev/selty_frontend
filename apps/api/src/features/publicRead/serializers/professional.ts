import {
    estimateCityRadiusKm,
    type Audience,
    type MemberProfessional,
    type MemberProfessionalSummary,
    type MemberZone,
    type PublicProfessional,
    type PublicProfessionalSummary,
    type VisitorProfessional,
    type VisitorProfessionalSummary,
    type VisitorZone,
} from '@sialty/domain';
import {
    assertMemberRow,
    blurred,
    departmentName,
    regionName,
    toMemberMedia,
    toMemberPlace,
    toVisitorMedia,
    toVisitorPlace,
} from './common';
import type {
    MemberProfessionalRow,
    MemberProfessionalSummaryRow,
    MemberZoneRow,
    VisitorProfessionalRow,
    VisitorProfessionalSummaryRow,
    VisitorZoneRow,
} from './rows';

// ============================================
// PROFESSIONAL serializers. Never a phone, an email or a rating, whatever the
// audience: those keys are simply not listed. Only displayName is public,
// never the manager's first / last name.
// ============================================

/** A zone for a visitor: no id (it holds the commune code), no coordinates */
const toVisitorZone = (zone: VisitorZoneRow): VisitorZone => {
    switch (zone.kind) {
        case 'city':
            return {
                kind: 'city',
                city: zone.city,
                department: departmentName(zone.departmentCode),
                departmentCode: zone.departmentCode,
                radiusKm: zone.radiusKm,
            };
        case 'department':
            return { kind: 'department', code: zone.departmentCode, name: departmentName(zone.departmentCode) };
        case 'region':
            return { kind: 'region', code: zone.regionCode, name: regionName(zone.regionCode) };
        case 'country':
            return { kind: 'country' };
    }
};

/** A zone for a member: same shape as the domain ServiceZone, city size computed from its surface */
const toMemberZone = (zone: MemberZoneRow): MemberZone => {
    switch (zone.kind) {
        case 'city':
            return {
                kind: 'city',
                id: zone.id,
                communeCode: zone.communeCode,
                city: zone.city,
                department: departmentName(zone.departmentCode),
                departmentCode: zone.departmentCode,
                latitude: zone.latitude,
                longitude: zone.longitude,
                cityRadiusKm: estimateCityRadiusKm(zone.surfaceHectares),
                radiusKm: zone.radiusKm,
            };
        case 'department':
            return {
                kind: 'department',
                id: zone.id,
                code: zone.departmentCode,
                name: departmentName(zone.departmentCode),
            };
        case 'region':
            return { kind: 'region', id: zone.id, code: zone.regionCode, name: regionName(zone.regionCode) };
        case 'country':
            return { kind: 'country', id: zone.id };
    }
};

/**
 * "Proposed by" block of an annonce or an offer.
 * @param row      summary row (a member row is accepted for a visitor: only allowed keys are read)
 * @param audience who reads
 */
export function serializeProfessionalSummary(
    row: VisitorProfessionalSummaryRow,
    audience: 'visitor',
): VisitorProfessionalSummary;
export function serializeProfessionalSummary(
    row: MemberProfessionalSummaryRow,
    audience: 'member',
): MemberProfessionalSummary;
export function serializeProfessionalSummary(
    row: VisitorProfessionalSummaryRow | MemberProfessionalSummaryRow,
    audience: Audience,
): PublicProfessionalSummary;
export function serializeProfessionalSummary(
    row: VisitorProfessionalSummaryRow | MemberProfessionalSummaryRow,
    audience: Audience,
): PublicProfessionalSummary {
    if (audience === 'member') {
        assertMemberRow(row, ['displayName'], 'professional summary');
        const member = row as MemberProfessionalSummaryRow;
        return {
            id: member.id,
            displayName: member.displayName,
            tradeIds: [...member.tradeIds],
            ...(member.avatar && { avatar: toMemberMedia(member.avatar) }),
        };
    }
    return {
        id: row.id,
        displayName: blurred(row.displayNameLength),
        tradeIds: [...row.tradeIds],
        ...(row.avatar && { avatar: toVisitorMedia(row.avatar) }),
    };
}

/**
 * Professional page.
 * @param row      professional row (a member row is accepted for a visitor: only allowed keys are read)
 * @param audience who reads; 'member' requires a member row, or throws
 * @returns visitor: name / description blurred, photos blurred, no location; member: clear, commune center
 */
export function serializeProfessional(row: VisitorProfessionalRow, audience: 'visitor'): VisitorProfessional;
export function serializeProfessional(row: MemberProfessionalRow, audience: 'member'): MemberProfessional;
export function serializeProfessional(
    row: VisitorProfessionalRow | MemberProfessionalRow,
    audience: Audience,
): PublicProfessional;
export function serializeProfessional(
    row: VisitorProfessionalRow | MemberProfessionalRow,
    audience: Audience,
): PublicProfessional {
    if (audience === 'member') {
        assertMemberRow(row, ['displayName', 'description', 'latitude', 'longitude', 'communeCode'], 'professional');
        const member = row as MemberProfessionalRow;
        return {
            id: member.id,
            displayName: member.displayName,
            description: member.description,
            tradeIds: [...member.tradeIds],
            services: [...member.services],
            ...toMemberPlace(member),
            locationType: member.locationType,
            memberSince: member.memberSince.toISOString(),
            ...(member.startingPrice !== null && { startingPrice: member.startingPrice }),
            ...(member.avatar && { avatar: toMemberMedia(member.avatar) }),
            ...(member.cover && { cover: toMemberMedia(member.cover) }),
            zones: member.zones.map(toMemberZone),
        };
    }
    return {
        id: row.id,
        displayName: blurred(row.displayNameLength),
        description: blurred(row.descriptionLength),
        tradeIds: [...row.tradeIds],
        services: [...row.services],
        ...toVisitorPlace(row),
        locationType: row.locationType,
        memberSince: row.memberSince.toISOString(),
        ...(row.startingPrice !== null && { startingPrice: row.startingPrice }),
        ...(row.avatar && { avatar: toVisitorMedia(row.avatar) }),
        ...(row.cover && { cover: toVisitorMedia(row.cover) }),
        zones: row.zones.map(toVisitorZone),
    };
}
