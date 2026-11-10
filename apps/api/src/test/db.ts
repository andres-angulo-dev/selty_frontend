import { createDb } from '../db/client';

// ============================================
// TEST DATABASE — the separate sialty_test base, never the development one:
// tests empty tables. CI sets DATABASE_URL_TEST to its own PostGIS service.
// ============================================

export const TEST_DATABASE_URL =
    process.env.DATABASE_URL_TEST ?? 'postgres://sialty:sialty@localhost:5432/sialty_test';

/** A connection to the test database; call `close` in afterAll */
export const createTestDb = () => createDb(TEST_DATABASE_URL);
