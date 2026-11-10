import { FRENCH_DEPARTMENTS } from '@sialty/domain';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { createDb } from '../../../db/client';
import { communes } from '../../../db/schema';

// ============================================
// Checks the REAL imported list (sialty_dev), not a fixture: every department
// the app offers as a zone must have communes, or requests there could not be
// placed. Skipped by default (CI has no imported list):
//   CHECK_DEV_DATA=1 npm test -w @sialty/api
// ============================================

const DEV_DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://sialty:sialty@localhost:5432/sialty_dev';

describe.skipIf(!process.env.CHECK_DEV_DATA)('imported communes (development database)', () => {
    const { db, close } = createDb(DEV_DATABASE_URL);

    afterAll(async () => {
        await close();
    });

    it('cover every department of the app', async () => {
        const rows = await db
            .select({ code: communes.departmentCode, total: sql<number>`count(*)::int` })
            .from(communes)
            .groupBy(communes.departmentCode);
        const known = new Set(rows.map((row) => row.code));

        const missing = FRENCH_DEPARTMENTS.filter((department) => !known.has(department.code));
        expect(missing).toEqual([]);
    });
});
