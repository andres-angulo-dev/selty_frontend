import { sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { profiles, user } from '../schema';
import { createTestDb } from '../../test/db';
import { resetContent } from '../../test/factories';

// ============================================
// The rules the database itself enforces on the account tables and on the
// link profiles.user_id. Runs against the real sialty_test database.
// ============================================

const { db, close } = createTestDb();

beforeEach(async () => {
    await resetContent(db);
});

afterAll(async () => {
    await resetContent(db);
    await close();
});

/** Inserts a minimal account row. @returns its id */
const insertUser = async (id: string, email: string): Promise<string> => {
    await db.insert(user).values({ id, name: 'Test', email });
    return id;
};

/**
 * Runs an insert/delete expected to break a constraint.
 * @returns the PostgreSQL error code (SQLSTATE) of the failure
 */
const sqlStateOf = async (action: () => Promise<unknown>): Promise<string> => {
    return (await failureOf(action)).code;
};

/** Like sqlStateOf, also returns the name of the constraint that refused the statement */
const failureOf = async (action: () => Promise<unknown>): Promise<{ code: string; constraint?: string }> => {
    try {
        await action();
    } catch (error) {
        // Drizzle wraps the driver error: the SQLSTATE sits on the cause
        const cause = ((error as { cause?: unknown }).cause ?? error) as { code?: string; constraint?: string };
        return { code: cause.code ?? 'unknown', constraint: cause.constraint };
    }
    throw new Error('the statement was accepted, a constraint was expected to refuse it');
};

describe('account tables', () => {
    it('user timestamps are timestamptz', async () => {
        const result = await db.execute(sql`
            select table_name, column_name, data_type
            from information_schema.columns
            where table_schema = 'public'
              and table_name in ('user', 'session', 'account', 'verification')
              and data_type like 'timestamp%'
        `);
        const rows = result.rows as { table_name: string; column_name: string; data_type: string }[];
        // 2 (user) + 3 (session) + 4 (account) + 3 (verification) timestamp columns
        expect(rows).toHaveLength(12);
        for (const row of rows) {
            expect(row.data_type, `${row.table_name}.${row.column_name}`).toBe('timestamp with time zone');
        }
    });
});

describe('profiles.user_id', () => {
    it('a profile cannot point at a missing user', async () => {
        const code = await sqlStateOf(() =>
            db.insert(profiles).values({ firstName: 'Sophie', userId: 'missing-user' }),
        );
        expect(code).toBe('23503'); // foreign_key_violation
    });

    it('two profiles cannot share a user', async () => {
        const userId = await insertUser('u1', 'a@example.com');
        await db.insert(profiles).values({ firstName: 'Sophie', userId });
        const code = await sqlStateOf(() => db.insert(profiles).values({ firstName: 'Karim', userId }));
        expect(code).toBe('23505'); // unique_violation
    });

    it('deleting a user that has a profile is refused', async () => {
        const userId = await insertUser('u2', 'b@example.com');
        await db.insert(profiles).values({ firstName: 'Sophie', userId });
        const code = await sqlStateOf(() => db.execute(sql`delete from "user" where id = ${userId}`));
        expect(code).toBe('23503'); // restrict
    });

    it('a profile may have no user, no last name and no terms acceptance', async () => {
        const [row] = await db.insert(profiles).values({ firstName: 'Sophie' }).returning();
        expect(row.userId).toBeNull();
        expect(row.lastName).toBeNull();
        expect(row.termsAcceptedAt).toBeNull();
        expect(row.termsVersion).toBeNull();
    });
});

describe('check constraints', () => {
    it('refuses an upper-case e-mail', async () => {
        const failure = await failureOf(() => insertUser('u3', 'Upper@Example.com'));
        expect(failure).toEqual({ code: '23514', constraint: 'user_email_lowercase' });
    });

    it('refuses terms date without version and version without date', async () => {
        const withDate = await failureOf(() =>
            db.insert(profiles).values({ firstName: 'Sophie', termsAcceptedAt: new Date() }),
        );
        expect(withDate).toEqual({ code: '23514', constraint: 'profiles_terms_pair' });
        const withVersion = await failureOf(() =>
            db.insert(profiles).values({ firstName: 'Sophie', termsVersion: '2026-11' }),
        );
        expect(withVersion).toEqual({ code: '23514', constraint: 'profiles_terms_pair' });
    });

    it('accepts both or neither', async () => {
        await db.insert(profiles).values({ firstName: 'Sophie' });
        await db.insert(profiles).values({ firstName: 'Karim', termsAcceptedAt: new Date(), termsVersion: '2026-11' });
        const rows = await db.select().from(profiles);
        expect(rows).toHaveLength(2);
    });
});
