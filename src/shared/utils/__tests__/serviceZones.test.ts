import type { ProServiceArea, ServiceZone } from '@/shared/types';
import { REQUEST_RULES } from '@/shared/constants/requestRules';
import {
    addZone,
    buildDepartmentZone,
    buildRegionZone,
    COUNTRY_ZONE,
    DEPARTMENT_OPTIONS,
    estimateCityRadiusKm,
    REGION_OPTIONS,
    removeTrade,
    removeZone,
} from '@/shared/utils/serviceZones';

const city = (code: string, radiusKm: number): ServiceZone => ({
    kind: 'city',
    id: `city-${code}`,
    communeCode: code,
    city: `Commune ${code}`,
    department: '77',
    latitude: 48.5,
    longitude: 2.6,
    cityRadiusKm: 1,
    radiusKm,
});
const seineEtMarne = buildDepartmentZone('77', 'Seine-et-Marne');
const paris = buildDepartmentZone('75', 'Paris');
const ileDeFrance = buildRegionZone('11', 'Île-de-France');
const fullList = Array.from({ length: REQUEST_RULES.maxZones }, (_, index) => city(String(index), 10));

describe('estimateCityRadiusKm', () => {
    it('turns a surface into the radius of a circle', () => {
        expect(estimateCityRadiusKm(800)).toBeCloseTo(1.6, 1);
    });

    it('gives 0 for an unknown surface', () => {
        expect(estimateCityRadiusKm(null)).toBe(0);
    });
});

describe('addZone', () => {
    it('adds a new zone without changing the original list', () => {
        const zones = [seineEtMarne];
        const result = addZone(zones, paris);
        expect(result).toEqual({ outcome: 'added', zones: [seineEtMarne, paris], replaced: [] });
        expect(zones).toEqual([seineEtMarne]);
    });

    it('updates the radius of a city already there', () => {
        expect(addZone([city('1', 10)], city('1', 30))).toEqual({ outcome: 'updated', zones: [city('1', 30)] });
    });

    it('refuses a duplicate', () => {
        expect(addZone([city('1', 10)], city('1', 10))).toEqual({ outcome: 'duplicate' });
        expect(addZone([seineEtMarne], seineEtMarne)).toEqual({ outcome: 'duplicate' });
        expect(addZone([COUNTRY_ZONE], COUNTRY_ZONE)).toEqual({ outcome: 'duplicate' });
    });

    it('refuses a department already covered by a chosen region', () => {
        expect(addZone([ileDeFrance], seineEtMarne)).toEqual({ outcome: 'covered_by_region', regionName: 'Île-de-France' });
    });

    it('accepts a department of another region', () => {
        const bouchesDuRhone = buildDepartmentZone('13', 'Bouches-du-Rhône');
        expect(addZone([ileDeFrance], bouchesDuRhone).outcome).toBe('added');
    });

    it('replaces the departments a new region contains, and keeps the others', () => {
        const bouchesDuRhone = buildDepartmentZone('13', 'Bouches-du-Rhône');
        expect(addZone([seineEtMarne, paris, bouchesDuRhone], ileDeFrance)).toEqual({
            outcome: 'added',
            zones: [bouchesDuRhone, ileDeFrance],
            replaced: ['Seine-et-Marne', 'Paris'],
        });
    });

    it('allows a circle overlapping a department: no contour to compare', () => {
        expect(addZone([seineEtMarne], city('1', 10)).outcome).toBe('added');
    });

    it('refuses a new zone beyond the maximum', () => {
        expect(addZone(fullList, paris)).toEqual({ outcome: 'limit_reached' });
    });

    it('still updates a radius at the maximum', () => {
        expect(addZone(fullList, city('0', 30)).outcome).toBe('updated');
    });

    it('accepts a region at the maximum when it frees some room', () => {
        const zones = [...fullList.slice(1), seineEtMarne];
        const result = addZone(zones, ileDeFrance);
        expect(result.outcome).toBe('added');
    });
});

describe('removeZone', () => {
    it('removes a zone', () => {
        expect(removeZone([seineEtMarne, paris], paris.id)).toEqual([seineEtMarne]);
    });

    it('refuses to remove the last one', () => {
        expect(removeZone([seineEtMarne], seineEtMarne.id)).toBeNull();
    });
});

describe('removeTrade', () => {
    const isRemote = (tradeId: string) => tradeId === 'trade-lawyer';
    const area = (tradeIds: string[], zones: ServiceZone[]): ProServiceArea => ({ userId: 'u', tradeIds, zones });

    it('removes a trade', () => {
        expect(removeTrade(area(['trade-plumber', 'trade-painter'], [paris]), 'trade-painter', isRemote)).toEqual({
            outcome: 'removed',
            area: area(['trade-plumber'], [paris]),
            countryZoneRemoved: false,
        });
    });

    it('refuses to remove the last trade', () => {
        expect(removeTrade(area(['trade-plumber'], [paris]), 'trade-plumber', isRemote)).toEqual({ outcome: 'last_trade' });
    });

    it('removes "Toute la France" with the last trade done at a distance', () => {
        const result = removeTrade(area(['trade-lawyer', 'trade-plumber'], [COUNTRY_ZONE, paris]), 'trade-lawyer', isRemote);
        expect(result).toEqual({
            outcome: 'removed',
            area: area(['trade-plumber'], [paris]),
            countryZoneRemoved: true,
        });
    });

    it('keeps "Toute la France" while a trade done at a distance remains', () => {
        const result = removeTrade(area(['trade-lawyer', 'trade-tutor', 'trade-plumber'], [COUNTRY_ZONE]), 'trade-plumber', isRemote);
        expect(result.outcome).toBe('removed');
    });

    it('refuses when "Toute la France" would leave the pro without any zone', () => {
        expect(removeTrade(area(['trade-lawyer', 'trade-plumber'], [COUNTRY_ZONE]), 'trade-lawyer', isRemote)).toEqual({
            outcome: 'country_is_only_zone',
        });
    });
});

describe('select options', () => {
    it('lists the 18 regions and 101 departments of France', () => {
        expect(REGION_OPTIONS).toHaveLength(18);
        expect(DEPARTMENT_OPTIONS).toHaveLength(101);
        expect(DEPARTMENT_OPTIONS).toContainEqual({ value: '77', label: 'Seine-et-Marne (77)' });
    });
});
