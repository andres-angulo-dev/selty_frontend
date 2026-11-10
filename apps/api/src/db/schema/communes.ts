import { doublePrecision, geometry, index, pgTable, text } from 'drizzle-orm/pg-core';

// ============================================
// COMMUNES — every French commune, imported from geo.api.gouv.fr (the API the
// app already uses for the postal code / city fields).
// A request is placed at the center of its commune (the address stays private):
// departments and regions compare by code, only city zones need a distance.
// ============================================

export const communes = pgTable(
    'communes',
    {
        // INSEE code ("77288"): stable, unlike postal codes shared by several communes
        code: text('code').primaryKey(),
        name: text('name').notNull(),
        departmentCode: text('department_code').notNull(),
        regionCode: text('region_code').notNull(),
        // Surface in hectares, as given by the API; null when it is unknown.
        // Gives the estimated size of the city (estimateCityRadiusKm in @sialty/domain)
        surfaceHectares: doublePrecision('surface_ha'),
        // PostGIS point in GPS coordinates (SRID 4326 = WGS 84), read as { x: longitude, y: latitude }
        center: geometry('center', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    },
    (table) => [
        index('communes_department_code_idx').on(table.departmentCode),
        index('communes_region_code_idx').on(table.regionCode),
        // Spatial index: "communes within 30 km" without reading the whole table
        index('communes_center_gist_idx').using('gist', table.center),
    ],
);

export type CommuneRow = typeof communes.$inferInsert;
