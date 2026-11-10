import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { communes } from '../schema';
import { createTestDb } from '../../test/db';

// ============================================
// The communes table: a GPS point stored with PostGIS and read back exactly.
// Runs against the real sialty_test database (never a fake: the point is to
// check PostgreSQL and PostGIS themselves).
// ============================================

const { db, close } = createTestDb();

beforeEach(async () => {
    await db.delete(communes);
});

afterAll(async () => {
    await close();
});

const MELUN = {
    code: '77288',
    name: 'Melun',
    departmentCode: '77',
    regionCode: '11',
    surfaceHectares: 803,
    // GeoJSON order: x = longitude, y = latitude
    center: { x: 2.6545, y: 48.5394 },
};

describe('communes table', () => {
    it('stores the center as a PostGIS point in GPS coordinates (SRID 4326)', async () => {
        await db.insert(communes).values(MELUN);

        const [row] = await db
            .select({
                lon: sql<number>`ST_X(${communes.center})`,
                lat: sql<number>`ST_Y(${communes.center})`,
                srid: sql<number>`ST_SRID(${communes.center})`,
            })
            .from(communes)
            .where(eq(communes.code, '77288'));

        expect(row).toEqual({ lon: 2.6545, lat: 48.5394, srid: 4326 });
    });

    it('reads the center back as { x, y }', async () => {
        await db.insert(communes).values(MELUN);
        const [row] = await db.select().from(communes).where(eq(communes.code, '77288'));
        expect(row.center).toEqual({ x: 2.6545, y: 48.5394 });
        expect(row.surfaceHectares).toBe(803);
    });

    it('accepts a commune without a known surface', async () => {
        await db.insert(communes).values({ ...MELUN, surfaceHectares: null });
        const [row] = await db.select().from(communes);
        expect(row.surfaceHectares).toBeNull();
    });
});
