import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';
import { computeRegion } from '@/shared/utils/mapRegion';

// ============================================
// MAP PREVIEW
// Real map (Apple Maps on iOS, Google Maps on Android) showing points and/or
// coverage zones. The map is frozen (no scroll / zoom) so it never steals the
// ScrollView gesture; an optional onPress opens whatever the caller wants
// (typically a full-screen map) and shows an "expand" hint in the corner.
// Project-agnostic: callers pass plain coordinates, no business type here.
// ============================================

export interface MapPoint {
    latitude: number;
    longitude: number;
}

export interface MapZone extends MapPoint {
    radiusKm: number;                // Coverage radius around the point
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MapPreviewProps {
    markers?: MapPoint[];            // Pins (fixed places)
    zones?: MapZone[];               // Circles (intervention areas)
    height?: number;                 // Block height, default 140
    caption?: string;                // e.g. "Melun et alentours"
    captionIcon?: IoniconName;       // Icon before the caption, default 'navigate-outline'
    onPress?: () => void;            // Optional: tap on the preview (e.g. open a full-screen map)
    style?: StyleProp<ViewStyle>;    // Wrapper override (margins from the parent)
}

// Brand blue at ~15% alpha (hex alpha suffix) for the coverage circles
export const ZONE_FILL = `${Colors.primary.main}26`;

export const MapPreview: React.FC<MapPreviewProps> = ({
    markers = [],
    zones = [],
    height = 140,
    caption,
    captionIcon = 'navigate-outline',
    onPress,
    style,
}) => {
    // Region only changes when the inputs change, not on every render
    const region = useMemo(() => computeRegion(markers, zones), [markers, zones]);

    if (!region) return null;         // Nothing to show: the caller should render a placeholder instead

    return (
        <View style={style}>
            <Pressable
                onPress={onPress}
                disabled={!onPress}
                accessibilityRole={onPress ? 'button' : undefined}
                style={({ pressed }) => [styles.mapContainer, { height }, pressed && onPress && styles.pressed]}
            >
                {/* pointerEvents none: the frozen map ignores touches, so the Pressable and the ScrollView get them */}
                <View style={StyleSheet.absoluteFill} pointerEvents='none'>
                    <MapView
                        style={StyleSheet.absoluteFill}
                        initialRegion={region}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                        toolbarEnabled={false}
                        showsUserLocation={false}
                    >
                        {zones.map((zone, index) => (
                            <Circle
                                key={`zone-${index}`}
                                center={{ latitude: zone.latitude, longitude: zone.longitude }}
                                radius={zone.radiusKm * 1000}        // react-native-maps wants meters
                                fillColor={ZONE_FILL}
                                strokeColor={Colors.primary.main}
                                strokeWidth={1.5}
                            />
                        ))}
                        {markers.map((marker, index) => (
                            <Marker
                                key={`marker-${index}`}
                                coordinate={marker}
                                pinColor={Colors.primary.main}
                            />
                        ))}
                    </MapView>
                </View>

                {/* Expand hint: tells the user the preview is tappable */}
                {onPress && (
                    <View style={styles.expandBadge}>
                        <Ionicons name='expand-outline' size={16} color={Colors.primary.main} />
                    </View>
                )}
            </Pressable>

            {/* Caption row */}
            {caption && (
                <View style={styles.captionRow}>
                    <Ionicons name={captionIcon} size={14} color={Colors.text.tertiary} />
                    <Text style={styles.caption}>{caption}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    // overflow hidden clips the native map view to the rounded corners
    mapContainer: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: Colors.neutral.inputBg,   // Visible while tiles load
    },

    pressed: {
        opacity: 0.85,
    },

    expandBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Colors.shadow.card,
    },

    captionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },

    caption: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },
});
