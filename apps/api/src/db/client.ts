import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pino, type Logger } from 'pino';
import * as schema from './schema';

// ============================================
// DATABASE CLIENT — a pool of connections to PostgreSQL, wrapped by Drizzle.
// One pool per process: opening a connection per request would be slow and
// would exhaust PostgreSQL's connection limit.
// ============================================

export type Database = NodePgDatabase<typeof schema> & { $client: Pool };

/**
 * @param url postgres:// address of the database (DATABASE_URL)
 * @param logger Where a dropped idle connection is reported (silent by default)
 * @returns The Drizzle database and a function that closes every connection
 *          (end of the server, end of a test file); calling it twice is harmless
 */
export const createDb = (
    url: string,
    logger: Logger = pino({ level: 'silent' }),
): { db: Database; close: () => Promise<void> } => {
    const pool = new Pool({ connectionString: url, max: 10 });

    // An idle connection that drops (PostgreSQL restarted, network cut) makes the
    // pool emit "error". Without a listener, Node stops the whole process. The
    // pool replaces the connection by itself on the next query: logging is enough.
    pool.on('error', (error) => {
        logger.error({ err: error }, 'idle database connection lost');
    });

    // pool.end() rejects when called twice (two Ctrl+C): keep the first call
    let closing: Promise<void> | null = null;

    return {
        db: drizzle(pool, { schema }),
        close: () => (closing ??= pool.end()),
    };
};
