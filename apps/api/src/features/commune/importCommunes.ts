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

export interface ImportOptions {
    /** Rows per INSERT; 1 000 keeps each query far below the 65 535 parameters PostgreSQL accepts (6 per row) */
    batchSize?: number;
    /**
     * Smallest accepted size of the new list, as a share of the table. A list
     * much shorter than the table is a cut or broken answer, not a reform: the
     * import stops instead of deleting thousands of communes. A real yearly
     * change removes a few hundred at most (merged communes), below 1 %.
     */
    minKeepRatio?: number;
}

/**
 * Makes the table match the new official list: a known code is updated, a new
 * one inserted, a code no longer in the list deleted (communes merged into a
 * "commune nouvelle").
 * One transaction for everything: if one step fails, nothing changes, so the
 * table is never left half-filled (the previous list stays in place).
 * When requests reference communes (plan 5), deleting a referenced one will
 * fail on its foreign key, and so stop the whole import: on purpose, those
 * requests must be moved to the new commune first.
 *
 * @returns How many rows were inserted, updated and deleted
 * @throws When the new list is too short compared with the table (see minKeepRatio)
 */
export const importCommunes = async (
    db: Database,
    rows: CommuneRow[],
    { batchSize = 1000, minKeepRatio = 0.95 }: ImportOptions = {},
): Promise<{ inserted: number; updated: number; deleted: number }> =>
    db.transaction(async (tx) => {
        // Guard against a cut answer, before writing anything
        const [{ total }] = await tx.select({ total: sql<number>`count(*)::int` }).from(communes);
        if (total > 0 && rows.length < total * minKeepRatio) {
            throw new Error(
                `Refused: the new list has ${rows.length} communes, there are ${total} in the table`,
            );
        }

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

        // Codes no longer in the list. The whole list is ONE parameter (a text
        // array), so 35 000 codes stay far below the parameter limit.
        const codes = rows.map((row) => row.code);
        const removed = await tx
            .delete(communes)
            .where(sql`not (${communes.code} = any(${sql.param(codes)}::text[]))`)
            .returning({ code: communes.code });

        return { inserted, updated, deleted: removed.length };
    });
