import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { communes, type CommuneRow } from '../../../db/schema';
import { createTestDb } from '../../../test/db';
import { importCommunes, parseCommunes } from '../importCommunes';
import fixture from './fixtures/communes.json';

// ============================================
// Import of the French communes (geo.api.gouv.fr). Real entries in the fixture,
// copied from the API on 2026-11-10. The import can run again at any time
// (yearly update) and never leaves the table half-filled.
// ============================================

const { db, close } = createTestDb();

beforeEach(async () => {
    await db.delete(communes);
});

afterAll(async () => {
    await close();
});

const countCommunes = async (): Promise<number> => {
    const [row] = await db.select({ value: count() }).from(communes);
    return row.value;
};

describe('parseCommunes', () => {
    it('turns the API answer into rows', () => {
        const { rows, skipped } = parseCommunes(fixture);
        expect(rows).toHaveLength(5);
        expect(skipped).toEqual([]);
        expect(rows[0]).toEqual({
            code: '77288',
            name: 'Melun',
            departmentCode: '77',
            regionCode: '11',
            surfaceHectares: 800.45,
            center: { x: 2.6552, y: 48.5421 },
        });
    });

    it('keeps a commune without surface, with a null surface', () => {
        const [melun] = fixture;
        const { rows } = parseCommunes([{ ...melun, surface: undefined }]);
        expect(rows[0].surfaceHectares).toBeNull();
    });

    it('skips a commune without center and names it', () => {
        const [melun, romainville] = fixture;
        const { rows, skipped } = parseCommunes([melun, { ...romainville, centre: undefined }]);
        expect(rows.map((row) => row.code)).toEqual(['77288']);
        expect(skipped).toEqual(['93063 Romainville']);
    });

    it('refuses an answer whose format changed, so nothing is imported', () => {
        expect(() => parseCommunes([{ code: '1' }])).toThrow();
        expect(() => parseCommunes({ error: 'rate limited' })).toThrow();
    });
});

describe('importCommunes', () => {
    it('inserts every row', async () => {
        const result = await importCommunes(db, parseCommunes(fixture).rows);
        expect(result).toEqual({ inserted: 5, updated: 0 });
        expect(await countCommunes()).toBe(5);
    });

    it('can run twice: the second run updates, nothing is duplicated', async () => {
        const { rows } = parseCommunes(fixture);
        await importCommunes(db, rows);

        const renamed = rows.map((row) => (row.code === '77288' ? { ...row, name: 'Melun (renamed)' } : row));
        const result = await importCommunes(db, renamed);

        expect(result).toEqual({ inserted: 0, updated: 5 });
        expect(await countCommunes()).toBe(5);
        const [melun] = await db.select().from(communes).where(eq(communes.code, '77288'));
        expect(melun.name).toBe('Melun (renamed)');
    });

    it('changes nothing when one row fails: all or nothing', async () => {
        const { rows } = parseCommunes(fixture);
        await importCommunes(db, rows.slice(0, 2));

        // Third row breaks a constraint (name is required): forced past the types on purpose
        const broken = rows.map((row, index) => (index === 2 ? ({ ...row, name: null } as unknown as CommuneRow) : row));
        await expect(importCommunes(db, broken)).rejects.toThrow();

        expect(await countCommunes()).toBe(2);
    });

    it('works across several batches', async () => {
        const { rows } = parseCommunes(fixture);
        const result = await importCommunes(db, rows, 2);
        expect(result).toEqual({ inserted: 5, updated: 0 });
        expect(await countCommunes()).toBe(5);
    });
});
