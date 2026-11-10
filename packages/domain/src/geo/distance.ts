// ============================================
// Distance between two GPS points, shared by the app ("à 3 km") and the
// server (zone checks). Moved from the app's shared/utils/geolocation.ts.
// ============================================

// Mean Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/** Converts degrees to radians */
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

/**
 * Great-circle distance with the Haversine formula: exact on a sphere, about
 * 0.5 % off on the real Earth, which is far below what a city zone needs.
 *
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Differences of coordinates, in radians
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    // Haversine: a = square of half the chord length between the points
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    // Angular distance in radians, then in kilometers
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};
