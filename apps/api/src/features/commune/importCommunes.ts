import { sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '../../db/client';
import { communes, type CommuneRow } from '../../db/schema';

// ============================================
// COMMUNES IMPORT — reads the answer of geo.api.gouv.fr and writes it into the
// communes table. Meant to run again every year, when the official list changes.
// ============================================

/** Address of the full list: about 35 000 communes, 5 MB of JSON */
export const COMMUNES_URL =
    'https://geo.api.gouv.fr/communes?fields=code,nom,centre,surface,codeDepartement,codeRegion&format=json';

// What the API sends for one commune. Security: external data is checked
// like user input; an unexpected shape stops the import before any write.
const apiCommuneSchema = z.object({
    code: z.string().min(1),
    nom: z.string().min(1),
    // GeoJSON point: coordinates in the order [longitude, latitude]
    centre: z
        .object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) })
        .optional(),
    // Hectares, with decimals (Melun: 800.45)
    surface: z.number().nonnegative().optional(),
    codeDepartement: z.string().min(1),
    codeRegion: z.string().min(1),
});

/**
 * @param payload The parsed JSON answer of COMMUNES_URL
 * @returns The rows to write, and the communes skipped because they have no
 *          center ("93063 Romainville"): a request could not be placed in them
 * @throws When the answer is not a list of communes in the expected format
 */
export const parseCommunes = (payload: unknown): { rows: CommuneRow[]; skipped: string[] } => {
    const entries = z.array(apiCommuneSchema).parse(payload);
    const rows: CommuneRow[] = [];
    const skipped: string[] = [];

    for (const entry of entries) {
        if (!entry.centre) {
            skipped.push(`${entry.code} ${entry.nom}`);
            continue;
        }
        const [longitude, latitude] = entry.centre.coordinates;
        rows.push({
            code: entry.code,
            name: entry.nom,
            departmentCode: entry.codeDepartement,
            regionCode: entry.codeRegion,
            surfaceHectares: entry.surface ?? null,
            center: { x: longitude, y: latitude },
        });
    }
    return { rows, skipped };
};

/**
 * Writes the communes: a known code is updated, a new one inserted.
 * One transaction for everything: if one row fails, nothing changes, so the
 * table is never left half-filled (the previous list stays in place).
 *
 * @param batchSize Rows per INSERT; 1 000 keeps each query far below the
 *                  65 535 parameters PostgreSQL accepts (6 per row)
 * @returns How many rows were inserted and how many updated
 */
export const importCommunes = async (
    db: Database,
    rows: CommuneRow[],
    batchSize = 1000,
): Promise<{ inserted: number; updated: number }> =>
    db.transaction(async (tx) => {
        let inserted = 0;
        let updated = 0;

        for (let start = 0; start < rows.length; start += batchSize) {
            const result = await tx
                .insert(communes)
                .values(rows.slice(start, start + batchSize))
                .onConflictDoUpdate({
                    target: communes.code,
                    // "excluded" = the row we tried to insert
                    set: {
                        name: sql`excluded.name`,
                        departmentCode: sql`excluded.department_code`,
                        regionCode: sql`excluded.region_code`,
                        surfaceHectares: sql`excluded.surface_ha`,
                        center: sql`excluded.center`,
                    },
                })
                // PostgreSQL trick: xmax is 0 for a freshly inserted row, not for an updated one
                .returning({ wasInserted: sql<boolean>`(xmax = 0)` });

            for (const row of result) {
                if (row.wasInserted) inserted += 1;
                else updated += 1;
            }
        }
        return { inserted, updated };
    });
