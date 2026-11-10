import { createDb } from '../src/db/client';
import { COMMUNES_URL, importCommunes, parseCommunes } from '../src/features/commune/importCommunes';

// ============================================
// npm run db:import-communes -w @sialty/api
// Downloads every French commune from geo.api.gouv.fr and writes them into the
// database of DATABASE_URL (apps/api/.env). Safe to run again: known communes
// are updated. To run once at set-up, then once a year (official list changes).
// ============================================

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is missing (apps/api/.env)');

// 60 s: the answer is about 5 MB
const response = await fetch(COMMUNES_URL, { signal: AbortSignal.timeout(60_000) });
if (!response.ok) throw new Error(`geo.api.gouv.fr answered ${response.status}`);

const { rows, skipped } = parseCommunes(await response.json());

const { db, close } = createDb(url);
try {
    const { inserted, updated } = await importCommunes(db, rows);
    // Plain output on purpose: a one-off command, not the server's logs
    process.stdout.write(`Communes: ${inserted} inserted, ${updated} updated, ${skipped.length} skipped\n`);
    if (skipped.length > 0) process.stdout.write(`Skipped (no center): ${skipped.join(', ')}\n`);
} finally {
    await close();
}
