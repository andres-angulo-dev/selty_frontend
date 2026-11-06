import type { Professional, ServiceZone } from '@/shared/types';
import { getProfessionalMapData } from '@/shared/utils/professionalMap';
import {
    describePublicZone,
    describeZone,
    getUndrawableZoneNames,
    withUndrawableZones,
} from '@/shared/utils/zoneLabels';
import { buildDepartmentZone, COUNTRY_ZONE } from '@/shared/utils/serviceZones';

const melun: ServiceZone = {
    kind: 'city',
    id: 'city-77288',
    communeCode: '77288',
    city: 'Melun',
    department: '77',
    latitude: 48.5421,
    longitude: 2.6552,
    cityRadiusKm: 1.6,
    radiusKm: 30,
};
const dept = buildDepartmentZone('77', 'Seine-et-Marne');

// Only the fields the map reads matter here
const pro = (over: Partial<Professional>): Professional =>
    ({ latitude: 48.5, longitude: 2.6, locationType: 'mobile', ...over }) as Professional;

describe('getProfessionalMapData', () => {
    it('draws a city zone as a circle on the commune: city size + chosen km', () => {
        const data = getProfessionalMapData(pro({}), [melun, dept]);
        expect(data?.markers).toEqual([]);
        expect(data?.zones).toEqual([{ latitude: melun.latitude, longitude: melun.longitude, radiusKm: 31.6 }]);
    });

    it('pins a fixed place, and does not draw the country', () => {
        const data = getProfessionalMapData(pro({ locationType: 'fixed' }), [COUNTRY_ZONE]);
        expect(data?.markers).toHaveLength(1);
        expect(data?.zones).toEqual([]);
    });

    it('shows a pin and a circle for "both"', () => {
        const data = getProfessionalMapData(pro({ locationType: 'both' }), [melun]);
        expect(data?.markers).toHaveLength(1);
        expect(data?.zones).toHaveLength(1);
    });

    it('draws a city zone even without coordinates on the professional', () => {
        const data = getProfessionalMapData(pro({ latitude: null, longitude: null }), [melun]);
        expect(data?.zones).toHaveLength(1);
    });

    it('returns null when nothing can be drawn', () => {
        expect(getProfessionalMapData(pro({}), [dept])).toBeNull();
        expect(
            getProfessionalMapData(pro({ locationType: 'fixed', latitude: null, longitude: null }), [COUNTRY_ZONE]),
        ).toBeNull();
    });
});

describe('zone labels', () => {
    it('names the zones without a shape', () => {
        expect(getUndrawableZoneNames([melun, dept])).toEqual(['Seine-et-Marne (77)']);
        expect(getUndrawableZoneNames([melun])).toEqual([]);
        expect(getUndrawableZoneNames([COUNTRY_ZONE])).toEqual(['Toute la France']);
    });

    it('completes a caption only when a zone cannot be drawn', () => {
        expect(withUndrawableZones('Melun', [melun])).toBe('Melun');
        expect(withUndrawableZones('Melun', [melun, dept, COUNTRY_ZONE])).toBe(
            'Melun · + Seine-et-Marne (77), Toute la France',
        );
    });

    it('never speaks to the professional on a public page', () => {
        expect(describePublicZone(COUNTRY_ZONE)).toEqual({ title: 'Toute la France', subtitle: 'À distance' });
        expect(describePublicZone(dept)).toEqual(describeZone(dept));
        expect(describePublicZone(melun)).toEqual(describeZone(melun));
    });
});
