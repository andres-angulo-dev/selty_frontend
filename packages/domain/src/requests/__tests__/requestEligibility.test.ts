import { describe, expect, it } from 'vitest';
import type { ProServiceArea, ServiceRequest, ServiceZone } from '../../types';
import { getProAnswerEligibility, isRequestInZone } from '../requestEligibility';
import { buildDepartmentZone, buildRegionZone, COUNTRY_ZONE } from '../../zones/serviceZones';

// These tests follow the rule written in requests/requestRules.ts

const melun = (radiusKm: number): Extract<ServiceZone, { kind: 'city' }> => ({
    kind: 'city',
    id: 'city-77288',
    communeCode: '77288',
    city: 'Melun',
    department: '77',
    latitude: 48.5421,
    longitude: 2.6552,
    cityRadiusKm: 1.6,
    radiusKm,
});

// Real commune centers
const REQUEST_IN_MELUN = { city: 'Melun', department: '77', latitude: 48.5421, longitude: 2.6552 };
const REQUEST_NEARBY = { city: 'Dammarie-lès-Lys', department: '77', latitude: 48.5145, longitude: 2.639 };   // ~3 km
const REQUEST_IN_PARIS = { city: 'Paris', department: '75', latitude: 48.8566, longitude: 2.3522 };           // ~41 km
const REQUEST_IN_MARSEILLE = { city: 'Marseille', department: '13', latitude: 43.2965, longitude: 5.3698 };

const request = (over: Partial<ServiceRequest>) =>
    ({ tradeId: 'trade-plumber', author: { id: 'someone-else' }, ...REQUEST_IN_MELUN, ...over }) as ServiceRequest;

describe('a zone around a city', () => {
    it('with 0 km covers the city only', () => {
        expect(isRequestInZone(melun(0), request(REQUEST_IN_MELUN), false)).toBe(true);
        expect(isRequestInZone(melun(0), request(REQUEST_NEARBY), false)).toBe(false);
    });

    it('covers what is within the size of the city + the km chosen', () => {
        expect(isRequestInZone(melun(3), request(REQUEST_NEARBY), false)).toBe(true);
        expect(isRequestInZone(melun(30), request(REQUEST_IN_PARIS), false)).toBe(false);
        expect(isRequestInZone(melun(50), request(REQUEST_IN_PARIS), false)).toBe(true);
    });

    it('recognizes the same commune whatever its spelling', () => {
        const evry: ServiceZone = { ...melun(0), city: 'Évry-Courcouronnes', department: '91', latitude: 48.63, longitude: 2.44 };
        expect(isRequestInZone(evry, request({ city: 'evry courcouronnes', department: '91', latitude: 1, longitude: 1 }), false)).toBe(true);
    });

    it('does not confuse two communes with the same name in different departments', () => {
        const sameName = { city: 'Melun', department: '13', latitude: 43.2965, longitude: 5.3698 };
        expect(isRequestInZone(melun(0), request(sameName), false)).toBe(false);
    });

    it('falls back on the department when the request has no coordinates', () => {
        const noCoordinates = { latitude: null, longitude: null };
        expect(isRequestInZone(melun(0), request({ ...noCoordinates, city: 'Autre', department: '77' }), false)).toBe(true);
        expect(isRequestInZone(melun(100), request({ ...noCoordinates, city: 'Autre', department: '75' }), false)).toBe(false);
    });
});

describe('other zones', () => {
    it('a department covers its own requests only', () => {
        const zone = buildDepartmentZone('77', 'Seine-et-Marne');
        expect(isRequestInZone(zone, request(REQUEST_NEARBY), false)).toBe(true);
        expect(isRequestInZone(zone, request(REQUEST_IN_PARIS), false)).toBe(false);
    });

    it('a region covers the departments it contains', () => {
        const zone = buildRegionZone('11', 'Île-de-France');
        expect(isRequestInZone(zone, request(REQUEST_NEARBY), false)).toBe(true);
        expect(isRequestInZone(zone, request(REQUEST_IN_PARIS), false)).toBe(true);
        expect(isRequestInZone(zone, request(REQUEST_IN_MARSEILLE), false)).toBe(false);
    });

    it('the whole of France applies only to a trade done at a distance', () => {
        expect(isRequestInZone(COUNTRY_ZONE, request(REQUEST_IN_MARSEILLE), true)).toBe(true);
        expect(isRequestInZone(COUNTRY_ZONE, request(REQUEST_IN_MARSEILLE), false)).toBe(false);
    });
});

describe('getProAnswerEligibility', () => {
    const area: ProServiceArea = { userId: 'pro-user', tradeIds: ['trade-plumber'], zones: [melun(0)] };

    it('lets a pro of the trade answer inside a zone', () => {
        expect(getProAnswerEligibility(area, request({}), false)).toBe('can_answer');
    });

    it('refuses another trade: a plumber does not answer for a painter', () => {
        expect(getProAnswerEligibility(area, request({ tradeId: 'trade-painter' }), false)).toBe('other_trade');
    });

    it('refuses outside the zones', () => {
        expect(getProAnswerEligibility(area, request(REQUEST_IN_MARSEILLE), false)).toBe('out_of_zones');
    });

    it('accepts a request inside at least one zone', () => {
        const zones = [buildDepartmentZone('75', 'Paris'), melun(0)];
        expect(getProAnswerEligibility({ ...area, zones }, request({}), false)).toBe('can_answer');
    });

    it('never lets a pro answer their own request, and says so first', () => {
        const own = { author: { id: 'pro-user' } } as Partial<ServiceRequest>;
        expect(getProAnswerEligibility(area, request(own), false)).toBe('own_request');
        expect(getProAnswerEligibility(area, request({ ...own, tradeId: 'trade-painter' }), false)).toBe('own_request');
    });
});
