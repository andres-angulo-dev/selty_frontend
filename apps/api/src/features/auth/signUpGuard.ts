import { createFirstNameSchema } from '@sialty/domain';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import type { Logger } from 'pino';
import type { Database } from '../../db/client';
import { profiles, user as userTable } from '../../db/schema';

// ============================================
// SIGN-UP GUARD — Better Auth creates an account the first time an unknown
// e-mail signs in with a valid code. It knows nothing of our rules, so this
// guard runs around that creation (databaseHooks.user.create):
// - before: the first name and the acceptance of the terms, read from the
//   sign-in body, and every field the server owns forced to its value;
// - after: the profile (first name, terms date and version). No account may
//   exist without its profile: when the profile fails, the account is removed.
// ============================================

/** Error codes of the guard, read by the app to show the right message */
export const SIGN_UP_ERROR_CODES = {
    firstNameInvalid: 'FIRST_NAME_INVALID',
    termsNotAccepted: 'TERMS_NOT_ACCEPTED',
} as const;

/** User-facing texts (French), also used as the first-name rule messages */
const MESSAGES = {
    firstName: {
        required: 'Indiquez votre prénom.',
        tooLong: 'Votre prénom est trop long.',
        invalid: 'Votre prénom ne peut contenir que des lettres.',
    },
    termsNotAccepted: "Acceptez les conditions d'utilisation pour créer votre compte.",
    accountNotCreated: "Votre compte n'a pas pu être créé. Réessayez dans un instant.",
} as const;

const firstNameSchema = createFirstNameSchema(MESSAGES.firstName);

/**
 * Writes the profile of a new account. An object (not a bare function) so a
 * test can make it fail with vi.spyOn and check the compensation.
 */
export const profileWriter = {
    /**
     * @param db Database
     * @param values The new account's id, first name, and the accepted terms
     */
    insertForUser: async (
        db: Database,
        values: { userId: string; firstName: string; termsAcceptedAt: Date; termsVersion: string },
    ): Promise<void> => {
        await db.insert(profiles).values(values);
    },
};

/** The part of Better Auth's endpoint context the guard reads */
interface HookContext {
    body?: unknown;
}

/** The user row Better Auth is about to create (or has created) */
interface CreatedUser {
    id: string;
    name: string;
    email: string;
    [key: string]: unknown;
}

/**
 * @param body The sign-in body (unknown: it comes from the client)
 * @param key A key of that body
 * @returns The value, or undefined when the body is not an object
 */
const readBodyField = (body: unknown, key: string): unknown =>
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[key] : undefined;

/**
 * Builds the two hooks of databaseHooks.user.create.
 * @param deps db: where the profile is written; termsVersion: stored with the
 *        acceptance; logger: reports a failed profile (never the e-mail)
 * @returns { before, after } for Better Auth
 */
export const createSignUpGuard = ({
    db,
    termsVersion,
    logger,
}: {
    db: Database;
    termsVersion: string;
    logger: Logger;
}) => ({
    /**
     * Checks the sign-up and fixes the server-owned fields.
     * Security: fail closed. Without an endpoint context (an account created
     * by a server call, a future plugin), there is no body, so no accepted
     * terms: the creation is refused rather than let through unchecked.
     * @param user The row Better Auth is about to insert
     * @param context Better Auth's endpoint context (body of the request), or null
     * @returns The row to insert instead
     * @throws APIError 400 FIRST_NAME_INVALID / TERMS_NOT_ACCEPTED
     */
    before: async (user: CreatedUser, context: HookContext | null) => {
        const body = context?.body;

        // Strictly the boolean true: "true", 1 or "yes" are not an explicit acceptance
        if (readBodyField(body, 'acceptTerms') !== true) {
            throw new APIError('BAD_REQUEST', {
                code: SIGN_UP_ERROR_CODES.termsNotAccepted,
                message: MESSAGES.termsNotAccepted,
            });
        }

        // The body's name, not user.name: Better Auth turns a missing name into ""
        const firstName = firstNameSchema.safeParse(readBodyField(body, 'name'));
        if (!firstName.success) {
            throw new APIError('BAD_REQUEST', {
                code: SIGN_UP_ERROR_CODES.firstNameInvalid,
                message: firstName.error.issues[0]?.message ?? MESSAGES.firstName.invalid,
            });
        }

        // Security: fields the client must not choose. Better Auth passes the
        // body's `image` through as is; `emailVerified` is true because the code
        // proved the address. A client-sent `id` never reaches here (unknown
        // keys are dropped by Better Auth); the id stays Better Auth's own.
        return {
            data: {
                ...user,
                name: firstName.data,
                email: user.email.toLowerCase(),
                image: null,
                emailVerified: true,
            },
        };
    },

    /**
     * Creates the profile of the new account.
     * Compensation: if the profile cannot be written, the account is deleted
     * (its sessions and sign-in methods go with it, by cascade) and the
     * sign-in fails, so the next attempt starts again from nothing.
     * @param user The created row
     * @throws APIError 500 when the profile could not be written
     */
    after: async (user: CreatedUser) => {
        try {
            await profileWriter.insertForUser(db, {
                userId: user.id,
                firstName: user.name,
                termsAcceptedAt: new Date(),
                termsVersion,
            });
        } catch (error) {
            // Security: the error goes through the logger's serializers (no
            // bound SQL values); the user is named by id only, never by e-mail
            logger.error({ err: error, userId: user.id }, 'profile of a new account could not be created');
            try {
                await db.delete(userTable).where(eq(userTable.id, user.id));
            } catch (cleanupError) {
                logger.error({ err: cleanupError, userId: user.id }, 'account without profile could not be removed');
            }
            // A generic answer: the database message stays in the logs
            throw new APIError('INTERNAL_SERVER_ERROR', { message: MESSAGES.accountNotCreated });
        }
    },
});
