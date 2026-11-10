import { and, eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client';
import {
    annonces,
    communes,
    media,
    offers,
    professionalProfiles,
    professionalTrades,
    professionalZones,
    profiles,
    requests,
    type AnnonceRow,
    type OfferRow,
    type ProfessionalProfileRow,
    type ProfessionalZoneRow,
    type RequestRow,
} from '../db/schema';

// ============================================
// TEST FACTORIES — insert one row with sensible defaults, so a test only
// writes the fields it is about. Every default respects the database checks
// (text lengths from @sialty/domain, price rules, trades of the professional).
// The reference tables (categories, trades) are filled by the globalSetup.
// ============================================

/** Trade given to a professional when the test does not choose */
const DEFAULT_TRADE_ID = 'trade-painter';

/** Lifetime of a request when the test does not choose */
const DEFAULT_REQUEST_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export interface CommuneInput {
    code: string;
    name: string;
    departmentCode: string;
    regionCode?: string;
    lat: number;
    lng: number;
    surfaceHa?: number | null;
}

/**
 * Inserts a commune (does nothing if the code already exists).
 * @param input code, name, department, GPS position; region defaults to Île-de-France ('11')
 */
export const insertCommune = async (db: Database, input: CommuneInput): Promise<void> => {
    await db
        .insert(communes)
        .values({
            code: input.code,
            name: input.name,
            departmentCode: input.departmentCode,
            regionCode: input.regionCode ?? '11',
            surfaceHectares: input.surfaceHa ?? null,
            // GeoJSON order: x = longitude, y = latitude
            center: { x: input.lng, y: input.lat },
        })
        .onConflictDoNothing();
};

/**
 * Inserts a person.
 * @returns The profile id
 */
export const insertProfile = async (
    db: Database,
    input: { firstName?: string; lastName?: string; memberSince?: Date } = {},
): Promise<string> => {
    const [row] = await db
        .insert(profiles)
        .values({
            firstName: input.firstName ?? 'Sophie',
            lastName: input.lastName ?? 'Martin',
            memberSince: input.memberSince,
        })
        .returning({ id: profiles.id });
    return row.id;
};

/**
 * Inserts a photo record (keys only, no file).
 * @param input ownerProfileId: owner of the photo; a new person is created when omitted
 * @returns The media id
 */
export const insertMedia = async (db: Database, input: { ownerProfileId?: string } = {}): Promise<string> => {
    const ownerProfileId = input.ownerProfileId ?? (await insertProfile(db));
    const key = crypto.randomUUID();
    const [row] = await db
        .insert(media)
        .values({
            ownerProfileId,
            blurKey: `test/${key}-blur.webp`,
            key400: `test/${key}-400.webp`,
            key1080: `test/${key}-1080.webp`,
            width: 1080,
            height: 1350,
        })
        .returning({ id: media.id });
    return row.id;
};

export type ProInput = Partial<Omit<ProfessionalProfileRow, 'id' | 'profileId' | 'communeCode'>> & {
    communeCode: string;
    /** Trades in order: the first one is the main trade. Default: one painter trade */
    tradeIds?: string[];
    /** Service zones (without the professional id). Default: none */
    zones?: Omit<ProfessionalZoneRow, 'professionalId'>[];
    firstName?: string;
    lastName?: string;
};

/**
 * Inserts a person, their professional profile, its trades and zones.
 * Status defaults to 'validated' (the only one the public routes show), not
 * to the table's 'pending': most tests are about what visitors see.
 * @returns The professional profile id and the person's profile id
 */
export const insertPro = async (
    db: Database,
    input: ProInput,
): Promise<{ professionalId: string; profileId: string }> => {
    const { tradeIds = [DEFAULT_TRADE_ID], zones = [], firstName, lastName, ...fields } = input;
    const profileId = await insertProfile(db, { firstName, lastName });

    const [row] = await db
        .insert(professionalProfiles)
        .values({
            displayName: 'Atelier Martin',
            description: 'Peinture intérieure et extérieure, devis gratuit sous 48 heures.',
            locationType: 'mobile',
            ...fields,
            status: fields.status ?? 'validated',
            profileId,
        })
        .returning({ id: professionalProfiles.id });
    const professionalId = row.id;

    if (tradeIds.length > 0) {
        await db
            .insert(professionalTrades)
            .values(tradeIds.map((tradeId, position) => ({ professionalId, tradeId, position })));
    }
    if (zones.length > 0) {
        await db.insert(professionalZones).values(zones.map((zone) => ({ ...zone, professionalId })));
    }

    return { professionalId, profileId };
};

/**
 * @returns The main trade (position 0) of a professional, used as the default
 *          trade of their annonces and offers
 */
const mainTradeOf = async (db: Database, professionalId: string): Promise<string> => {
    const [row] = await db
        .select({ tradeId: professionalTrades.tradeId })
        .from(professionalTrades)
        .where(and(eq(professionalTrades.professionalId, professionalId), eq(professionalTrades.position, 0)));
    if (!row) throw new Error(`professional ${professionalId} has no main trade`);
    return row.tradeId;
};

export type AnnonceInput = Partial<Omit<AnnonceRow, 'professionalId' | 'communeCode'>> & {
    professionalId: string;
    communeCode: string;
};

/**
 * Inserts an annonce. Defaults: the professional's main trade, a quote price, active.
 * @returns The annonce id
 */
export const insertAnnonce = async (db: Database, input: AnnonceInput): Promise<string> => {
    const [row] = await db
        .insert(annonces)
        .values({
            title: 'Rénovation de salle de bain',
            description: 'Carrelage, plomberie et peinture, travail soigné et rapide.',
            priceType: 'quote',
            ...input,
            tradeId: input.tradeId ?? (await mainTradeOf(db, input.professionalId)),
        })
        .returning({ id: annonces.id });
    return row.id;
};

export type OfferInput = Partial<Omit<OfferRow, 'professionalId'>> & { professionalId: string };

/**
 * Inserts an offer. Defaults: the professional's main trade, no dates (always running), active.
 * @returns The offer id
 */
export const insertOffer = async (db: Database, input: OfferInput): Promise<string> => {
    const [row] = await db
        .insert(offers)
        .values({
            title: 'Devis offert ce mois-ci',
            description: 'Un devis détaillé gratuit pour tout chantier de peinture.',
            discount: '-20 %',
            conditions: ['free_quote'],
            ...input,
            tradeId: input.tradeId ?? (await mainTradeOf(db, input.professionalId)),
        })
        .returning({ id: offers.id });
    return row.id;
};

export type RequestInput = Partial<Omit<RequestRow, 'authorId' | 'communeCode'>> & {
    authorId: string;
    communeCode: string;
};

/**
 * Inserts a request. Defaults: painter trade, flexible, open, expires 30 days
 * after its creation date.
 * @returns The request id
 */
export const insertRequest = async (db: Database, input: RequestInput): Promise<string> => {
    const createdAt = input.createdAt ?? new Date();
    const [row] = await db
        .insert(requests)
        .values({
            tradeId: DEFAULT_TRADE_ID,
            title: "J'ai besoin d'un peintre",
            description: 'Repeindre un salon de 25 m², murs et plafond.',
            urgency: 'flexible',
            ...input,
            createdAt,
            expiresAt: input.expiresAt ?? new Date(createdAt.getTime() + DEFAULT_REQUEST_LIFETIME_MS),
        })
        .returning({ id: requests.id });
    return row.id;
};

/**
 * Empties every content table (people, professionals, photos, annonces, offers,
 * requests). Keeps communes and the reference tables (categories, trades).
 */
export const resetContent = async (db: Database): Promise<void> => {
    await db.execute(sql`
        truncate table
            request_media, annonce_media, requests, offers, annonces,
            professional_zones, professional_trades, professional_profiles, media, profiles
    `);
};
