import { getInvalidFieldLabels } from '@/shared/utils/formErrors';
import { formatAbsoluteDate, formatRelativeDate, getDaysUntil } from '@/shared/utils/formatDate';
import { computeRegion } from '@/shared/utils/mapRegion';
import { Strings } from '@/shared/constants/strings';

describe('getInvalidFieldLabels', () => {
    const labels = { title: 'Titre', price: 'Montant', city: 'Ville' };

    it('names the invalid fields in the order of the form, not of the errors', () => {
        expect(getInvalidFieldLabels({ city: {}, title: {} }, labels)).toEqual(['Titre', 'Ville']);
    });

    it('returns nothing without an error', () => {
        expect(getInvalidFieldLabels({}, labels)).toEqual([]);
    });
});

describe('formatRelativeDate', () => {
    const ago = (ms: number) => new Date(Date.now() - ms);
    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    it('counts in days by default', () => {
        expect(formatRelativeDate(ago(HOUR))).toBe(Strings.dates.today);
        expect(formatRelativeDate(ago(DAY))).toBe(Strings.dates.yesterday);
        expect(formatRelativeDate(ago(3 * DAY))).toBe(Strings.dates.daysAgo(3));
    });

    it('moves to larger units', () => {
        expect(formatRelativeDate(ago(14 * DAY))).toBe(Strings.dates.weeksAgo(2));
        expect(formatRelativeDate(ago(60 * DAY))).toBe(Strings.dates.monthsAgo(2));
        expect(formatRelativeDate(ago(730 * DAY))).toBe(Strings.dates.yearsAgo(2));
    });

    it('is more precise when asked', () => {
        expect(formatRelativeDate(ago(10 * 1000), 'seconds')).toBe(Strings.dates.justNow);
        expect(formatRelativeDate(ago(5 * MINUTE), 'seconds')).toBe(Strings.dates.minutesAgo(5));
        expect(formatRelativeDate(ago(3 * HOUR), 'seconds')).toBe(Strings.dates.hoursAgo(3));
        expect(formatRelativeDate(ago(2 * DAY), 'seconds')).toBe(Strings.dates.daysAgo(2));
    });
});

describe('formatAbsoluteDate', () => {
    it('writes the date in French', () => {
        expect(formatAbsoluteDate(new Date(2025, 5, 30))).toBe('30 juin 2025');
    });
});

describe('getDaysUntil', () => {
    const now = new Date(2026, 10, 6, 23, 59);

    it('compares calendar days: tomorrow at 00:01 is 1 day away', () => {
        expect(getDaysUntil(new Date(2026, 10, 7, 0, 1), now)).toBe(1);
        expect(getDaysUntil(new Date(2026, 10, 6, 0, 1), now)).toBe(0);
    });

    it('is negative in the past', () => {
        expect(getDaysUntil(new Date(2026, 10, 4), now)).toBe(-2);
    });
});

describe('computeRegion', () => {
    it('has nothing to frame without a point', () => {
        expect(computeRegion([], [])).toBeNull();
    });

    it('centers on a single pin, without zooming too close', () => {
        expect(computeRegion([{ latitude: 48.5, longitude: 2.6 }], [])).toEqual({
            latitude: 48.5,
            longitude: 2.6,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        });
    });

    it('contains the whole circle of a zone', () => {
        const region = computeRegion([], [{ latitude: 48.5, longitude: 2.6, radiusKm: 30 }]);
        // 30 km on each side is about 0.54 degree of latitude
        expect(region?.latitudeDelta).toBeGreaterThan(0.54);
        // Longitude degrees are shorter at this latitude: the delta is larger
        expect(region?.longitudeDelta).toBeGreaterThan(region?.latitudeDelta ?? 0);
    });

    it('contains every point', () => {
        const region = computeRegion(
            [{ latitude: 48, longitude: 2 }],
            [{ latitude: 49, longitude: 3, radiusKm: 0 }],
        );
        expect(region?.latitude).toBeCloseTo(48.5);
        expect(region?.longitude).toBeCloseTo(2.5);
    });
});
