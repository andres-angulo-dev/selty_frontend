import { Professional } from '@/shared/types';
import type { MapPoint, MapZone } from '@/shared/components/MapPreview';

// What MapPreview needs to draw a professional's location
export interface ProfessionalMapData {
    markers: MapPoint[];
    zones: MapZone[];
}

// Translates the business model (locationType + radius) into map primitives.
// Returns null when the professional has no coordinates: callers fall back to MapPlaceholder.
// Lives in utils so both detail screens (offer, annonce) share the exact same rule.
export const getProfessionalMapData = (professional: Professional): ProfessionalMapData | null => {
    const { latitude, longitude, locationType, interventionRadiusKm } = professional;
    if (latitude === null || longitude === null) return null;

    const point: MapPoint = { latitude, longitude };
    const hasPlace = locationType === 'fixed' || locationType === 'both';
    const hasZone = (locationType === 'mobile' || locationType === 'both') && !!interventionRadiusKm;

    return {
        markers: hasPlace ? [point] : [],
        zones: hasZone ? [{ ...point, radiusKm: interventionRadiusKm }] : [],
    };
};
