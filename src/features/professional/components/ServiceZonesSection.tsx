import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';
import type { ServiceZone } from '@/shared/types';
import { MapPreview } from '@/shared/components/MapPreview';
import type { ProfessionalMapData } from '@/shared/utils/professionalMap';
import { describePublicZone, ZONE_ICONS } from '@/shared/utils/zoneLabels';

// ============================================
// SERVICE ZONES SECTION — public page of a professional
// Where they work: a map when something can be drawn, then every zone as a
// read-only row. The list is the complete answer: departments, regions and France
// have no shape on the map. Rows stack their texts so they hold at any text size.
// ============================================

interface ServiceZonesSectionProps {
    title: string;
    zones: ServiceZone[];
    caption: string;                       // Under the map
    mapData: ProfessionalMapData | null;   // null: nothing to draw, no map
    onMapPress: () => void;                // Opens the full-screen map
}

export const ServiceZonesSection: React.FC<ServiceZonesSectionProps> = ({
    title,
    zones,
    caption,
    mapData,
    onMapPress,
}) => {
    // A professional keeps at least one zone: this only guards incomplete data
    if (zones.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {mapData ? (
                <MapPreview
                    markers={mapData.markers}
                    zones={mapData.zones}
                    caption={caption}
                    captionIcon="location-outline"
                    onPress={onMapPress}
                />
            ) : null}

            <View style={styles.card}>
                {zones.map((zone) => {
                    const description = describePublicZone(zone);
                    return (
                        <View key={zone.id} style={styles.row}>
                            <View style={styles.icon}>
                                <Ionicons name={ZONE_ICONS[zone.kind]} size={20} color={Colors.primary.main} />
                            </View>
                            <View style={styles.texts}>
                                <Text style={styles.rowTitle}>{description.title}</Text>
                                <Text style={styles.rowSubtitle}>{description.subtitle}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Same spacing and title as AboutSection, its neighbor on the page
    container: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: Spacing.md,
    },
    sectionTitle: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '700',
    },
    card: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: Spacing.md,
        ...Colors.shadow.card,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.subtle,
    },
    texts: {
        flex: 1,
        gap: 2,
    },
    rowTitle: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    rowSubtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
