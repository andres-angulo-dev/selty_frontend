// ============================================           
// GEOLOCATION UTILITIES
// ============================================
// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;


// Convert degrees to radians
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180)
};

// Calculate distance between two GPS coordinates using Haversine formula
// Returns distance in kilometers
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number => {
    // Difference in coordinates converted to radians
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    // Haversine formula
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon /2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in km
    return EARTH_RADIUS_KM * c;
};

// Format distance for display // < 1 km -> "500 m" - >= 1 km -> "2,3km"
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}