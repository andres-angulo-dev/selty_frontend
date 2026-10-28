import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { ZONE_FILL } from '@/shared/components/MapPreview';
import { useUserLocation } from '@/shared/hooks/useUserLocation';
import { computeRegion } from '@/shared/utils/mapRegion';
import { calculateDistance, formatDistance } from '@/shared/utils/geolocation';
import { openDirections } from '@/shared/utils/openDirections';
import { RootStackParamList } from '@/app/navigation/types';

// ============================================
// LOCATION MAP SCREEN
// Interactive full-screen map: the professional's place(s) and/or coverage
// zone(s), the user's own position, the distance between the two, and a
// directions button when there is a physical place to go to.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'LocationMap'>;

export const LocationMapScreen: React.FC<Props> = ({ route }) => {
    const { title, caption, markers, zones } = route.params;
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();
    const { userLocation, errorMsg, isLoading } = useUserLocation();

    // Height of the bottom card, measured at runtime so the floating button sits right above it
    const [bottomCardHeight, setBottomCardHeight] = useState(0);

    // Base framing: the professional alone (used before the user position is known)
    const initialRegion = useMemo(() => computeRegion(markers, zones), [markers, zones]);

    // Frame everything: the professional's place(s) / zone(s) plus the user when known.
    // Called once when the position arrives, and again on demand via the "fit all" button.
    const fitAll = useCallback(() => {
        const points = userLocation ? [...markers, userLocation] : markers;
        const region = computeRegion(points, zones);
        if (region) mapRef.current?.animateToRegion(region, 600);
    }, [userLocation, markers, zones]);

    useEffect(() => {
        if (userLocation) fitAll();
    }, [userLocation, fitAll]);

    // Distance to the nearest point (place or zone center), and whether the user sits inside a zone
    const distanceInfo = useMemo(() => {
        if (!userLocation) return null;
        const targets = [...markers, ...zones];
        if (targets.length === 0) return null;

        const distances = targets.map((target) =>
            calculateDistance(userLocation.latitude, userLocation.longitude, target.latitude, target.longitude),
        );
        const nearestKm = Math.min(...distances);
        const isInZone = zones.some((zone, index) => distances[markers.length + index] <= zone.radiusKm);

        return { label: formatDistance(nearestKm), isInZone };
    }, [userLocation, markers, zones]);

    // Directions only make sense towards a physical place (first marker)
    const destination = markers[0];
    const handleDirectionsPress = async () => {
        if (!destination) return;
        const opened = await openDirections({ ...destination, label: title });
        if (!opened) {
            Alert.alert(Strings.map.directionsErrorTitle, Strings.map.directionsErrorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion ?? undefined}
                showsUserLocation
                showsMyLocationButton={false}
                toolbarEnabled={false}
            >
                {zones.map((zone, index) => (
                    <Circle
                        key={`zone-${index}`}
                        center={{ latitude: zone.latitude, longitude: zone.longitude }}
                        radius={zone.radiusKm * 1000}
                        fillColor={ZONE_FILL}
                        strokeColor={Colors.primary.main}
                        strokeWidth={1.5}
                    />
                ))}
                {markers.map((marker, index) => (
                    <Marker key={`marker-${index}`} coordinate={marker} title={title} pinColor={Colors.primary.main} />
                ))}
            </MapView>

            {/* Status banner: distance, locating, or permission error */}
            <View style={[styles.banner, { top: Spacing.md }]}>
                {isLoading ? (
                    <>
                        <ActivityIndicator size='small' color={Colors.primary.main} />
                        <Text style={styles.bannerText}>{Strings.map.locating}</Text>
                    </>
                ) : distanceInfo ? (
                    <>
                        <Ionicons name='navigate' size={16} color={Colors.primary.main} />
                        <Text style={styles.bannerText}>
                            {Strings.map.distanceFromYou(distanceInfo.label)}
                            {distanceInfo.isInZone ? `, ${Strings.map.inZone}` : ''}
                        </Text>
                    </>
                ) : (
                    <>
                        <Ionicons name='alert-circle-outline' size={16} color={Colors.semantic.error} />
                        <Text style={styles.bannerText}>{errorMsg ?? Strings.location.fetchError}</Text>
                        {/* iOS never re-asks a denied permission: send the user to the app settings */}
                        <Pressable onPress={() => Linking.openSettings()} hitSlop={8} accessibilityRole='button'>
                            <Text style={styles.bannerLink}>{Strings.map.openSettings}</Text>
                        </Pressable>
                    </>
                )}
            </View>

            {/* Floating "fit all" button: back to the overview after zooming or panning */}
            <Pressable
                onPress={fitAll}
                accessibilityRole='button'
                accessibilityLabel={Strings.map.fitAll}
                style={({ pressed }) => [
                    styles.fitButton,
                    { bottom: bottomCardHeight + Spacing.md },
                    pressed && styles.fitButtonPressed,
                ]}
            >
                <Ionicons name='locate' size={22} color={Colors.primary.main} />
            </Pressable>

            {/* Bottom sheet: caption + directions */}
            <View
                style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}
                onLayout={(event) => setBottomCardHeight(event.nativeEvent.layout.height)}
            >
                {caption && (
                    <View style={styles.captionRow}>
                        <Ionicons name='location-outline' size={16} color={Colors.text.tertiary} />
                        <Text style={styles.caption}>{caption}</Text>
                    </View>
                )}
                {destination && (
                    <Pressable
                        onPress={handleDirectionsPress}
                        accessibilityRole='button'
                        style={({ pressed }) => [styles.directionsButton, pressed && styles.directionsPressed]}
                    >
                        <Ionicons name='navigate-outline' size={18} color={Colors.text.inverse} />
                        <Text style={styles.directionsText}>{Strings.map.directions}</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.inputBg,
    },

    // ── Floating status banner ────────────────────────
    banner: {
        position: 'absolute',
        left: Spacing.md,
        right: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + Spacing.xs,
        ...Colors.shadow.card,
    },

    bannerText: {
        ...Typography.label,
        color: Colors.text.primary,
        flexShrink: 1,
    },

    bannerLink: {
        ...Typography.label,
        color: Colors.secondary.main,
        fontWeight: '600',
        marginLeft: 'auto',                  // Pushes the link to the right edge of the banner
    },

    // ── Floating fit-all button ───────────────────────
    fitButton: {
        position: 'absolute',
        right: Spacing.md,
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Colors.shadow.card,
    },

    fitButtonPressed: {
        backgroundColor: Colors.neutral.inputBg,
    },

    // ── Bottom card ───────────────────────────────────
    bottomCard: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        gap: Spacing.md,
        backgroundColor: Colors.neutral.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        ...Colors.shadow.strong,
    },

    captionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    caption: {
        ...Typography.body,
        color: Colors.text.secondary,
        flexShrink: 1,
    },

    directionsButton: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.md,
    },

    directionsPressed: {
        backgroundColor: Colors.primary.dark,
    },

    directionsText: {
        ...Typography.button,
        color: Colors.text.inverse,
    },
});
