import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { MapShapes } from '@/shared/components/MapShapes';
import { useUserLocation } from '@/shared/hooks/useUserLocation';
import { computeRegion } from '@/shared/utils/mapRegion';
import { getOutlinesSource, isPointInAreas } from '@/shared/utils/zoneOutlines';
import { calculateDistance, formatDistance } from '@/shared/utils/geolocation';
import { openDirections } from '@/shared/utils/openDirections';
import { RootStackParamList } from '@/app/navigation/types';

// ============================================
// LOCATION MAP SCREEN
// Interactive full-screen map: the professional's place(s), circles and
// coloured shapes of their zones, the item looked at (an annonce), the user's
// own position, the distance, and a directions button when there is a
// physical place to go to.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'LocationMap'>;

export const LocationMapScreen: React.FC<Props> = ({ route }) => {
    const { title, caption, markers, zones, areas, target, targetTitle } = route.params;
    const mapRef = useRef<MapView>(null);
    const insets = useSafeAreaInsets();
    const { userLocation, errorMsg, isLoading } = useUserLocation();

    // Height of the bottom card, measured at runtime so the floating button sits right above it
    const [bottomCardHeight, setBottomCardHeight] = useState(0);

    // What is framed: the professional's places, the item looked at, and the user once known
    const framedPoints = useMemo(() => (target ? [...markers, target] : markers), [markers, target]);

    // Base framing, used before the user position is known
    const initialRegion = useMemo(() => computeRegion(framedPoints, zones, areas), [framedPoints, zones, areas]);

    // Frame everything, the user included when known.
    // Called once when the position arrives, and again on demand via the "fit all" button.
    const fitAll = useCallback(() => {
        const points = userLocation ? [...framedPoints, userLocation] : framedPoints;
        const region = computeRegion(points, zones, areas);
        if (region) mapRef.current?.animateToRegion(region, 600);
    }, [userLocation, framedPoints, zones, areas]);

    useEffect(() => {
        if (userLocation) fitAll();
    }, [userLocation, fitAll]);

    // Distance to the item looked at when there is one (an annonce), otherwise to the nearest
    // place or circle center; and whether the user stands inside one of the zones
    const distanceInfo = useMemo(() => {
        if (!userLocation) return null;
        const distanceTo = (point: { latitude: number; longitude: number }) =>
            calculateDistance(userLocation.latitude, userLocation.longitude, point.latitude, point.longitude);

        const zoneDistances = zones.map(distanceTo);
        const isInZone =
            zones.some((zone, index) => zoneDistances[index] <= zone.radiusKm) || isPointInAreas(userLocation, areas);

        const candidates = target ? [distanceTo(target)] : [...markers.map(distanceTo), ...zoneDistances];
        // Only shapes: no single point to measure to, the banner just says inside or outside
        const label = candidates.length > 0 ? formatDistance(Math.min(...candidates)) : null;

        return { label, isInZone };
    }, [userLocation, markers, zones, areas, target]);

    // Banner text once the position is known
    const distanceText = !distanceInfo
        ? null
        : distanceInfo.label
            ? `${Strings.map.distanceFromYou(distanceInfo.label)}${distanceInfo.isInZone ? `, ${Strings.map.inZone}` : ''}`
            : distanceInfo.isInZone ? Strings.map.inZoneOnly : Strings.map.outOfZone;

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
                <MapShapes
                    markers={markers}
                    zones={zones}
                    areas={areas}
                    target={target}
                    markerTitle={title}
                    targetTitle={targetTitle}
                />
            </MapView>

            {/* Status banner: distance, locating, or permission error */}
            <View style={[styles.banner, { top: Spacing.md }]}>
                {isLoading ? (
                    <>
                        <ActivityIndicator size='small' color={Colors.primary.main} />
                        <Text style={styles.bannerText}>{Strings.map.locating}</Text>
                    </>
                ) : distanceText ? (
                    <>
                        <Ionicons name='navigate' size={16} color={Colors.primary.main} />
                        <Text style={styles.bannerText}>{distanceText}</Text>
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
                {/* Licence Ouverte: the source of the shapes is named where they are shown in full */}
                {areas.length > 0 && <Text style={styles.source}>{Strings.map.outlinesSource(getOutlinesSource())}</Text>}
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

    source: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },
});
