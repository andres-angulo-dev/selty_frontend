// ============================================
// Builds src/shared/data/frenchOutlines.json: the outlines of the French
// departments and regions, light enough to ship inside the app.
//
// Source: IGN, ADMIN EXPRESS COG CARTO (Licence Ouverte / Open Licence 2.0).
// The licence asks to name the source and its date: the app shows `source`
// and `updatedAt` under the full-screen map.
//
// Run from the frontend folder, about once a year (new official boundaries):
//   node scripts/build-french-outlines.mjs
// Needs network access. mapshaper is run through npx at a pinned version and is
// NOT a dependency of the project: it keeps the borders shared by two neighbours
// identical while simplifying, so no gap appears between two coloured areas.
// ============================================

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAPSHAPER = 'mapshaper@0.7.101';
const SOURCE_URL =
    'https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature' +
    '&TYPENAMES=ADMINEXPRESS-COG-CARTO.LATEST:departement' +
    '&outputFormat=application/json&srsName=EPSG:4326&count=200';

// Largest shift allowed by the simplification. 500 m keeps Paris readable when the
// map frames it; regions are only seen from further away.
const DEPARTMENT_INTERVAL_M = 500;
const REGION_INTERVAL_M = 800;
// 3 decimals = about 100 m, below what the simplification already removes
const PRECISION = '0.001';

const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/shared/data/frenchOutlines.json');

/** Runs mapshaper with the given arguments, stops the script on error */
const mapshaper = (args) => execFileSync('npx', ['-y', MAPSHAPER, ...args], { stdio: 'inherit' });

/**
 * GeoJSON features → { code: polygons }, each polygon = [outer ring, ...holes],
 * each ring = [[longitude, latitude], ...]. Nothing else is kept.
 */
const byCode = (geojson, codeField) => {
    const result = {};
    for (const feature of geojson.features) {
        const { type, coordinates } = feature.geometry;
        result[feature.properties[codeField]] = type === 'Polygon' ? [coordinates] : coordinates;
    }
    return result;
};

const work = mkdtempSync(join(tmpdir(), 'french-outlines-'));
try {
    const raw = join(work, 'raw.json');
    const departments = join(work, 'departments.json');
    const regions = join(work, 'regions.json');

    console.log('Downloading the official outlines (about 20 MB)...');
    const response = await fetch(SOURCE_URL);
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
    writeFileSync(raw, await response.text());

    // Departments first; regions are made by merging them, so both always match
    mapshaper([
        raw,
        '-filter-fields', 'code_insee,code_insee_de_la_region',
        '-simplify', `interval=${DEPARTMENT_INTERVAL_M}`, 'weighted', 'keep-shapes',
        '-o', departments, 'format=geojson', `precision=${PRECISION}`,
    ]);
    mapshaper([
        departments,
        '-dissolve', 'code_insee_de_la_region',
        '-simplify', `interval=${REGION_INTERVAL_M}`, 'weighted', 'keep-shapes',
        '-o', regions, 'format=geojson', `precision=${PRECISION}`,
    ]);

    const departmentData = byCode(JSON.parse(readFileSync(departments, 'utf8')), 'code_insee');
    const regionData = byCode(JSON.parse(readFileSync(regions, 'utf8')), 'code_insee_de_la_region');

    const outlines = {
        source: 'IGN – ADMIN EXPRESS COG CARTO',
        updatedAt: new Date().toISOString().slice(0, 7),   // Month of the download, e.g. "2026-11"
        departments: departmentData,
        regions: regionData,
    };
    writeFileSync(OUTPUT, JSON.stringify(outlines));

    console.log(
        `Wrote ${OUTPUT}: ${Object.keys(departmentData).length} departments, ` +
        `${Object.keys(regionData).length} regions, ${Math.round(readFileSync(OUTPUT).length / 1024)} KB`,
    );
} finally {
    rmSync(work, { recursive: true, force: true });
}
