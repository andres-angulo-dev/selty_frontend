import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';

// ============================================
// PROFILES — the person behind an account (one account, two modes: the
// professional profile in people.ts is optional).
// Alone in its file so media.ts and people.ts can both point at it without
// importing each other. The account itself (login, sessions) comes with
// Better Auth: its four tables live in auth.ts (user, session, account, verification),
// so no table here may take one of those names.
// ============================================

/** The person behind the account; user_id links it to the login (null for seed people without account) */
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    // Never sent to other users: only its initial is public ("Sophie M.").
    // Nullable: it is asked after sign-up, not at sign-up
    lastName: text('last_name'),
    // Restrict: deleting an account with a profile is refused until plan 6 defines the deletion rules
    userId: text('user_id')
        .unique()
        .references(() => user.id, { onDelete: 'restrict' }),
    // When and which version of the terms the person accepted at sign-up
    termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
    termsVersion: text('terms_version'),
    memberSince: timestamp('member_since', { withTimezone: true }).notNull().defaultNow(),
});

export type ProfileRow = typeof profiles.$inferInsert;
