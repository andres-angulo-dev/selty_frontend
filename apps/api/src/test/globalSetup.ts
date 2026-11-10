import { createDb } from '../db/client';
import { runMigrations } from '../db/migrate';
import { syncReference } from '../db/syncReference';
import { TEST_DATABASE_URL } from './db';

// ============================================
// Runs once before all API tests: brings the test database to the latest
// migration, so a new table is there without a manual step, then fills the
// reference tables (categories, trades) that the factories point at.
// ============================================

export default async function setup(): Promise<void> {
    await runMigrations(TEST_DATABASE_URL);

    const { db, close } = createDb(TEST_DATABASE_URL);
    try {
        await syncReference(db);
    } finally {
        await close();
    }
}
