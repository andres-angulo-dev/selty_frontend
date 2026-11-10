import type { ProServiceArea, ServiceRequest, ServiceZone } from '../types';
import { FRENCH_DEPARTMENTS } from '../geo/frenchGeo';
import { calculateDistance } from '../geo/distance';

// ============================================
// Can this professional answer this request?
// The rule and its parameters are written in requests/requestRules.ts.
// Everyone SEES every open request; only answering is limited. This only drives
// the display: the server must enforce the same rule.
// ============================================

export type ProAnswerEligibility = 'can_answer' | 'own_request' | 'other_trade' | 'out_of_zones';

/** "Évry-Courcouronnes" and "evry courcouronnes" are the same commune */
const normalizeCity = (city: string): string =>
    city
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-']/g, ' ')
        .toLowerCase()
        .trim();

/**
 * @param zone            a zone of the professional
 * @param request         the request
 * @param isRemoteCapable the request's trade can be done at a distance
 * @returns true when the request falls inside this zone
 */
export const isRequestInZone = (zone: ServiceZone, request: ServiceRequest, isRemoteCapable: boolean): boolean => {
    switch (zone.kind) {
        case 'country':
            return isRemoteCapable;
        case 'department':
            return request.department === zone.code;
        case 'region':
            return FRENCH_DEPARTMENTS.some(
                (department) => department.code === request.department && department.regionCode === zone.code,
            );
        case 'city': {
            const isSameCommune =
                request.department === zone.department && normalizeCity(request.city) === normalizeCity(zone.city);
            if (isSameCommune) {
                return true;
            }
            if (request.latitude === null || request.longitude === null) {
                return request.department === zone.department;
            }
            const distanceKm = calculateDistance(zone.latitude, zone.longitude, request.latitude, request.longitude);
            return distanceKm <= zone.cityRadiusKm + zone.radiusKm;
        }
    }
};

/**
 * Applies the rule in order: the first failing condition explains the refusal.
 * The "open" condition is checked by the screen, which knows the status.
 */
export const getProAnswerEligibility = (
    area: ProServiceArea,
    request: ServiceRequest,
    isRemoteCapable: boolean,
): ProAnswerEligibility => {
    if (request.author.id === area.userId) {
        return 'own_request';
    }
    if (!area.tradeIds.includes(request.tradeId)) {
        return 'other_trade';
    }
    return area.zones.some((zone) => isRequestInZone(zone, request, isRemoteCapable)) ? 'can_answer' : 'out_of_zones';
};
