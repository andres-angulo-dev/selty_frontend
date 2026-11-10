import type { MapArea, MapPoint } from '@/shared/components/MapPreview';
import type { ServiceZone } from '@/shared/types';

// ============================================
// Zone outlines — the shape of a department or a region, to colour it on a map.
// Data: IGN ADMIN EXPRESS (Licence Ouverte 2.0), simplified by
// scripts/build-french-outlines.mjs. The licence asks to show getOutlinesSource()
// wherever the shapes are displayed in full.
// ============================================

// Stored as [longitude, latitude] pairs (GeoJSON order) to stay compact
type Ring = number[][];
type Polygon = Ring[];          // Outer ring, then its holes

interface FrenchOutlines {
    source: string;
    updatedAt: string;
    departments: Record<string, Polygon[]>;
    regions: Record<string, Polygon[]>;
}

// Read on first use, not at app start: the file holds ~450 KB of coordinates, and many
// screens import this module (zone names) without ever drawing a map
let outlines: FrenchOutlines | null = null;
const getOutlines = (): FrenchOutlines => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    outlines ??= require('../data/frenchOutlines.json') as FrenchOutlines;
    return outlines;
};

/**
 * @returns "IGN – ADMIN EXPRESS COG CARTO, 2026-11": the mention the licence asks for
 */
export const getOutlinesSource = (): string => `${getOutlines().source}, ${getOutlines().updatedAt}`;

const toPoints = (ring: Ring): MapPoint[] =>
    ring.map(([longitude, latitude]) => ({ latitude, longitude }));

// Conversion done once per zone: the same department is drawn on several screens
const cache = new Map<string, MapArea[]>();

const getAreas = (key: string, polygons: Polygon[] | undefined): MapArea[] => {
    if (!polygons) return [];
    const cached = cache.get(key);
    if (cached) return cached;

    const areas = polygons.map(([outer, ...holes]) => ({
        coordinates: toPoints(outer),
        ...(holes.length > 0 ? { holes: holes.map(toPoints) } : {}),
    }));
    cache.set(key, areas);
    return areas;
};

/**
 * Shapes to colour for one zone. A city zone is a circle (see professionalMap)
 * and France would fill the whole map: both return nothing here.
 *
 * @param zone A zone of a professional
 * @returns Its shapes, empty when it has none (or an unknown code)
 */
export const getZoneAreas = (zone: ServiceZone): MapArea[] => {
    switch (zone.kind) {
        case 'department':
            return getAreas(`department-${zone.code}`, getOutlines().departments[zone.code]);
        case 'region':
            return getAreas(`region-${zone.code}`, getOutlines().regions[zone.code]);
        default:
            return [];
    }
};

/**
 * Ray casting: a horizontal line from the point crosses the edges of a ring an odd
 * number of times when the point is inside. Good enough at the scale of a
 * department (the earth's curve is ignored).
 */
const isInRing = (point: MapPoint, ring: MapPoint[]): boolean => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const a = ring[i];
        const b = ring[j];
        const crosses =
            a.latitude > point.latitude !== b.latitude > point.latitude &&
            point.longitude <
                ((b.longitude - a.longitude) * (point.latitude - a.latitude)) / (b.latitude - a.latitude) + a.longitude;
        if (crosses) inside = !inside;
    }
    return inside;
};

/**
 * @param point A position
 * @param areas Shapes drawn on the map
 * @returns true when the position is inside one of them (and not in one of its holes)
 */
export const isPointInAreas = (point: MapPoint, areas: MapArea[]): boolean =>
    areas.some(
        (area) =>
            isInRing(point, area.coordinates) &&
            !(area.holes ?? []).some((hole) => isInRing(point, hole)),
    );
