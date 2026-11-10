import { CATEGORIES, TRADES } from '@sialty/domain';
import { sql } from 'drizzle-orm';
import type { Database } from './client';
import { categories, trades } from './schema';

// ============================================
// REFERENCE SYNC — copies the categories and trades of @sialty/domain (the
// source of truth) into their tables, so foreign keys can point at them.
// Upsert only: a row is created or updated, never deleted (a trade dropped
// from the domain may still be used by publications; removing it is a
// deliberate migration, not a side effect of a deploy).
// ============================================

/**
 * Upserts every domain category, then every trade (trades point at categories).
 * Runs in one transaction: a failure leaves the tables as they were.
 * Safe to run at every start or deploy: a second run changes nothing.
 * @param db Database to fill
 */
export const syncReference = async (db: Database): Promise<void> => {
    await db.transaction(async (tx) => {
        await tx
            .insert(categories)
            .values(CATEGORIES.map(({ id, name }) => ({ id, name })))
            .onConflictDoUpdate({ target: categories.id, set: { name: sql`excluded.name` } });

        await tx
            .insert(trades)
            .values(
                TRADES.map(({ id, label, categoryId, isRemoteCapable }) => ({
                    id,
                    label,
                    categoryId,
                    isRemoteCapable: isRemoteCapable ?? false,
                })),
            )
            .onConflictDoUpdate({
                target: trades.id,
                set: {
                    label: sql`excluded.label`,
                    categoryId: sql`excluded.category_id`,
                    isRemoteCapable: sql`excluded.is_remote_capable`,
                },
            });
    });
};
