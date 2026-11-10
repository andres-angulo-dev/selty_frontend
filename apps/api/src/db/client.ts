import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// ============================================
// DATABASE CLIENT — a pool of connections to PostgreSQL, wrapped by Drizzle.
// One pool per process: opening a connection per request would be slow and
// would exhaust PostgreSQL's connection limit.
// ============================================

export type Database = NodePgDatabase<typeof schema>;

/**
 * @param url postgres:// address of the database (DATABASE_URL)
 * @returns The Drizzle database and a function that closes every connection
 *          (end of the server, end of a test file)
 */
export const createDb = (url: string): { db: Database; close: () => Promise<void> } => {
    const pool = new Pool({ connectionString: url, max: 10 });
    return {
        db: drizzle(pool, { schema }),
        close: () => pool.end(),
    };
};
