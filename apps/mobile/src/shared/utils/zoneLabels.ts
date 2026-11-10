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
 * Caption of a professional's map: where they work, read from their zones. Not the
 * city of their profile: a pro living in Melun may work only in Romainville.
 *
 * @param zones Zones of a professional
 * @param fallback Shown when there is no zone yet (the city of the profile)
 * @returns "Romainville, Seine-et-Marne (77), Toute la France"
 */
export const describeZonesCaption = (zones: ServiceZone[], fallback: string): string =>
    zones.length > 0 ? zones.map((zone) => describePublicZone(zone).title).join(', ') : fallback;
