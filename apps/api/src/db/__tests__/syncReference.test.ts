import { CATEGORIES, TRADES } from '@sialty/domain';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { categories, trades } from '../schema';
import { syncReference } from '../syncReference';
import { createTestDb } from '../../test/db';

// ============================================
// syncReference copies the domain's categories and trades into their tables.
// It runs in the globalSetup too, so the tables are already filled here:
// the test checks the counts and that a second run changes nothing.
// ============================================

const { db, close } = createTestDb();

afterAll(async () => {
    await close();
});

/** @returns Number of rows of categories and trades */
const countRows = async () => {
    const [row] = await db
        .select({
            categories: sql<number>`(select count(*)::int from ${categories})`,
            trades: sql<number>`(select count(*)::int from ${trades})`,
        })
        .from(sql`(select 1) as one`);
    return row;
};

describe('syncReference', () => {
    it('fills one row per domain category and trade', async () => {
        await syncReference(db);
        expect(await countRows()).toEqual({ categories: 9, trades: 20 });
        expect(CATEGORIES).toHaveLength(9);
        expect(TRADES).toHaveLength(20);
    });

    it('keeps the same counts when run twice', async () => {
        await syncReference(db);
        await syncReference(db);
        expect(await countRows()).toEqual({ categories: 9, trades: 20 });
    });
});
