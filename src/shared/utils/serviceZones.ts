import type { ProServiceArea, ServiceZone } from '@/shared/types';
import { FRENCH_DEPARTMENTS, FRENCH_REGIONS } from '@/shared/constants/frenchGeo';
import { REQUEST_RULES } from '@/shared/constants/requestRules';

// ============================================
// Changes to a professional's trades and zones, as pure functions: they take the
// current list and return a new one (nothing is mutated) with the outcome, so
// the rules can be tested without a screen and the screen only shows messages.
// ============================================

export type AddZoneResult =
    | { outcome: 'added'; zones: ServiceZone[]; replaced: string[] }   // replaced: departments now inside the region
    | { outcome: 'updated'; zones: ServiceZone[] }                     // same city, new radius
    | { outcome: 'duplicate' }
    | { outcome: 'covered_by_region'; regionName: string }
    | { outcome: 'limit_reached' };

/** Size of a city from its surface, seen as a circle: 800 ha → 1.6 km */
export const estimateCityRadiusKm = (surfaceHectares: number | null): number =>
    surfaceHectares === null ? 0 : Math.sqrt(surfaceHectares / 100 / Math.PI);

const regionCodeOf = (departmentCode: string): string | undefined =>
    FRENCH_DEPARTMENTS.find((department) => department.code === departmentCode)?.regionCode;

/** Builders keep the zone IDs consistent: duplicates are detected from them */
export const buildDepartmentZone = (code: string, name: string): ServiceZone => ({ kind: 'department', id: `department-${code}`, code, name });
export const buildRegionZone = (code: string, name: string): ServiceZone => ({ kind: 'region', id: `region-${code}`, code, name });
export const COUNTRY_ZONE: ServiceZone = { kind: 'country', id: 'country' };

/** Adds a zone, applying the "no duplicates" rules and the maximum */
export const addZone = (zones: ServiceZone[], zone: ServiceZone): AddZoneResult => {
    const existing = zones.find((candidate) => candidate.id === zone.id);
    if (existing) {
        // Same city with another radius: change it instead of adding a second zone
        if (zone.kind === 'city' && existing.kind === 'city' && existing.radiusKm !== zone.radiusKm) {
            return { outcome: 'updated', zones: zones.map((candidate) => (candidate.id === zone.id ? zone : candidate)) };
        }
        return { outcome: 'duplicate' };
    }

    if (zone.kind === 'department') {
        const regionCode = regionCodeOf(zone.code);
        const region = zones.find((candidate) => candidate.kind === 'region' && candidate.code === regionCode);
        if (region && region.kind === 'region') {
            return { outcome: 'covered_by_region', regionName: region.name };
        }
    }

    // A region replaces the departments it contains: they are removed BEFORE
    // checking the maximum, since the list gets shorter
    const contained = zone.kind === 'region'
        ? zones.filter((candidate) => candidate.kind === 'department' && regionCodeOf(candidate.code) === zone.code)
        : [];
    const kept = zones.filter((candidate) => !contained.includes(candidate));
    if (kept.length >= REQUEST_RULES.maxZones) {
        return { outcome: 'limit_reached' };
    }
    return {
        outcome: 'added',
        zones: [...kept, zone],
        replaced: contained.flatMap((candidate) => (candidate.kind === 'department' ? [candidate.name] : [])),
    };
};

/** A professional always keeps at least one zone */
export const removeZone = (zones: ServiceZone[], zoneId: string): ServiceZone[] | null =>
    zones.length <= REQUEST_RULES.minZones ? null : zones.filter((zone) => zone.id !== zoneId);

export type RemoveTradeResult =
    | { outcome: 'removed'; area: ProServiceArea; countryZoneRemoved: boolean }
    | { outcome: 'last_trade' }
    | { outcome: 'country_is_only_zone' };

/**
 * Removes a trade. Without any remote trade left, "Toute la France" no longer
 * means anything and goes too, unless it is the only zone: another one is needed first.
 */
export const removeTrade = (
    area: ProServiceArea,
    tradeId: string,
    isRemoteCapable: (tradeId: string) => boolean,
): RemoveTradeResult => {
    const tradeIds = area.tradeIds.filter((id) => id !== tradeId);
    if (tradeIds.length < REQUEST_RULES.minTrades) {
        return { outcome: 'last_trade' };
    }
    const hasCountry = area.zones.some((zone) => zone.kind === 'country');
    const dropCountry = hasCountry && !tradeIds.some(isRemoteCapable);
    if (dropCountry && area.zones.length <= REQUEST_RULES.minZones) {
        return { outcome: 'country_is_only_zone' };
    }
    return {
        outcome: 'removed',
        area: {
            ...area,
            tradeIds,
            zones: dropCountry ? area.zones.filter((zone) => zone.kind !== 'country') : area.zones,
        },
        countryZoneRemoved: dropCountry,
    };
};

/** Regions list ready for a select field */
export const REGION_OPTIONS = FRENCH_REGIONS.map((region) => ({ value: region.code, label: region.name }));

/** Departments list ready for a select field: "Seine-et-Marne (77)" */
export const DEPARTMENT_OPTIONS = FRENCH_DEPARTMENTS.map((department) => ({
    value: department.code,
    label: `${department.name} (${department.code})`,
}));
