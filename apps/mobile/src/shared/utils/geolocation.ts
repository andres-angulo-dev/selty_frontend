// ============================================
// GEOLOCATION UTILITIES
// The distance itself is a shared rule (the server checks zones with it):
// it lives in @sialty/domain and is re-exported here so screens keep one import.
// ============================================
export { calculateDistance } from '@sialty/domain';

// Format distance for display // < 1 km -> "500 m" - >= 1 km -> "2,3km"
export const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}
