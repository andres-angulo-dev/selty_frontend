import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    index,
    integer,
    pgTable,
    primaryKey,
    smallint,
    text,
    timestamp,
    unique,
    uuid,
} from 'drizzle-orm/pg-core';
import { communes } from './communes';
import { media } from './media';
import { profiles } from './profiles';
import { trades } from './reference';

// ============================================
// PROFESSIONALS — the OPTIONAL professional profile of a person (profiles.ts),
// with its trades and service zones.
// ============================================

/**
 * Professional profile of a person. Only status 'validated' is visible anywhere.
 * The *_length columns are computed by Postgres: a visitor gets a fake text of
 * close length, so the server never has to read the real text for them.
 */
export const professionalProfiles = pgTable(
    'professional_profiles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        // UNIQUE: one professional profile per person. CASCADE: removing the person removes it
        profileId: uuid('profile_id')
            .notNull()
            .unique()
            .references(() => profiles.id, { onDelete: 'cascade' }),
        displayName: text('display_name').notNull(),
        displayNameLength: integer('display_name_length')
            .notNull()
            .generatedAlwaysAs(sql`char_length(display_name)`),
        status: text('status', { enum: ['pending', 'validated', 'refused'] })
            .notNull()
            .default('pending'),
        description: text('description').notNull(),
        descriptionLength: integer('description_length')
            .notNull()
            .generatedAlwaysAs(sql`char_length(description)`),
        services: text('services').array().notNull().default(sql`'{}'::text[]`),
        // Where the professional is based (city level, never an address)
        communeCode: text('commune_code')
            .notNull()
            .references(() => communes.code),
        locationType: text('location_type', { enum: ['fixed', 'mobile', 'both'] }).notNull(),
        // SET NULL: deleting a photo leaves the profile without one, not broken
        avatarMediaId: uuid('avatar_media_id').references(() => media.id, { onDelete: 'set null' }),
        coverMediaId: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
        // In euros, whole amounts ("à partir de 40 €")
        startingPrice: integer('starting_price'),
        // Never in any professional response (constraint), stored for the future contact flow
        phone: text('phone'),
        showPhone: boolean('show_phone').notNull().default(false),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    // No length checks on display_name / description / services: @sialty/domain has no limit for them yet
    (table) => [
        check('professional_profiles_status_check', sql`${table.status} in ('pending', 'validated', 'refused')`),
        check('professional_profiles_location_type_check', sql`${table.locationType} in ('fixed', 'mobile', 'both')`),
        check('professional_profiles_starting_price_check', sql`${table.startingPrice} is null or ${table.startingPrice} >= 0`),
        // No index on status alone: 3 values, the planner would rarely use it
        index('professional_profiles_commune_code_idx').on(table.communeCode),
        // Partial: only rows that have a photo matter for the SET NULL lookup when a photo is deleted
        index('professional_profiles_avatar_media_id_idx')
            .on(table.avatarMediaId)
            .where(sql`${table.avatarMediaId} is not null`),
        index('professional_profiles_cover_media_id_idx')
            .on(table.coverMediaId)
            .where(sql`${table.coverMediaId} is not null`),
    ],
);

/**
 * Trades of a professional. position 0 = main trade (gives the profession label).
 * Annonces and offers point at (professional_id, trade_id) here: a professional
 * can only publish in one of their own trades.
 */
export const professionalTrades = pgTable(
    'professional_trades',
    {
        professionalId: uuid('professional_id')
            .notNull()
            .references(() => professionalProfiles.id, { onDelete: 'cascade' }),
        // RESTRICT (default): a trade in use cannot be removed from the reference
        tradeId: text('trade_id')
            .notNull()
            .references(() => trades.id),
        position: smallint('position').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.professionalId, table.tradeId] }),
        // One trade per position: a single main trade, so the profession label is stable
        unique('professional_trades_professional_id_position_unique').on(table.professionalId, table.position),
        check('professional_trades_position_check', sql`${table.position} >= 0`),
        // "Pros of this trade" lookups (the pk only helps from the professional side)
        index('professional_trades_trade_id_idx').on(table.tradeId),
    ],
);

/**
 * Service zones of a professional (same shapes as ServiceZone in @sialty/domain).
 * id is the domain's readable id ("department-77"), unique per professional.
 * The check makes each kind carry exactly its own columns:
 * city → commune + radius, department → department code, region → region code, country → nothing.
 */
export const professionalZones = pgTable(
    'professional_zones',
    {
        id: text('id').notNull(),
        professionalId: uuid('professional_id')
            .notNull()
            .references(() => professionalProfiles.id, { onDelete: 'cascade' }),
        kind: text('kind', { enum: ['city', 'department', 'region', 'country'] }).notNull(),
        communeCode: text('commune_code').references(() => communes.code),
        radiusKm: integer('radius_km'),
        departmentCode: text('department_code'),
        regionCode: text('region_code'),
    },
    (table) => [
        primaryKey({ columns: [table.professionalId, table.id] }),
        check('professional_zones_kind_check', sql`${table.kind} in ('city', 'department', 'region', 'country')`),
        check(
            'professional_zones_columns_check',
            sql`(${table.kind} = 'city' and ${table.communeCode} is not null and ${table.radiusKm} is not null and ${table.departmentCode} is null and ${table.regionCode} is null)
            or (${table.kind} = 'department' and ${table.departmentCode} is not null and ${table.communeCode} is null and ${table.radiusKm} is null and ${table.regionCode} is null)
            or (${table.kind} = 'region' and ${table.regionCode} is not null and ${table.communeCode} is null and ${table.radiusKm} is null and ${table.departmentCode} is null)
            or (${table.kind} = 'country' and ${table.communeCode} is null and ${table.radiusKm} is null and ${table.departmentCode} is null and ${table.regionCode} is null)`,
        ),
        check('professional_zones_radius_check', sql`${table.radiusKm} is null or ${table.radiusKm} >= 0`),
        // Matching a request: "pros with a zone in this department / region / around this commune"
        index('professional_zones_department_code_idx').on(table.departmentCode),
        index('professional_zones_region_code_idx').on(table.regionCode),
        index('professional_zones_commune_code_idx').on(table.communeCode),
    ],
);

export type ProfessionalProfileRow = typeof professionalProfiles.$inferInsert;
export type ProfessionalTradeRow = typeof professionalTrades.$inferInsert;
export type ProfessionalZoneRow = typeof professionalZones.$inferInsert;
