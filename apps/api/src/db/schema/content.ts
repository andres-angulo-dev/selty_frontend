import { ANNONCE_LIMITS, OFFER_CONDITIONS, OFFER_LIMITS } from '@sialty/domain';
import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    foreignKey,
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
import { professionalProfiles, professionalTrades } from './people';
import { profiles } from './profiles';
import { trades } from './reference';

// ============================================
// CONTENT — annonces (a pro's post), offers (a pro's promotion) and requests
// (an individual's need). A REQUEST is not an ANNONCE: separate tables.
// Every place is a commune code (city level): no address is stored.
// The *_length columns are computed by Postgres so a visitor gets a fake text of
// close length without the real text being read.
// Length checks take their numbers from @sialty/domain (same limits as the
// forms): the migration holds the values at the time it was generated, so a
// change of limit needs a new migration.
// ============================================

// Values allowed in offers.conditions (OFFER_CONDITIONS in @sialty/domain), as a SQL array literal
const OFFER_CONDITIONS_SQL = sql.raw(`array[${OFFER_CONDITIONS.map((value) => `'${value}'`).join(', ')}]::text[]`);

/** A number from the domain limits, written into the check as a literal */
const n = (value: number) => sql.raw(String(value));

export const annonces = pgTable(
    'annonces',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        professionalId: uuid('professional_id')
            .notNull()
            .references(() => professionalProfiles.id, { onDelete: 'cascade' }),
        tradeId: text('trade_id')
            .notNull()
            .references(() => trades.id),
        title: text('title').notNull(),
        description: text('description').notNull(),
        descriptionLength: integer('description_length')
            .notNull()
            .generatedAlwaysAs(sql`char_length(description)`),
        communeCode: text('commune_code')
            .notNull()
            .references(() => communes.code),
        priceType: text('price_type', { enum: ['fixed', 'quote', 'free'] }).notNull(),
        // Euros, whole amount. Present exactly when the price is fixed
        price: integer('price'),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        // Only in one of the professional's own trades (the server must refuse any other)
        foreignKey({
            name: 'annonces_professional_trade_fk',
            columns: [table.professionalId, table.tradeId],
            foreignColumns: [professionalTrades.professionalId, professionalTrades.tradeId],
        }),
        check('annonces_price_type_check', sql`${table.priceType} in ('fixed', 'quote', 'free')`),
        check('annonces_price_check', sql`(${table.priceType} = 'fixed') = (${table.price} is not null)`),
        check('annonces_price_positive_check', sql`${table.price} is null or ${table.price} >= 0`),
        // ANNONCE_LIMITS.titleMin / titleMax
        check(
            'annonces_title_length_check',
            sql`char_length(${table.title}) between ${n(ANNONCE_LIMITS.titleMin)} and ${n(ANNONCE_LIMITS.titleMax)}`,
        ),
        // ANNONCE_LIMITS.descriptionMin / descriptionMax
        check(
            'annonces_description_length_check',
            sql`char_length(${table.description}) between ${n(ANNONCE_LIMITS.descriptionMin)} and ${n(ANNONCE_LIMITS.descriptionMax)}`,
        ),
        // Feed pagination by cursor, active annonces only: newest first, id breaks ties
        index('annonces_feed_idx')
            .on(table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())
            .where(sql`${table.isActive}`),
        // Local feed: the communes around the user first, then the same order
        index('annonces_commune_feed_idx')
            .on(table.communeCode, table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())
            .where(sql`${table.isActive}`),
        index('annonces_professional_id_idx').on(table.professionalId),
        index('annonces_trade_id_idx').on(table.tradeId),
    ],
);

/** Photos of an annonce, in display order (position 0 = cover) */
export const annonceMedia = pgTable(
    'annonce_media',
    {
        annonceId: uuid('annonce_id')
            .notNull()
            .references(() => annonces.id, { onDelete: 'cascade' }),
        // RESTRICT (default): a photo in use cannot be deleted under the annonce
        mediaId: uuid('media_id')
            .notNull()
            .references(() => media.id),
        position: smallint('position').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.annonceId, table.position] }),
        // The same photo only once per annonce
        unique('annonce_media_annonce_id_media_id_unique').on(table.annonceId, table.mediaId),
        check('annonce_media_position_check', sql`${table.position} >= 0`),
        index('annonce_media_media_id_idx').on(table.mediaId),
    ],
);

/** A professional's promotion. Placed at its professional's commune (no commune column) */
export const offers = pgTable(
    'offers',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        professionalId: uuid('professional_id')
            .notNull()
            .references(() => professionalProfiles.id, { onDelete: 'cascade' }),
        tradeId: text('trade_id')
            .notNull()
            .references(() => trades.id),
        title: text('title').notNull(),
        description: text('description').notNull(),
        descriptionLength: integer('description_length')
            .notNull()
            .generatedAlwaysAs(sql`char_length(description)`),
        // Free text ("-20 %"); null = no badge
        discount: text('discount'),
        conditions: text('conditions').array().notNull().default(sql`'{}'::text[]`),
        mediaId: uuid('media_id').references(() => media.id, { onDelete: 'set null' }),
        startsAt: timestamp('starts_at', { withTimezone: true }),
        expiresAt: timestamp('expires_at', { withTimezone: true }),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        // Only in one of the professional's own trades
        foreignKey({
            name: 'offers_professional_trade_fk',
            columns: [table.professionalId, table.tradeId],
            foreignColumns: [professionalTrades.professionalId, professionalTrades.tradeId],
        }),
        // Every condition must be a known OfferCondition (<@ = "is contained in")
        check('offers_conditions_check', sql`${table.conditions} <@ ${OFFER_CONDITIONS_SQL}`),
        // OFFER_LIMITS.conditionsMax
        check('offers_conditions_count_check', sql`cardinality(${table.conditions}) <= ${n(OFFER_LIMITS.conditionsMax)}`),
        // OFFER_LIMITS.titleMin / titleMax
        check(
            'offers_title_length_check',
            sql`char_length(${table.title}) between ${n(OFFER_LIMITS.titleMin)} and ${n(OFFER_LIMITS.titleMax)}`,
        ),
        // OFFER_LIMITS.descriptionMin / descriptionMax
        check(
            'offers_description_length_check',
            sql`char_length(${table.description}) between ${n(OFFER_LIMITS.descriptionMin)} and ${n(OFFER_LIMITS.descriptionMax)}`,
        ),
        // OFFER_LIMITS.discountMax
        check(
            'offers_discount_length_check',
            sql`${table.discount} is null or char_length(${table.discount}) <= ${n(OFFER_LIMITS.discountMax)}`,
        ),
        check(
            'offers_dates_check',
            sql`${table.startsAt} is null or ${table.expiresAt} is null or ${table.startsAt} <= ${table.expiresAt}`,
        ),
        index('offers_feed_idx')
            .on(table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())
            .where(sql`${table.isActive}`),
        // Offers of one professional, newest first (not partial: their own tab shows ended ones too)
        index('offers_professional_feed_idx').on(
            table.professionalId,
            table.createdAt.desc().nullsFirst(),
            table.id.desc().nullsFirst(),
        ),
        index('offers_trade_id_idx').on(table.tradeId),
        index('offers_media_id_idx').on(table.mediaId).where(sql`${table.mediaId} is not null`),
    ],
);

/**
 * An individual's need ("J'ai besoin d'un peintre"). "expired" is computed from expires_at, never stored.
 * No length checks: the request limits live in the app (requestSchema), not in @sialty/domain yet.
 */
export const requests = pgTable(
    'requests',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        authorId: uuid('author_id')
            .notNull()
            .references(() => profiles.id, { onDelete: 'cascade' }),
        tradeId: text('trade_id')
            .notNull()
            .references(() => trades.id),
        title: text('title').notNull(),
        description: text('description').notNull(),
        descriptionLength: integer('description_length')
            .notNull()
            .generatedAlwaysAs(sql`char_length(description)`),
        urgency: text('urgency', { enum: ['urgent', 'this_week', 'this_month', 'flexible'] }).notNull(),
        communeCode: text('commune_code')
            .notNull()
            .references(() => communes.code),
        status: text('status', { enum: ['open', 'fulfilled'] })
            .notNull()
            .default('open'),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    },
    (table) => [
        check('requests_urgency_check', sql`${table.urgency} in ('urgent', 'this_week', 'this_month', 'flexible')`),
        check('requests_status_check', sql`${table.status} in ('open', 'fulfilled')`),
        check('requests_expires_at_check', sql`${table.expiresAt} > ${table.createdAt}`),
        // Feed: open requests only ("expires_at > now()" cannot be an index predicate, it stays a filter)
        index('requests_feed_idx')
            .on(table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())
            .where(sql`${table.status} = 'open'`),
        index('requests_commune_feed_idx')
            .on(table.communeCode, table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())
            .where(sql`${table.status} = 'open'`),
        index('requests_author_id_idx').on(table.authorId),
        index('requests_trade_id_idx').on(table.tradeId),
    ],
);

/** Photos of a request, in display order */
export const requestMedia = pgTable(
    'request_media',
    {
        requestId: uuid('request_id')
            .notNull()
            .references(() => requests.id, { onDelete: 'cascade' }),
        mediaId: uuid('media_id')
            .notNull()
            .references(() => media.id),
        position: smallint('position').notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.requestId, table.position] }),
        unique('request_media_request_id_media_id_unique').on(table.requestId, table.mediaId),
        check('request_media_position_check', sql`${table.position} >= 0`),
        index('request_media_media_id_idx').on(table.mediaId),
    ],
);

export type AnnonceRow = typeof annonces.$inferInsert;
export type OfferRow = typeof offers.$inferInsert;
export type RequestRow = typeof requests.$inferInsert;
