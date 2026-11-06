import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { ServiceZone } from '@/shared/types';
// Direct file import: these pure functions stay runnable outside React Native
import { Strings } from '@/shared/constants/strings';

// ============================================
// Zone labels — how a service zone is named, shared by "Mes zones" and the
// public screens so a zone reads the same everywhere.
// ============================================

const texts = Strings.serviceArea;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Icon of a zone row, by kind of zone */
export const ZONE_ICONS: Record<ServiceZone['kind'], IoniconName> = {
    city: 'location-outline',
    department: 'map-outline',
    region: 'layers-outline',
    country: 'globe-outline',
};

/**
 * Title and subtitle of a zone row.
 *
 * @param zone The zone to describe
 * @returns Texts ready to display
 */
export const describeZone = (zone: ServiceZone): { title: string; subtitle: string } => {
    switch (zone.kind) {
        case 'city':
            return { title: zone.city, subtitle: texts.cityRow(zone.radiusKm) };
        case 'department':
            return { title: `${zone.name} (${zone.code})`, subtitle: texts.zoneKinds.department };
        case 'region':
            return { title: zone.name, subtitle: texts.zoneKinds.region };
        case 'country':
            return { title: texts.country, subtitle: texts.zoneKinds.country };
    }
};

/**
 * Same as describeZone for a visitor of the public page: the wording of the
 * "Toute la France" zone speaks to the professional ("vos métiers").
 *
 * @param zone The zone to describe
 * @returns Texts ready to display
 */
export const describePublicZone = (zone: ServiceZone): { title: string; subtitle: string } => {
    const description = describeZone(zone);
    return zone.kind === 'country'
        ? { ...description, subtitle: Strings.professional.zones.countrySubtitle }
        : description;
};

/**
 * Names of the zones a map cannot draw. Only a city zone is a circle: no contour
 * is available for departments and regions, and France would fill the map.
 *
 * @param zones Zones of a professional
 * @returns Display names, in the order of the zones
 */
export const getUndrawableZoneNames = (zones: ServiceZone[]): string[] =>
    zones.filter((zone) => zone.kind !== 'city').map((zone) => describeZone(zone).title);

/**
 * Completes a map caption with the zones the map does not show, so a visitor
 * never believes the coverage stops at the drawn circles.
 *
 * @param caption Caption of the map
 * @param zones Zones of a professional
 * @returns "Melun · + Seine-et-Marne (77), Paris (75)", or the caption alone
 */
export const withUndrawableZones = (caption: string, zones: ServiceZone[]): string => {
    const names = getUndrawableZoneNames(zones);
    return names.length > 0 ? `${caption} · + ${names.join(', ')}` : caption;
};
