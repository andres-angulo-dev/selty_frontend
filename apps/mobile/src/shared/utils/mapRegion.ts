import type { Region } from 'react-native-maps';
import type { MapArea, MapPoint, MapZone } from '@/shared/components/MapPreview';

// ~111 km per degree of latitude; longitude shrinks with the cosine of the latitude
const KM_PER_DEGREE = 111;
const MIN_DELTA = 0.02;              // Never zoom closer than ~2 km (a single pin stays readable)
const PADDING_FACTOR = 1.4;          // Breathing room around the bounding box

// Smallest region that contains every point, every full circle and every coloured shape.
// Shared by MapPreview (static) and LocationMapScreen (interactive) so both frame the same way.
export const computeRegion = (markers: MapPoint[], zones: MapZone[], areas: MapArea[] = []): Region | null => {
    // Markers and the corners of the shapes are zones with a 0 km radius: one list, one rule
    // (the holes of a shape are inside its outline, they never widen the frame)
    const corners = areas.flatMap((area) => area.coordinates);
    const points: MapZone[] = [...[...markers, ...corners].map((point) => ({ ...point, radiusKm: 0 })), ...zones];
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

    // reduce, not Math.min(...array): a region has thousands of corners, too many arguments for a spread
    const minLat = bounds.reduce((min, b) => Math.min(min, b.minLat), Infinity);
    const maxLat = bounds.reduce((max, b) => Math.max(max, b.maxLat), -Infinity);
    const minLng = bounds.reduce((min, b) => Math.min(min, b.minLng), Infinity);
    const maxLng = bounds.reduce((max, b) => Math.max(max, b.maxLng), -Infinity);

    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * PADDING_FACTOR, MIN_DELTA),
        longitudeDelta: Math.max((maxLng - minLng) * PADDING_FACTOR, MIN_DELTA),
    };
};
