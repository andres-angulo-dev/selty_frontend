import { Professional, ServiceZone } from '@/shared/types';
import type { MapPoint, MapZone } from '@/shared/components/MapPreview';

// What MapPreview needs to draw a professional's location
export interface ProfessionalMapData {
    markers: MapPoint[];
    zones: MapZone[];
}

/**
 * Translates the business model (locationType + service zones) into map primitives.
 * Lives in utils so every screen showing a professional shares the exact same rule.
 *
 * - Pin: only for a place customers come to, and only with coordinates.
 * - Circle: one per city zone, centered on the commune, whatever the locationType,
 *   since zones are where the professional really accepts requests. Its radius adds
 *   the size of the city to the km chosen around it, like the eligibility rule.
 * - Other zones have no shape: name them with getUndrawableZoneNames.
 *
 * @param professional The displayed professional
 * @param zones Their zones (see useProfessionalServiceArea)
 * @returns The data to draw, or null when there is nothing: callers fall back to MapPlaceholder
 */
export const getProfessionalMapData = (
    professional: Professional,
    zones: ServiceZone[],
): ProfessionalMapData | null => {
    const { latitude, longitude, locationType } = professional;
    const hasPlace = locationType === 'fixed' || locationType === 'both';

    const markers: MapPoint[] =
        hasPlace && latitude !== null && longitude !== null ? [{ latitude, longitude }] : [];

    const circles: MapZone[] = zones.flatMap((zone) =>
        zone.kind === 'city'
            ? [{
                latitude: zone.latitude,
                longitude: zone.longitude,
                radiusKm: zone.cityRadiusKm + zone.radiusKm,
            }]
            : [],
    );

    return markers.length > 0 || circles.length > 0 ? { markers, zones: circles } : null;
};
