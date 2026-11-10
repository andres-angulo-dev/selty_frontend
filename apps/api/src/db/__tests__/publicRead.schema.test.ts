import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { annonces, professionalProfiles, professionalZones, requests } from '../schema';
import { createTestDb } from '../../test/db';
import {
    insertAnnonce,
    insertCommune,
    insertPro,
    insertProfile,
    insertRequest,
    resetContent,
} from '../../test/factories';

// ============================================
// The rules the database itself enforces on the public read tables (checks,
// generated columns, composite foreign key). Runs against the real sialty_test
// database: the point is to check PostgreSQL, not the code around it.
// ============================================

const { db, close } = createTestDb();

const MELUN = { code: '77288', name: 'Melun', departmentCode: '77', regionCode: '11', lat: 48.5394, lng: 2.6545 };

beforeAll(async () => {
    await resetContent(db);
    await insertCommune(db, MELUN);
});

beforeEach(async () => {
    await resetContent(db);
});

afterAll(async () => {
    // Leave no row pointing at the commune: other test files empty the communes table
    await resetContent(db);
    await close();
});

/**
 * Runs an insert expected to break a constraint.
 * Drizzle wraps the PostgreSQL error: the constraint name is on `cause`.
 * @returns The name of the constraint PostgreSQL reported
 */
const violatedConstraint = async (insert: () => Promise<unknown>): Promise<string | undefined> => {
    try {
        await insert();
    } catch (error) {
        const cause = (error as { cause?: { constraint?: string } }).cause;
        return cause?.constraint;
    }
    throw new Error('the insert was accepted');
};

describe('public read schema', () => {
    it('refuses a fixed-price annonce without a price', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });

        const constraint = await violatedConstraint(() =>
            insertAnnonce(db, { professionalId, communeCode: MELUN.code, priceType: 'fixed', price: null }),
        );

        expect(constraint).toBe('annonces_price_check');
    });

    it('computes description_length as char_length of the description', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });
        // Accents count as one character each (char_length, not bytes)
        const description = 'Rénovation complète de salle de bain, carrelage et peinture.';
        const id = await insertAnnonce(db, { professionalId, communeCode: MELUN.code, description });

        const [row] = await db
            .select({ length: annonces.descriptionLength, expected: sql<number>`char_length(${annonces.description})` })
            .from(annonces)
            .where(eq(annonces.id, id));

        expect(row.length).toBe(description.length);
        expect(row.length).toBe(row.expected);
    });

    it('refuses a city zone without a commune', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });

        const constraint = await violatedConstraint(() =>
            db.insert(professionalZones).values({ id: 'city-x', professionalId, kind: 'city', radiusKm: 10 }),
        );

        expect(constraint).toBe('professional_zones_columns_check');
    });

    it('refuses an unknown professional status', async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code });

        const constraint = await violatedConstraint(() =>
            db.execute(sql`update ${professionalProfiles} set status = 'banana' where id = ${professionalId}`),
        );

        expect(constraint).toBe('professional_profiles_status_check');
    });

    it('lets the factory insert an expired request (expires_at in the past)', async () => {
        const authorId = await insertProfile(db);
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const id = await insertRequest(db, { authorId, communeCode: MELUN.code, expiresAt: yesterday });

        const [row] = await db
            .select({ expiresAt: requests.expiresAt, createdAt: requests.createdAt })
            .from(requests)
            .where(eq(requests.id, id));
        expect(row.expiresAt.getTime()).toBe(yesterday.getTime());
        expect(row.expiresAt.getTime()).toBeLessThan(Date.now());
        expect(row.createdAt.getTime()).toBeLessThan(row.expiresAt.getTime());
    });

    it("refuses an annonce in a trade that is not one of its professional's trades", async () => {
        const { professionalId } = await insertPro(db, { communeCode: MELUN.code, tradeIds: ['trade-painter'] });

        const constraint = await violatedConstraint(() =>
            insertAnnonce(db, { professionalId, communeCode: MELUN.code, tradeId: 'trade-plumber' }),
        );

        expect(constraint).toBe('annonces_professional_trade_fk');
    });
});
