import type { Audience } from '@sialty/domain';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';
import { alias, type AnyPgColumn, type SelectedFields } from 'drizzle-orm/pg-core';
import type { Database } from '../../db/client';
import {
    annonceMedia,
    annonces,
    communes,
    media,
    offers,
    professionalProfiles,
    professionalTrades,
    professionalZones,
    profiles,
    requestMedia,
    requests,
    trades,
} from '../../db/schema';
import type {
    MemberAnnonceRow,
    MemberMediaRow,
    MemberOfferRow,
    MemberProfessionalRow,
    MemberProfessionalSummaryRow,
    MemberRequestRow,
    MemberZoneRow,
    VisitorAnnonceRow,
    VisitorMediaRow,
    VisitorOfferRow,
    VisitorProfessionalRow,
    VisitorProfessionalSummaryRow,
    VisitorRequestRow,
    VisitorZoneRow,
} from './serializers/rows';

// ============================================
// PUBLIC READ REPOSITORY — the SQL behind the detail routes.
// Security (spec, visitor rule): a visitor query LISTS its columns and never
// reads description, display_name, first_name, last_name, services or phone. The real
// text is not even read from the database: the *_length generated columns are
// enough for the fake text. Member queries add the clear columns on top of the
// visitor ones. phone is read by no query at all (never in a response).
// Every query on professional content joins professional_profiles with
// status = 'validated': a pending or refused professional is invisible.
// ============================================

/** Outcome of a detail lookup: 'ended' = exists but no longer shown (410), 'missing' = 404 */
export type FindResult<Row> = { state: 'found'; row: Row } | { state: 'ended' } | { state: 'missing' };

/** Most items in a nested list (the professional's annonces / offers): same cap as a page */
const NESTED_LIST_MAX = 50;

// Second copies of media: one table, several roles in one query
const avatarMedia = alias(media, 'avatar_media');
const coverMedia = alias(media, 'cover_media');
const offerMedia = alias(media, 'offer_media');
// Communes of the zones, inside the zone subquery (the outer query already uses communes)
const ZONE_COMMUNES = 'zone_communes';
const zoneCommunes = alias(communes, ZONE_COMMUNES);

/** Join condition: the professional exists AND is validated */
const validatedProfessional = (professionalId: AnyPgColumn) =>
    and(eq(professionalProfiles.id, professionalId), eq(professionalProfiles.status, 'validated'));

// ============================================
// OFFER LIVENESS in SQL — mirrors isOfferLive (@sialty/domain, offerAvailability.ts).
// The rule is DAY-based, in French time (never the server's local time):
// live = active AND (no end OR end >= start of today) AND (no start OR start < start of tomorrow).
// `now() at time zone 'Europe/Paris'` is the Paris wall clock; date_trunc keeps
// its day; `at time zone 'Europe/Paris'` turns that midnight back into an instant
// (summer / winter time handled by Postgres).
// ============================================

const PARIS_TODAY_START = sql`(date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris')`;
const PARIS_TOMORROW_START = sql`((date_trunc('day', now() at time zone 'Europe/Paris') + interval '1 day') at time zone 'Europe/Paris')`;

/** SQL condition: the offer is running now (same boundaries as isOfferLive). Reused by the feed */
export const offerIsLive = sql<boolean>`(${offers.isActive}
    and (${offers.expiresAt} is null or ${offers.expiresAt} >= ${PARIS_TODAY_START})
    and (${offers.startsAt} is null or ${offers.startsAt} < ${PARIS_TOMORROW_START}))`;

/**
 * SQL condition: the request still waits for a professional (mirrors getRequestStatus:
 * 'expired' is computed from expires_at, never stored). Reused by the feed
 */
export const requestIsOpen = sql<boolean>`(${requests.status} = 'open' and ${requests.expiresAt} > now())`;

// ============================================
// SHARED FRAGMENTS
// ============================================

/** Commune center as numbers (PostGIS point: x = longitude, y = latitude) */
const latitudeOf = (center: typeof communes.center) => sql<number>`ST_Y(${center})`;
const longitudeOf = (center: typeof communes.center) => sql<number>`ST_X(${center})`;

/** Trades of the joined professional, main trade first */
const professionalTradeIds = sql<string[]>`coalesce((
    select array_agg(${professionalTrades.tradeId} order by ${professionalTrades.position})
    from ${professionalTrades}
    where ${professionalTrades.professionalId} = ${professionalProfiles.id}
), '{}'::text[])`;

/** One photo as JSON: blur key only for a visitor, plus the 1080 key for a member */
const mediaJson = (audience: Audience) =>
    audience === 'member'
        ? sql`json_build_object('blurKey', ${media.blurKey}, 'key1080', ${media.key1080})`
        : sql`json_build_object('blurKey', ${media.blurKey})`;

/** Photos of the joined annonce, in display order */
const annoncePhotos = (audience: Audience) => sql`coalesce((
    select json_agg(${mediaJson(audience)} order by ${annonceMedia.position})
    from ${annonceMedia} inner join ${media} on ${media.id} = ${annonceMedia.mediaId}
    where ${annonceMedia.annonceId} = ${annonces.id}
), '[]'::json)`;

/** Photos of the joined request, in display order */
const requestPhotos = (audience: Audience) => sql`coalesce((
    select json_agg(${mediaJson(audience)} order by ${requestMedia.position})
    from ${requestMedia} inner join ${media} on ${media.id} = ${requestMedia.mediaId}
    where ${requestMedia.requestId} = ${requests.id}
), '[]'::json)`;

/**
 * Zones of the joined professional with the commune of each city zone.
 * Visitor: no zone id (a city zone id holds the commune code), no coordinates.
 */
const professionalZoneList = (audience: Audience) => {
    const zone = audience === 'member'
        ? sql`json_build_object(
            'kind', ${professionalZones.kind}, 'id', ${professionalZones.id},
            'radiusKm', ${professionalZones.radiusKm}, 'departmentCode', ${professionalZones.departmentCode},
            'regionCode', ${professionalZones.regionCode}, 'communeCode', ${professionalZones.communeCode},
            'city', ${zoneCommunes.name}, 'cityDepartmentCode', ${zoneCommunes.departmentCode},
            'latitude', ST_Y(${zoneCommunes.center}), 'longitude', ST_X(${zoneCommunes.center}),
            'surfaceHectares', ${zoneCommunes.surfaceHectares})`
        : sql`json_build_object(
            'kind', ${professionalZones.kind},
            'radiusKm', ${professionalZones.radiusKm}, 'departmentCode', ${professionalZones.departmentCode},
            'regionCode', ${professionalZones.regionCode},
            'city', ${zoneCommunes.name}, 'cityDepartmentCode', ${zoneCommunes.departmentCode})`;
    // Inside a sql template an alias renders as its name only: the FROM names the real table, then the alias
    return sql`coalesce((
        select json_agg(${zone} order by ${professionalZones.id})
        from ${professionalZones}
        left join ${communes} ${sql.identifier(ZONE_COMMUNES)} on ${zoneCommunes.code} = ${professionalZones.communeCode}
        where ${professionalZones.professionalId} = ${professionalProfiles.id}
    ), '[]'::json)`;
};

/** A zone as aggregated above; member keys are absent from a visitor zone */
interface ZoneJson {
    kind: 'city' | 'department' | 'region' | 'country';
    id?: string;
    radiusKm: number | null;
    departmentCode: string | null;
    regionCode: string | null;
    communeCode?: string | null;
    city: string | null;
    cityDepartmentCode: string | null;
    latitude?: number | null;
    longitude?: number | null;
    surfaceHectares?: number | null;
}

/**
 * The database check guarantees each kind carries its own columns
 * (city → commune + radius...), so the non-null assertions below hold.
 */
const toVisitorZoneRow = (zone: ZoneJson): VisitorZoneRow => {
    switch (zone.kind) {
        case 'city':
            return { kind: 'city', city: zone.city!, departmentCode: zone.cityDepartmentCode!, radiusKm: zone.radiusKm! };
        case 'department':
            return { kind: 'department', departmentCode: zone.departmentCode! };
        case 'region':
            return { kind: 'region', regionCode: zone.regionCode! };
        case 'country':
            return { kind: 'country' };
    }
};

const toMemberZoneRow = (zone: ZoneJson): MemberZoneRow => {
    const id = zone.id!;
    switch (zone.kind) {
        case 'city':
            return {
                kind: 'city',
                id,
                city: zone.city!,
                departmentCode: zone.cityDepartmentCode!,
                radiusKm: zone.radiusKm!,
                communeCode: zone.communeCode!,
                latitude: zone.latitude!,
                longitude: zone.longitude!,
                surfaceHectares: zone.surfaceHectares ?? null,
            };
        case 'department':
            return { kind: 'department', id, departmentCode: zone.departmentCode! };
        case 'region':
            return { kind: 'region', id, regionCode: zone.regionCode! };
        case 'country':
            return { kind: 'country', id };
    }
};

// ============================================
// FLAT ROWS — each select*() picks the visitor or the member field set and
// returns flat rows (one key per selected column), then a to*Row() function
// turns them into the serializer rows of rows.ts, listing every key.
// Typing: Drizzle cannot type a join chain over a generic field set, so the
// select*() overloads name the flat row of each audience. The tests check
// both audiences' rows against the database.
// ============================================

// ============================================
// "PROPOSED BY" SUMMARY — joined into annonce and offer queries
// ============================================

const visitorSummaryFields = {
    proId: professionalProfiles.id,
    proDisplayNameLength: professionalProfiles.displayNameLength,
    proTradeIds: professionalTradeIds,
    proAvatarBlurKey: avatarMedia.blurKey,
};

const memberSummaryFields = {
    proDisplayName: professionalProfiles.displayName,
    proAvatarKey1080: avatarMedia.key1080,
};

interface VisitorSummaryFlat {
    proId: string;
    proDisplayNameLength: number;
    proTradeIds: string[];
    proAvatarBlurKey: string | null;
}

interface MemberSummaryFlat extends VisitorSummaryFlat {
    proDisplayName: string;
    proAvatarKey1080: string | null;
}

const toVisitorSummary = (row: VisitorSummaryFlat): VisitorProfessionalSummaryRow => ({
    id: row.proId,
    displayNameLength: row.proDisplayNameLength,
    tradeIds: row.proTradeIds,
    avatar: row.proAvatarBlurKey ? { blurKey: row.proAvatarBlurKey } : null,
});

const toMemberSummary = (row: MemberSummaryFlat): MemberProfessionalSummaryRow => ({
    ...toVisitorSummary(row),
    displayName: row.proDisplayName,
    avatar: row.proAvatarBlurKey && row.proAvatarKey1080
        ? { blurKey: row.proAvatarBlurKey, key1080: row.proAvatarKey1080 }
        : null,
});

/** A media pair read from a left join; null when there is no photo */
const toMemberMedia = (blurKey: string | null, key1080: string | null): MemberMediaRow | null =>
    blurKey && key1080 ? { blurKey, key1080 } : null;

// ============================================
// ANNONCES
// ============================================

const visitorAnnonceFields = () => ({
    id: annonces.id,
    isActive: annonces.isActive,
    title: annonces.title,
    descriptionLength: annonces.descriptionLength,
    tradeId: annonces.tradeId,
    categoryId: trades.categoryId,
    priceType: annonces.priceType,
    price: annonces.price,
    createdAt: annonces.createdAt,
    city: communes.name,
    departmentCode: communes.departmentCode,
    photos: annoncePhotos('visitor').mapWith((value: VisitorMediaRow[]) => value),
    ...visitorSummaryFields,
});

const memberAnnonceFields = () => ({
    ...visitorAnnonceFields(),
    description: annonces.description,
    communeCode: communes.code,
    latitude: latitudeOf(communes.center),
    longitude: longitudeOf(communes.center),
    photos: annoncePhotos('member').mapWith((value: MemberMediaRow[]) => value),
    ...memberSummaryFields,
});

type VisitorAnnonceFlat = Omit<VisitorAnnonceRow, 'photos' | 'professional'> & VisitorSummaryFlat & {
    isActive: boolean;
    photos: VisitorMediaRow[];
};
type MemberAnnonceFlat = Omit<MemberAnnonceRow, 'photos' | 'professional'> & MemberSummaryFlat & {
    isActive: boolean;
    photos: MemberMediaRow[];
};

/** Annonces of validated professionals, newest first, placed at their own commune */
function selectAnnonces(db: Database, audience: 'visitor', where: SQL | undefined, limit: number): Promise<VisitorAnnonceFlat[]>;
function selectAnnonces(db: Database, audience: 'member', where: SQL | undefined, limit: number): Promise<MemberAnnonceFlat[]>;
function selectAnnonces(db: Database, audience: Audience, where: SQL | undefined, limit: number): Promise<unknown[]> {
    // See FLAT ROWS: the field set decides the row shape, the overloads name it
    const fields: SelectedFields = audience === 'member' ? memberAnnonceFields() : visitorAnnonceFields();
    return db
        .select(fields)
        .from(annonces)
        .innerJoin(professionalProfiles, validatedProfessional(annonces.professionalId))
        .innerJoin(trades, eq(trades.id, annonces.tradeId))
        .innerJoin(communes, eq(communes.code, annonces.communeCode))
        .leftJoin(avatarMedia, eq(avatarMedia.id, professionalProfiles.avatarMediaId))
        .where(where)
        .orderBy(desc(annonces.createdAt), desc(annonces.id))
        .limit(limit);
}

// Every key listed: the row only carries what the serializer expects (no isActive)
const toVisitorAnnonceRow = (row: VisitorAnnonceFlat): VisitorAnnonceRow => ({
    id: row.id,
    title: row.title,
    descriptionLength: row.descriptionLength,
    tradeId: row.tradeId,
    categoryId: row.categoryId,
    priceType: row.priceType,
    price: row.price,
    createdAt: row.createdAt,
    city: row.city,
    departmentCode: row.departmentCode,
    photos: row.photos,
    professional: toVisitorSummary(row),
});

const toMemberAnnonceRow = (row: MemberAnnonceFlat): MemberAnnonceRow => ({
    ...toVisitorAnnonceRow(row),
    description: row.description,
    communeCode: row.communeCode,
    latitude: row.latitude,
    longitude: row.longitude,
    photos: row.photos,
    professional: toMemberSummary(row),
});

/**
 * One annonce.
 * @returns found (active, validated professional) | ended (inactive: 410) | missing
 */
export async function findAnnonce(db: Database, id: string, audience: 'visitor'): Promise<FindResult<VisitorAnnonceRow>>;
export async function findAnnonce(db: Database, id: string, audience: 'member'): Promise<FindResult<MemberAnnonceRow>>;
export async function findAnnonce(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorAnnonceRow | MemberAnnonceRow>>;
export async function findAnnonce(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorAnnonceRow | MemberAnnonceRow>> {
    if (audience === 'member') {
        const [row] = await selectAnnonces(db, 'member', eq(annonces.id, id), 1);
        if (!row) return { state: 'missing' };
        return row.isActive ? { state: 'found', row: toMemberAnnonceRow(row) } : { state: 'ended' };
    }
    const [row] = await selectAnnonces(db, 'visitor', eq(annonces.id, id), 1);
    if (!row) return { state: 'missing' };
    return row.isActive ? { state: 'found', row: toVisitorAnnonceRow(row) } : { state: 'ended' };
}

/**
 * Active annonces of one professional, newest first, at most NESTED_LIST_MAX.
 * Empty when the professional is not validated.
 * Overloads: a literal audience gives rows of that audience only.
 */
export async function listProfessionalAnnonces(
    db: Database,
    professionalId: string,
    audience: 'visitor',
): Promise<VisitorAnnonceRow[]>;
export async function listProfessionalAnnonces(
    db: Database,
    professionalId: string,
    audience: 'member',
): Promise<MemberAnnonceRow[]>;
export async function listProfessionalAnnonces(
    db: Database,
    professionalId: string,
    audience: Audience,
): Promise<(VisitorAnnonceRow | MemberAnnonceRow)[]>;
export async function listProfessionalAnnonces(
    db: Database,
    professionalId: string,
    audience: Audience,
): Promise<(VisitorAnnonceRow | MemberAnnonceRow)[]> {
    const where = and(eq(annonces.professionalId, professionalId), eq(annonces.isActive, true));
    if (audience === 'member') {
        return (await selectAnnonces(db, 'member', where, NESTED_LIST_MAX)).map(toMemberAnnonceRow);
    }
    return (await selectAnnonces(db, 'visitor', where, NESTED_LIST_MAX)).map(toVisitorAnnonceRow);
}

/**
 * Active annonces of validated professionals among `ids` (the feed picks the
 * ids, this function reads them with the same privacy rules as the detail).
 * @returns the rows found, in no particular order (the caller orders them)
 */
export async function listAnnoncesByIds(
    db: Database,
    ids: string[],
    audience: Audience,
): Promise<(VisitorAnnonceRow | MemberAnnonceRow)[]> {
    if (ids.length === 0) return [];
    const where = and(inArray(annonces.id, ids), eq(annonces.isActive, true));
    if (audience === 'member') {
        return (await selectAnnonces(db, 'member', where, ids.length)).map(toMemberAnnonceRow);
    }
    return (await selectAnnonces(db, 'visitor', where, ids.length)).map(toVisitorAnnonceRow);
}

// ============================================
// OFFERS (no commune of their own: placed at the professional's commune)
// ============================================

const visitorOfferFields = () => ({
    id: offers.id,
    isLive: offerIsLive,
    title: offers.title,
    descriptionLength: offers.descriptionLength,
    tradeId: offers.tradeId,
    categoryId: trades.categoryId,
    discount: offers.discount,
    conditions: offers.conditions,
    startsAt: offers.startsAt,
    expiresAt: offers.expiresAt,
    createdAt: offers.createdAt,
    city: communes.name,
    departmentCode: communes.departmentCode,
    photoBlurKey: offerMedia.blurKey,
    ...visitorSummaryFields,
});

const memberOfferFields = () => ({
    ...visitorOfferFields(),
    description: offers.description,
    communeCode: communes.code,
    latitude: latitudeOf(communes.center),
    longitude: longitudeOf(communes.center),
    photoKey1080: offerMedia.key1080,
    ...memberSummaryFields,
});

type VisitorOfferFlat = Omit<VisitorOfferRow, 'photo' | 'professional' | 'conditions'> & VisitorSummaryFlat & {
    isLive: boolean;
    conditions: string[];
    photoBlurKey: string | null;
};
type MemberOfferFlat = Omit<MemberOfferRow, 'photo' | 'professional' | 'conditions'> & MemberSummaryFlat & {
    isLive: boolean;
    conditions: string[];
    photoBlurKey: string | null;
    photoKey1080: string | null;
};

/** Offers of validated professionals, newest first, placed at the professional's commune */
function selectOffers(db: Database, audience: 'visitor', where: SQL | undefined, limit: number): Promise<VisitorOfferFlat[]>;
function selectOffers(db: Database, audience: 'member', where: SQL | undefined, limit: number): Promise<MemberOfferFlat[]>;
function selectOffers(db: Database, audience: Audience, where: SQL | undefined, limit: number): Promise<unknown[]> {
    const fields: SelectedFields = audience === 'member' ? memberOfferFields() : visitorOfferFields();
    return db
        .select(fields)
        .from(offers)
        .innerJoin(professionalProfiles, validatedProfessional(offers.professionalId))
        .innerJoin(trades, eq(trades.id, offers.tradeId))
        .innerJoin(communes, eq(communes.code, professionalProfiles.communeCode))
        .leftJoin(avatarMedia, eq(avatarMedia.id, professionalProfiles.avatarMediaId))
        .leftJoin(offerMedia, eq(offerMedia.id, offers.mediaId))
        .where(where)
        .orderBy(desc(offers.createdAt), desc(offers.id))
        .limit(limit);
}

const toVisitorOfferRow = (row: VisitorOfferFlat): VisitorOfferRow => ({
    id: row.id,
    title: row.title,
    descriptionLength: row.descriptionLength,
    tradeId: row.tradeId,
    categoryId: row.categoryId,
    discount: row.discount,
    // The offers_conditions_check constraint only lets known OfferCondition values in
    conditions: row.conditions as VisitorOfferRow['conditions'],
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    city: row.city,
    departmentCode: row.departmentCode,
    photo: row.photoBlurKey ? { blurKey: row.photoBlurKey } : null,
    professional: toVisitorSummary(row),
});

const toMemberOfferRow = (row: MemberOfferFlat): MemberOfferRow => ({
    ...toVisitorOfferRow(row),
    description: row.description,
    communeCode: row.communeCode,
    latitude: row.latitude,
    longitude: row.longitude,
    photo: toMemberMedia(row.photoBlurKey, row.photoKey1080),
    professional: toMemberSummary(row),
});

/**
 * One offer.
 * @returns found (live, validated professional) | ended (inactive, not started or over: 410) | missing
 */
export async function findOffer(db: Database, id: string, audience: 'visitor'): Promise<FindResult<VisitorOfferRow>>;
export async function findOffer(db: Database, id: string, audience: 'member'): Promise<FindResult<MemberOfferRow>>;
export async function findOffer(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorOfferRow | MemberOfferRow>>;
export async function findOffer(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorOfferRow | MemberOfferRow>> {
    if (audience === 'member') {
        const [row] = await selectOffers(db, 'member', eq(offers.id, id), 1);
        if (!row) return { state: 'missing' };
        return row.isLive ? { state: 'found', row: toMemberOfferRow(row) } : { state: 'ended' };
    }
    const [row] = await selectOffers(db, 'visitor', eq(offers.id, id), 1);
    if (!row) return { state: 'missing' };
    return row.isLive ? { state: 'found', row: toVisitorOfferRow(row) } : { state: 'ended' };
}

/**
 * Live offers of one professional, newest first, at most NESTED_LIST_MAX.
 * Overloads: a literal audience gives rows of that audience only.
 */
export async function listProfessionalOffers(
    db: Database,
    professionalId: string,
    audience: 'visitor',
): Promise<VisitorOfferRow[]>;
export async function listProfessionalOffers(
    db: Database,
    professionalId: string,
    audience: 'member',
): Promise<MemberOfferRow[]>;
export async function listProfessionalOffers(
    db: Database,
    professionalId: string,
    audience: Audience,
): Promise<(VisitorOfferRow | MemberOfferRow)[]>;
export async function listProfessionalOffers(
    db: Database,
    professionalId: string,
    audience: Audience,
): Promise<(VisitorOfferRow | MemberOfferRow)[]> {
    const where = and(eq(offers.professionalId, professionalId), offerIsLive);
    if (audience === 'member') {
        return (await selectOffers(db, 'member', where, NESTED_LIST_MAX)).map(toMemberOfferRow);
    }
    return (await selectOffers(db, 'visitor', where, NESTED_LIST_MAX)).map(toVisitorOfferRow);
}

/**
 * Live offers of validated professionals among `ids` (read for the feed).
 * @returns the rows found, in no particular order (the caller orders them)
 */
export async function listOffersByIds(
    db: Database,
    ids: string[],
    audience: Audience,
): Promise<(VisitorOfferRow | MemberOfferRow)[]> {
    if (ids.length === 0) return [];
    const where = and(inArray(offers.id, ids), offerIsLive);
    if (audience === 'member') {
        return (await selectOffers(db, 'member', where, ids.length)).map(toMemberOfferRow);
    }
    return (await selectOffers(db, 'visitor', where, ids.length)).map(toVisitorOfferRow);
}

// ============================================
// PROFESSIONAL PAGE (place = the professional's commune)
// ============================================

const visitorProfessionalFields = () => ({
    id: professionalProfiles.id,
    displayNameLength: professionalProfiles.displayNameLength,
    descriptionLength: professionalProfiles.descriptionLength,
    tradeIds: professionalTradeIds,
    // Free text: only the length of each service, in order (unnest is the one place the column appears)
    serviceLengths: sql<number[]>`array(
        select char_length(service.value)
        from unnest(${professionalProfiles.services}) with ordinality as service(value, position)
        order by service.position
    )`,
    locationType: professionalProfiles.locationType,
    startingPrice: professionalProfiles.startingPrice,
    memberSince: profiles.memberSince,
    city: communes.name,
    departmentCode: communes.departmentCode,
    avatarBlurKey: avatarMedia.blurKey,
    coverBlurKey: coverMedia.blurKey,
    zones: professionalZoneList('visitor').mapWith((value: ZoneJson[]) => value),
});

const memberProfessionalFields = () => ({
    ...visitorProfessionalFields(),
    displayName: professionalProfiles.displayName,
    description: professionalProfiles.description,
    services: professionalProfiles.services,
    communeCode: communes.code,
    latitude: latitudeOf(communes.center),
    longitude: longitudeOf(communes.center),
    avatarKey1080: avatarMedia.key1080,
    coverKey1080: coverMedia.key1080,
    zones: professionalZoneList('member').mapWith((value: ZoneJson[]) => value),
});

type VisitorProfessionalFlat = Omit<VisitorProfessionalRow, 'avatar' | 'cover' | 'zones'> & {
    avatarBlurKey: string | null;
    coverBlurKey: string | null;
    zones: ZoneJson[];
};
type MemberProfessionalFlat = Omit<MemberProfessionalRow, 'avatar' | 'cover' | 'zones'> & {
    avatarBlurKey: string | null;
    coverBlurKey: string | null;
    avatarKey1080: string | null;
    coverKey1080: string | null;
    zones: ZoneJson[];
};

/** One validated professional with their person (member since) and commune */
function selectProfessional(db: Database, audience: 'visitor', id: string): Promise<VisitorProfessionalFlat[]>;
function selectProfessional(db: Database, audience: 'member', id: string): Promise<MemberProfessionalFlat[]>;
function selectProfessional(db: Database, audience: Audience, id: string): Promise<unknown[]> {
    const fields: SelectedFields = audience === 'member' ? memberProfessionalFields() : visitorProfessionalFields();
    return db
        .select(fields)
        .from(professionalProfiles)
        .innerJoin(profiles, eq(profiles.id, professionalProfiles.profileId))
        .innerJoin(communes, eq(communes.code, professionalProfiles.communeCode))
        .leftJoin(avatarMedia, eq(avatarMedia.id, professionalProfiles.avatarMediaId))
        .leftJoin(coverMedia, eq(coverMedia.id, professionalProfiles.coverMediaId))
        .where(and(eq(professionalProfiles.id, id), eq(professionalProfiles.status, 'validated')))
        .limit(1);
}

const toVisitorProfessionalRow = (row: VisitorProfessionalFlat): VisitorProfessionalRow => ({
    id: row.id,
    displayNameLength: row.displayNameLength,
    descriptionLength: row.descriptionLength,
    tradeIds: row.tradeIds,
    serviceLengths: row.serviceLengths,
    locationType: row.locationType,
    startingPrice: row.startingPrice,
    memberSince: row.memberSince,
    city: row.city,
    departmentCode: row.departmentCode,
    avatar: row.avatarBlurKey ? { blurKey: row.avatarBlurKey } : null,
    cover: row.coverBlurKey ? { blurKey: row.coverBlurKey } : null,
    zones: row.zones.map(toVisitorZoneRow),
});

const toMemberProfessionalRow = (row: MemberProfessionalFlat): MemberProfessionalRow => ({
    ...toVisitorProfessionalRow(row),
    displayName: row.displayName,
    description: row.description,
    services: row.services,
    communeCode: row.communeCode,
    latitude: row.latitude,
    longitude: row.longitude,
    avatar: toMemberMedia(row.avatarBlurKey, row.avatarKey1080),
    cover: toMemberMedia(row.coverBlurKey, row.coverKey1080),
    zones: row.zones.map(toMemberZoneRow),
});

/**
 * One professional page (without the phone, read by no query).
 * @returns found (validated) | missing (unknown, pending or refused). Never 'ended'.
 */
export async function findProfessional(
    db: Database,
    id: string,
    audience: 'visitor',
): Promise<FindResult<VisitorProfessionalRow>>;
export async function findProfessional(
    db: Database,
    id: string,
    audience: 'member',
): Promise<FindResult<MemberProfessionalRow>>;
export async function findProfessional(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorProfessionalRow | MemberProfessionalRow>>;
export async function findProfessional(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorProfessionalRow | MemberProfessionalRow>> {
    if (audience === 'member') {
        const [row] = await selectProfessional(db, 'member', id);
        return row ? { state: 'found', row: toMemberProfessionalRow(row) } : { state: 'missing' };
    }
    const [row] = await selectProfessional(db, 'visitor', id);
    return row ? { state: 'found', row: toVisitorProfessionalRow(row) } : { state: 'missing' };
}

// ============================================
// REQUESTS (an individual's need: no professional involved)
// ============================================

const visitorRequestFields = () => ({
    id: requests.id,
    title: requests.title,
    descriptionLength: requests.descriptionLength,
    tradeId: requests.tradeId,
    categoryId: trades.categoryId,
    urgency: requests.urgency,
    status: requests.status,
    createdAt: requests.createdAt,
    expiresAt: requests.expiresAt,
    city: communes.name,
    departmentCode: communes.departmentCode,
    photos: requestPhotos('visitor').mapWith((value: VisitorMediaRow[]) => value),
    authorMemberSince: profiles.memberSince,
});

const memberRequestFields = () => ({
    ...visitorRequestFields(),
    description: requests.description,
    communeCode: communes.code,
    latitude: latitudeOf(communes.center),
    longitude: longitudeOf(communes.center),
    photos: requestPhotos('member').mapWith((value: MemberMediaRow[]) => value),
    authorFirstName: profiles.firstName,
    // Only the initial leaves the database, never the last name
    authorLastNameInitial: sql<string>`left(${profiles.lastName}, 1)`,
});

/** Requests matching `where`, with their author (member since) and commune */
function selectRequests(db: Database, audience: 'visitor', where: SQL, limit: number): Promise<VisitorRequestRow[]>;
function selectRequests(db: Database, audience: 'member', where: SQL, limit: number): Promise<MemberRequestRow[]>;
function selectRequests(db: Database, audience: Audience, where: SQL, limit: number): Promise<unknown[]> {
    const fields: SelectedFields = audience === 'member' ? memberRequestFields() : visitorRequestFields();
    return db
        .select(fields)
        .from(requests)
        .innerJoin(profiles, eq(profiles.id, requests.authorId))
        .innerJoin(trades, eq(trades.id, requests.tradeId))
        .innerJoin(communes, eq(communes.code, requests.communeCode))
        .where(where)
        .limit(limit);
}

/**
 * One request. Fulfilled and expired requests are still found: the route
 * answers them with their status (the author's list and favorites need them).
 * @returns found | missing
 */
export async function findRequest(db: Database, id: string, audience: 'visitor'): Promise<FindResult<VisitorRequestRow>>;
export async function findRequest(db: Database, id: string, audience: 'member'): Promise<FindResult<MemberRequestRow>>;
export async function findRequest(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorRequestRow | MemberRequestRow>>;
export async function findRequest(
    db: Database,
    id: string,
    audience: Audience,
): Promise<FindResult<VisitorRequestRow | MemberRequestRow>> {
    // The selected keys are exactly the row's keys: the result is the row as it is
    const where = eq(requests.id, id);
    const [row] = audience === 'member'
        ? await selectRequests(db, 'member', where, 1)
        : await selectRequests(db, 'visitor', where, 1);
    return row ? { state: 'found', row } : { state: 'missing' };
}

/**
 * Open requests (status open, not expired) among `ids` (read for the feed).
 * @returns the rows found, in no particular order (the caller orders them)
 */
export async function listOpenRequestsByIds(
    db: Database,
    ids: string[],
    audience: Audience,
): Promise<(VisitorRequestRow | MemberRequestRow)[]> {
    if (ids.length === 0) return [];
    const where = and(inArray(requests.id, ids), requestIsOpen)!;
    return audience === 'member'
        ? selectRequests(db, 'member', where, ids.length)
        : selectRequests(db, 'visitor', where, ids.length);
}
