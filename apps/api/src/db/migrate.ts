import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { createDb } from './client';

// ============================================
// MIGRATIONS — applies the SQL files of apps/api/drizzle/ not applied yet, in
// order. Drizzle records the applied ones in its own table, so running it
// twice changes nothing.
// ============================================

/** Folder of the migration files, found from this file (works from any working directory) */
export const MIGRATIONS_FOLDER = fileURLToPath(new URL('../../drizzle', import.meta.url));

/**
 * @param url postgres:// address of the database to bring up to date
 */
export const runMigrations = async (url: string): Promise<void> => {
    const { db, close } = createDb(url);
    try {
        await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    } finally {
        await close();
    }
};

// Run directly (npm run db:migrate): migrate the database of DATABASE_URL
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is missing (apps/api/.env)');
    await runMigrations(url);
    // Plain output on purpose: a one-off command, not the server's logs
    process.stdout.write('Migrations applied\n');
}
