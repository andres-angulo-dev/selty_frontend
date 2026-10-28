import type { Region } from 'react-native-maps';
import type { MapPoint, MapZone } from '@/shared/components/MapPreview';

// ~111 km per degree of latitude; longitude shrinks with the cosine of the latitude
const KM_PER_DEGREE = 111;
const MIN_DELTA = 0.02;              // Never zoom closer than ~2 km (a single pin stays readable)
const PADDING_FACTOR = 1.4;          // Breathing room around the bounding box

// Smallest region that contains every point and every full circle.
// Shared by MapPreview (static) and LocationMapScreen (interactive) so both frame the same way.
export const computeRegion = (markers: MapPoint[], zones: MapZone[]): Region | null => {
    // Markers are zones with a 0 km radius: one list, one rule
    const points: MapZone[] = [...markers.map((marker) => ({ ...marker, radiusKm: 0 })), ...zones];
    if (points.length === 0) return null;

    // Each zone extends the bounding box by its radius, converted to degrees
    const bounds = points.map((point) => {
        const latPad = point.radiusKm / KM_PER_DEGREE;
        const lngPad = point.radiusKm / (KM_PER_DEGREE * Math.cos((point.latitude * Math.PI) / 180));
        return {
            minLat: point.latitude - latPad,
            maxLat: point.latitude + latPad,
            minLng: point.longitude - lngPad,
            maxLng: point.longitude + lngPad,
        };
    });

    const minLat = Math.min(...bounds.map((b) => b.minLat));
    const maxLat = Math.max(...bounds.map((b) => b.maxLat));
    const minLng = Math.min(...bounds.map((b) => b.minLng));
    const maxLng = Math.max(...bounds.map((b) => b.maxLng));

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * PADDING_FACTOR, MIN_DELTA),
        longitudeDelta: Math.max((maxLng - minLng) * PADDING_FACTOR, MIN_DELTA),
    };
};
