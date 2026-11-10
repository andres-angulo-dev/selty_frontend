import { runMigrations } from '../db/migrate';
import { TEST_DATABASE_URL } from './db';

// ============================================
// Runs once before all API tests: brings the test database to the latest
// migration, so a new table is there without a manual step.
// ============================================

export default async function setup(): Promise<void> {
    await runMigrations(TEST_DATABASE_URL);
}
