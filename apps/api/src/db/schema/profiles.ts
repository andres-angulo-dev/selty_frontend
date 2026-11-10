import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// ============================================
// PROFILES — the person behind an account (one account, two modes: the
// professional profile in people.ts is optional).
// Alone in its file so media.ts and people.ts can both point at it without
// importing each other. The account itself (login, sessions) comes with
// Better Auth: no table here may be named user, session, account or verification.
// ============================================

/** The person behind the account. Plan 3 adds user_id (link to Better Auth's user) */
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    // Never sent to other users: only its initial is public ("Sophie M.")
    lastName: text('last_name').notNull(),
    memberSince: timestamp('member_since', { withTimezone: true }).notNull().defaultNow(),
});

export type ProfileRow = typeof profiles.$inferInsert;
