import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

// ============================================
// MEDIA — a photo, stored as files made by the server: a blurred version for
// visitors and two sizes for members. The original is never kept or sent.
// In its own file: professional profiles, annonces, offers and requests all
// point at it, and it only points at profiles.
// ============================================

export const media = pgTable(
    'media',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        // Who uploaded it. The service only lets a person attach their own photos
        // (media ids are visible in responses). CASCADE: removing the person removes them
        ownerProfileId: uuid('owner_profile_id')
            .notNull()
            .references(() => profiles.id, { onDelete: 'cascade' }),
        blurKey: text('blur_key').notNull(),
        key400: text('key_400').notNull(),
        key1080: text('key_1080').notNull(),
        width: integer('width').notNull(),
        height: integer('height').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        check('media_size_check', sql`${table.width} > 0 and ${table.height} > 0`),
        index('media_owner_profile_id_idx').on(table.ownerProfileId),
    ],
);

export type MediaRow = typeof media.$inferInsert;
