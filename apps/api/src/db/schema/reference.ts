import { boolean, index, pgTable, text } from 'drizzle-orm/pg-core';

// ============================================
// REFERENCE DATA — categories and trades.
// The source of truth is @sialty/domain (CATEGORIES, TRADES): these tables are
// filled by syncReference (upsert, never delete), so foreign keys can point at
// them and the server never trusts a trade id sent by the app.
// Ids are the domain's readable text ids ("trade-painter"), not uuids.
// ============================================

export const categories = pgTable('categories', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
});

export const trades = pgTable(
    'trades',
    {
        id: text('id').primaryKey(),
        label: text('label').notNull(),
        // RESTRICT (default): a category still used by a trade cannot disappear
        categoryId: text('category_id')
            .notNull()
            .references(() => categories.id),
        // Can be done at a distance: only then a "country" zone applies
        isRemoteCapable: boolean('is_remote_capable').notNull().default(false),
    },
    (table) => [index('trades_category_id_idx').on(table.categoryId)],
);

export type CategoryRow = typeof categories.$inferInsert;
export type TradeRow = typeof trades.$inferInsert;
