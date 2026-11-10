import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '../../db/client';
import {
    annonceMedia,
    annonces,
    communes,
    offers,
    professionalProfiles,
    professionalTrades,
    professionalZones,
    profiles,
    requestMedia,
    requests,
    type AnnonceRow,
    type OfferRow,
    type RequestRow,
} from '../../db/schema';
import type { ObjectStorage } from '../../media/objectStorage';
import { storeImage } from '../../media/processImage';

// ============================================
// SEED — fills the DEVELOPMENT database with the sample data the app used to
// hold in its mocks, so the screens have something to show while the app is
// not connected to a real signup flow.
// This file only holds the logic; the data lives in scripts/seed/data.ts and
// the safety checks (never in production) in scripts/seed/seed.ts.
// Dates are offsets from "now" so offers stay live and requests stay open.
// ============================================

/** A place at city level: resolved to a commune by name and department */
export interface SeedPlace {
    city: string;
    department: string;
}

/** Same shapes as a professional's service zones (the id is derived by the seed) */
export type SeedZone =
    | { kind: 'city'; place: SeedPlace; radiusKm: number }
    | { kind: 'department'; code: string }
    | { kind: 'country' };

export interface SeedProfessional {
    /** Name other items use to point at this professional (not stored) */
    ref: string;
    firstName: string;
    lastName: string;
    description: string;
    services: string[];
    place: SeedPlace;
    locationType: 'fixed' | 'mobile' | 'both';
    /** Stored but never shown (showPhone stays false) */
    phone: string;
    startingPrice: number | null;
    /** The first one is the main trade */
    tradeIds: string[];
    zones: SeedZone[];
    coverImage?: string;
    memberSinceDaysAgo: number;
}

export interface SeedAnnonce {
    professionalRef: string;
    title: string;
    description: string;
    images: string[];
    place: SeedPlace;
    tradeId: string;
    priceType: 'fixed' | 'quote' | 'free';
    /** Euros, only with priceType 'fixed' */
    price?: number;
    createdDaysAgo: number;
}

export interface SeedOffer {
    professionalRef: string;
    title: string;
    description: string;
    discount: string | null;
    image?: string;
    tradeId: string;
    /** Offset from now in days; negative = in the past; null = no date */
    startsInDays: number | null;
    expiresInDays: number | null;
    conditions: string[];
    createdDaysAgo: number;
}

export interface SeedRequest {
    author: { firstName: string; lastName: string; memberSinceDaysAgo: number };
    tradeId: string;
    title: string;
    description: string;
    urgency: 'urgent' | 'this_week' | 'this_month' | 'flexible';
    photos: string[];
    place: SeedPlace;
    status: 'open' | 'fulfilled';
    createdHoursAgo: number;
    /** Offset from now in days; negative = already expired */
    expiresInDays: number;
}

export interface SeedData {
    professionals: SeedProfessional[];
    annonces: SeedAnnonce[];
    offers: SeedOffer[];
    requests: SeedRequest[];
}

export interface SeedCounts {
    professionals: number;
    annonces: number;
    offers: number;
    requests: number;
    photos: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Empties then fills the content tables, in ONE transaction: a failure (unknown
 * commune, photo that cannot be downloaded) leaves the tables as they were.
 * Safe to run again: the content is replaced, never duplicated.
 * Communes and the reference tables (categories, trades) are kept: the caller
 * must have run syncReference first.
 * @param db Database to fill (the development one: this empties it)
 * @param storage Where photo files go
 * @param data What to insert
 * @param fetchImage Downloads a photo; called once per distinct url
 * @returns How many rows of each kind were created
 * @throws Error `Unknown commune: <city> (<dept>)` / `Ambiguous commune: ...`
 */
export const seedContent = async (
    db: Database,
    storage: ObjectStorage,
    data: SeedData,
    fetchImage: (url: string) => Promise<Buffer>,
): Promise<SeedCounts> => {
    const now = Date.now();
    const daysFromNow = (days: number): Date => new Date(now + days * DAY_MS);

    return db.transaction(async (tx) => {
        // Same list as resetContent in the test factories (communes and reference data stay)
        await tx.execute(sql`
            truncate table
                request_media, annonce_media, requests, offers, annonces,
                professional_zones, professional_trades, professional_profiles, media, profiles
        `);

        // --- Communes: every place is resolved first, so a typo fails before any download ---
        const communeCodes = new Map<string, string>();
        const resolveCommune = async ({ city, department }: SeedPlace): Promise<string> => {
            const key = `${city}|${department}`;
            const cached = communeCodes.get(key);
            if (cached) return cached;

            const rows = await tx
                .select({ code: communes.code })
                .from(communes)
                .where(and(eq(communes.name, city), eq(communes.departmentCode, department)));
            if (rows.length === 0) throw new Error(`Unknown commune: ${city} (${department})`);
            // Never pick one at random: the sample data must say which commune it means
            if (rows.length > 1) throw new Error(`Ambiguous commune: ${city} (${department})`);

            communeCodes.set(key, rows[0].code);
            return rows[0].code;
        };

        const places: SeedPlace[] = [
            ...data.professionals.flatMap((pro) => [
                pro.place,
                ...pro.zones.flatMap((zone) => (zone.kind === 'city' ? [zone.place] : [])),
            ]),
            ...data.annonces.map((annonce) => annonce.place),
            ...data.requests.map((request) => request.place),
        ];
        for (const place of places) await resolveCommune(place);

        // --- Photos: each url is downloaded once, then stored for its owner ---
        const downloads = new Map<string, Buffer>();
        let photoCount = 0;
        const storePhoto = async (url: string, ownerProfileId: string): Promise<string> => {
            let bytes = downloads.get(url);
            if (!bytes) {
                bytes = await fetchImage(url);
                downloads.set(url, bytes);
            }
            photoCount += 1;
            return storeImage(storage, tx, bytes, 'seed', ownerProfileId);
        };

        // --- Professionals: person, professional profile, trades, zones, cover ---
        const professionalsByRef = new Map<string, { professionalId: string; profileId: string }>();
        for (const pro of data.professionals) {
            const [person] = await tx
                .insert(profiles)
                .values({
                    firstName: pro.firstName,
                    lastName: pro.lastName,
                    memberSince: daysFromNow(-pro.memberSinceDaysAgo),
                })
                .returning({ id: profiles.id });

            const [row] = await tx
                .insert(professionalProfiles)
                .values({
                    profileId: person.id,
                    displayName: `${pro.firstName} ${pro.lastName}`,
                    // Test professionals are created validated (the only status the public routes show)
                    status: 'validated',
                    description: pro.description,
                    services: pro.services,
                    communeCode: await resolveCommune(pro.place),
                    locationType: pro.locationType,
                    startingPrice: pro.startingPrice,
                    // Kept for the future contact flow, never sent
                    phone: pro.phone,
                    showPhone: false,
                    createdAt: daysFromNow(-pro.memberSinceDaysAgo),
                })
                .returning({ id: professionalProfiles.id });

            await tx
                .insert(professionalTrades)
                .values(pro.tradeIds.map((tradeId, position) => ({ professionalId: row.id, tradeId, position })));

            if (pro.zones.length > 0) {
                const zoneRows = await Promise.all(
                    pro.zones.map(async (zone) => {
                        if (zone.kind === 'city') {
                            const communeCode = await resolveCommune(zone.place);
                            return {
                                id: `city-${communeCode}`,
                                professionalId: row.id,
                                kind: 'city' as const,
                                communeCode,
                                radiusKm: zone.radiusKm,
                            };
                        }
                        if (zone.kind === 'department') {
                            return {
                                id: `department-${zone.code}`,
                                professionalId: row.id,
                                kind: 'department' as const,
                                departmentCode: zone.code,
                            };
                        }
                        return { id: 'country', professionalId: row.id, kind: 'country' as const };
                    }),
                );
                await tx.insert(professionalZones).values(zoneRows);
            }

            if (pro.coverImage) {
                const coverMediaId = await storePhoto(pro.coverImage, person.id);
                await tx
                    .update(professionalProfiles)
                    .set({ coverMediaId })
                    .where(eq(professionalProfiles.id, row.id));
            }

            professionalsByRef.set(pro.ref, { professionalId: row.id, profileId: person.id });
        }

        /** @throws Error when an item points at a professional the data does not hold */
        const professionalOf = (ref: string) => {
            const found = professionalsByRef.get(ref);
            if (!found) throw new Error(`Unknown professional: ${ref}`);
            return found;
        };

        // --- Annonces and their photos (owned by the professional's person) ---
        for (const annonce of data.annonces) {
            const owner = professionalOf(annonce.professionalRef);
            const values: AnnonceRow = {
                professionalId: owner.professionalId,
                tradeId: annonce.tradeId,
                title: annonce.title,
                description: annonce.description,
                communeCode: await resolveCommune(annonce.place),
                priceType: annonce.priceType,
                price: annonce.priceType === 'fixed' ? (annonce.price ?? null) : null,
                createdAt: daysFromNow(-annonce.createdDaysAgo),
            };
            const [row] = await tx.insert(annonces).values(values).returning({ id: annonces.id });

            for (const [position, url] of annonce.images.entries()) {
                const mediaId = await storePhoto(url, owner.profileId);
                await tx.insert(annonceMedia).values({ annonceId: row.id, mediaId, position });
            }
        }

        // --- Offers: placed at the professional's commune, one optional photo ---
        for (const offer of data.offers) {
            const owner = professionalOf(offer.professionalRef);
            const values: OfferRow = {
                professionalId: owner.professionalId,
                tradeId: offer.tradeId,
                title: offer.title,
                description: offer.description,
                discount: offer.discount,
                conditions: offer.conditions,
                mediaId: offer.image ? await storePhoto(offer.image, owner.profileId) : null,
                startsAt: offer.startsInDays === null ? null : daysFromNow(offer.startsInDays),
                expiresAt: offer.expiresInDays === null ? null : daysFromNow(offer.expiresInDays),
                createdAt: daysFromNow(-offer.createdDaysAgo),
            };
            await tx.insert(offers).values(values);
        }

        // --- Requests: one person per distinct author, photos owned by that author ---
        const authors = new Map<string, string>();
        for (const request of data.requests) {
            const { author } = request;
            const authorKey = `${author.firstName}|${author.lastName}`;
            let authorId = authors.get(authorKey);
            if (!authorId) {
                const [person] = await tx
                    .insert(profiles)
                    .values({
                        firstName: author.firstName,
                        lastName: author.lastName,
                        memberSince: daysFromNow(-author.memberSinceDaysAgo),
                    })
                    .returning({ id: profiles.id });
                authorId = person.id;
                authors.set(authorKey, authorId);
            }

            const values: RequestRow = {
                authorId,
                tradeId: request.tradeId,
                title: request.title,
                description: request.description,
                urgency: request.urgency,
                communeCode: await resolveCommune(request.place),
                status: request.status,
                createdAt: new Date(now - request.createdHoursAgo * HOUR_MS),
                expiresAt: daysFromNow(request.expiresInDays),
            };
            const [row] = await tx.insert(requests).values(values).returning({ id: requests.id });

            for (const [position, url] of request.photos.entries()) {
                const mediaId = await storePhoto(url, authorId);
                await tx.insert(requestMedia).values({ requestId: row.id, mediaId, position });
            }
        }

        return {
            professionals: data.professionals.length,
            annonces: data.annonces.length,
            offers: data.offers.length,
            requests: data.requests.length,
            photos: photoCount,
        };
    });
};
