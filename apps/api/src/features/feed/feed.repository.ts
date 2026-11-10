import type { Audience } from '@sialty/domain';
import { sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { Database } from '../../db/client';
import { annonces, communes, offers, professionalProfiles, requests } from '../../db/schema';
import {
    listAnnoncesByIds,
    listOffersByIds,
    listOpenRequestsByIds,
    offerIsLive,
    requestIsOpen,
} from '../publicRead/publicRead.repository';
import type {
    MemberAnnonceRow,
    MemberOfferRow,
    MemberRequestRow,
    VisitorAnnonceRow,
    VisitorOfferRow,
    VisitorRequestRow,
} from '../publicRead/serializers/rows';
import type { FeedCursor } from './feed.cursor';

// ============================================
// FEED REPOSITORY — the home feed around a position, in two steps:
// 1. ONE query picks the page: kind, id, date and distance of the newest
//    annonces, live offers and open requests placed in the area (UNION ALL of
//    three branches). It reads no text column at all.
// 2. The rows of that page are read by id with the publicRead readers, so the
//    visitor / member field sets and the "validated professional" rule stay
//    written in one place (publicRead.repository.ts).
// Place of an item = the center of its commune; an offer has no commune of
// its own and is placed at its professional's.
// ============================================

/** Area of a feed page: a circle in km around the position, or the department (with neighbours) */
export type FeedArea = { kind: 'distance'; km: number } | { kind: 'department' };

export interface FeedQuery {
    lat: number;
    lng: number;
    area: FeedArea;
    /** Last item of the previous page; null for the first page */
    cursor: FeedCursor | null;
    /** Items wanted on the page (one more is read to know if another page exists) */
    limit: number;
}

/** One item of the page: its row for the serializer, its distance, its position for the next cursor */
export type FeedEntry = (
    | { kind: 'annonce'; row: VisitorAnnonceRow | MemberAnnonceRow }
    | { kind: 'offer'; row: VisitorOfferRow | MemberOfferRow }
    | { kind: 'request'; row: VisitorRequestRow | MemberRequestRow }
) & { distanceKm: number };

export interface FeedPageRows {
    entries: FeedEntry[];
    /** Position of the last item of the page when another page exists, else null */
    nextCursor: FeedCursor | null;
}

/**
 * A department "touches" another when one of its communes has its center
 * within this distance of a commune center of the other. The database has no
 * department outlines (only commune centers), so the neighbours are found this
 * way: 10 km catches the communes on both sides of a border without reaching
 * departments two steps away.
 */
const NEIGHBOUR_DEPARTMENT_KM = 10;

type FeedKind = FeedEntry['kind'];

interface PickedRow extends Record<string, unknown> {
    kind: FeedKind;
    id: string;
    /** created_at as UTC ISO text with microseconds (see feed.cursor.ts) */
    created_at: string;
    distance_m: number;
}

/** The position as a geography point (x = longitude, y = latitude), for distances in meters */
const pointOf = (query: FeedQuery): SQL =>
    sql`ST_SetSRID(ST_MakePoint(${query.lng}::float8, ${query.lat}::float8), 4326)::geography`;

/**
 * Codes of the communes of the area (no distance here: a department area holds
 * thousands of communes, the distance is computed for the page's rows only).
 * Every spatial test uses exactly `center::geography`: it is the expression of
 * the GiST index communes_center_geog_gist_idx, any other spelling skips the index.
 */
const areaCte = (query: FeedQuery): SQL => {
    if (query.area.kind === 'distance') {
        return sql`area as (
            select ${communes.code} as code
            from ${communes}
            where ST_DWithin(${communes.center}::geography, ${pointOf(query)}, ${query.area.km * 1000}::float8)
        )`;
    }
    // Department: the one of the commune nearest to the position (KNN on the
    // geometry GiST index), plus its neighbours (see NEIGHBOUR_DEPARTMENT_KM)
    return sql`home as (
            select department_code from communes
            order by center <-> ST_SetSRID(ST_MakePoint(${query.lng}::float8, ${query.lat}::float8), 4326)
            limit 1
        ),
        departments as (
            select department_code from home
            union
            select other.department_code
            from communes own
            inner join communes other
                on ST_DWithin(own.center::geography, other.center::geography, ${NEIGHBOUR_DEPARTMENT_KM * 1000}::float8)
            where own.department_code = (select department_code from home)
        ),
        area as (
            select ${communes.code} as code
            from ${communes}
            where ${communes.departmentCode} in (select department_code from departments)
        )`;
};

/** created_at of the union as text that keeps the microseconds, in UTC ("2026-11-10T09:15:42.123456Z") */
const CREATED_AT_TEXT = sql`to_char(feed.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

/** "Older than the cursor" for one branch (nothing on the first page) */
const afterCursor = (createdAt: AnyPgColumn, id: AnyPgColumn, cursor: FeedCursor | null): SQL => (cursor ? sql`and (${createdAt}, ${id}) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)` : sql``);

/**
 * Step 1: kind, id, date and distance of the page's items (limit + 1 rows).
 * The distance is computed in the outer query, for those rows only.
 * The cursor condition AND the limit are repeated inside each branch, not only
 * outside: each branch then reads at most limit + 1 rows from its partial feed
 * index instead of every item of the area.
 */
const pickPage = async (db: Database, query: FeedQuery): Promise<PickedRow[]> => {
    const take = query.limit + 1;
    const result = await db.execute<PickedRow>(sql`
        with ${areaCte(query)}
        select feed.kind, feed.id, ${CREATED_AT_TEXT} as created_at,
            ST_Distance(place.center::geography, ${pointOf(query)}) as distance_m
        from (
            (select 'annonce' as kind, ${annonces.id} as id, ${annonces.createdAt} as created_at, area.code as commune_code
                from ${annonces}
                inner join area on area.code = ${annonces.communeCode}
                inner join ${professionalProfiles}
                    on ${professionalProfiles.id} = ${annonces.professionalId} and ${professionalProfiles.status} = 'validated'
                where ${annonces.isActive} ${afterCursor(annonces.createdAt, annonces.id, query.cursor)}
                order by ${annonces.createdAt} desc, ${annonces.id} desc
                limit ${take})
            union all
            (select 'offer', ${offers.id}, ${offers.createdAt}, area.code
                from ${offers}
                inner join ${professionalProfiles}
                    on ${professionalProfiles.id} = ${offers.professionalId} and ${professionalProfiles.status} = 'validated'
                inner join area on area.code = ${professionalProfiles.communeCode}
                where ${offerIsLive} ${afterCursor(offers.createdAt, offers.id, query.cursor)}
                order by ${offers.createdAt} desc, ${offers.id} desc
                limit ${take})
            union all
            (select 'request', ${requests.id}, ${requests.createdAt}, area.code
                from ${requests}
                inner join area on area.code = ${requests.communeCode}
                where ${requestIsOpen} ${afterCursor(requests.createdAt, requests.id, query.cursor)}
                order by ${requests.createdAt} desc, ${requests.id} desc
                limit ${take})
        ) as feed
        inner join communes place on place.code = feed.commune_code
        order by feed.created_at desc, feed.id desc
        limit ${take}
    `);
    return result.rows;
};

/** Ids of one kind among the picked rows */
const idsOf = (picked: PickedRow[], kind: FeedKind): string[] =>
    picked.filter((row) => row.kind === kind).map((row) => row.id);

/** Rows by id, to put them back in the page order */
const byId = <Row extends { id: string }>(rows: Row[]): Map<string, Row> => new Map(rows.map((row) => [row.id, row]));

/**
 * One page of the feed.
 * @param query    position, area, cursor and page size (already validated)
 * @param audience who reads: decides the field set of each row
 * @returns the page's rows newest first (created_at desc, id desc), and the
 *          cursor of the next page (null on the last page)
 */
export const findFeedPage = async (db: Database, query: FeedQuery, audience: Audience): Promise<FeedPageRows> => {
    const picked = await pickPage(db, query);
    const page = picked.slice(0, query.limit);

    const [annonceRows, offerRows, requestRows] = await Promise.all([
        listAnnoncesByIds(db, idsOf(page, 'annonce'), audience),
        listOffersByIds(db, idsOf(page, 'offer'), audience),
        listOpenRequestsByIds(db, idsOf(page, 'request'), audience),
    ]);
    const annoncesById = byId(annonceRows);
    const offersById = byId(offerRows);
    const requestsById = byId(requestRows);

    const entries: FeedEntry[] = [];
    for (const item of page) {
        const distanceKm = Math.round(Number(item.distance_m) / 1000);
        // An item changed between the two steps (deactivated, expired) is skipped, never shown stale
        if (item.kind === 'annonce') {
            const row = annoncesById.get(item.id);
            if (row) entries.push({ kind: 'annonce', row, distanceKm });
        } else if (item.kind === 'offer') {
            const row = offersById.get(item.id);
            if (row) entries.push({ kind: 'offer', row, distanceKm });
        } else {
            const row = requestsById.get(item.id);
            if (row) entries.push({ kind: 'request', row, distanceKm });
        }
    }

    // The cursor comes from the picked rows, not the read ones: a skipped item still moves the page on
    const last = page.at(-1);
    const nextCursor = picked.length > query.limit && last ? { createdAt: last.created_at, id: last.id } : null;
    return { entries, nextCursor };
};
