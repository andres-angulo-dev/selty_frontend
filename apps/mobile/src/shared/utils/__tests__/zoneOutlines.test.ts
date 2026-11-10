import { FRENCH_DEPARTMENTS as DEPARTMENTS, FRENCH_REGIONS as REGIONS } from '@/shared/constants/frenchGeo';
import { buildDepartmentZone, buildRegionZone, COUNTRY_ZONE } from '@/shared/utils/serviceZones';
import { getOutlinesSource, getZoneAreas, isPointInAreas } from '@/shared/utils/zoneOutlines';

// Real commune centers
const PARIS = { latitude: 48.8566, longitude: 2.3522 };
const MELUN = { latitude: 48.5421, longitude: 2.6552 };
const MARSEILLE = { latitude: 43.2965, longitude: 5.3698 };

describe('outlines file', () => {
    it('has a shape for every department and region the app offers', () => {
        const missing = [
            ...DEPARTMENTS.filter((d) => getZoneAreas(buildDepartmentZone(d.code, d.name)).length === 0).map((d) => d.code),
            ...REGIONS.filter((r) => getZoneAreas(buildRegionZone(r.code, r.name)).length === 0).map((r) => r.code),
        ];
        expect(missing).toEqual([]);
    });

    it('names its source, as the licence asks', () => {
        expect(getOutlinesSource()).toMatch(/^IGN – ADMIN EXPRESS.*, \d{4}-\d{2}$/);
    });
});

describe('getZoneAreas', () => {
    it('puts a commune inside its department and not in another one', () => {
        const seineEtMarne = getZoneAreas(buildDepartmentZone('77', 'Seine-et-Marne'));
        expect(isPointInAreas(MELUN, seineEtMarne)).toBe(true);
        expect(isPointInAreas(PARIS, seineEtMarne)).toBe(false);
    });

    it('draws a region as one shape around its departments', () => {
        const ileDeFrance = getZoneAreas(buildRegionZone('11', 'Île-de-France'));
        expect(isPointInAreas(PARIS, ileDeFrance)).toBe(true);
        expect(isPointInAreas(MELUN, ileDeFrance)).toBe(true);
        expect(isPointInAreas(MARSEILLE, ileDeFrance)).toBe(false);
    });

    it('has no shape for France, nor for an unknown code', () => {
        expect(getZoneAreas(COUNTRY_ZONE)).toEqual([]);
        expect(getZoneAreas(buildDepartmentZone('00', 'Nulle part'))).toEqual([]);
    });
});


describe('isPointInAreas', () => {
    // A 10 x 10 square with a 2 x 2 hole in the middle
    const square = {
        coordinates: [
            { latitude: 0, longitude: 0 },
            { latitude: 0, longitude: 10 },
            { latitude: 10, longitude: 10 },
            { latitude: 10, longitude: 0 },
        ],
        holes: [[
            { latitude: 4, longitude: 4 },
            { latitude: 4, longitude: 6 },
            { latitude: 6, longitude: 6 },
            { latitude: 6, longitude: 4 },
        ]],
    };

    it('is inside the outline, outside the hole', () => {
        expect(isPointInAreas({ latitude: 2, longitude: 2 }, [square])).toBe(true);
        expect(isPointInAreas({ latitude: 5, longitude: 5 }, [square])).toBe(false);
        expect(isPointInAreas({ latitude: 12, longitude: 2 }, [square])).toBe(false);
    });
});
