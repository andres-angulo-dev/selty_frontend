import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { BorderRadius, Colors, Spacing, Strings, Typography } from '@/shared/constants';
import { REQUEST_RULES } from '@/shared/constants/requestRules';
import { describeZone, ZONE_ICONS } from '@/shared/utils/zoneLabels';
import { Button } from '@/shared/components/button';
import { MenuSection } from '@/shared/components/MenuSection';
import { useServiceArea, useServiceAreaActions } from '@/shared/hooks/useServiceArea';

// ============================================
// SERVICE ZONES SCREEN — "Mes zones" (professionals)
// The zones where the pro can answer requests. Changes apply at once to the feed
// and the request screens. The rules (limits, no duplicates) are in
// shared/utils/serviceZones.ts; this screen shows the outcome.
// Not saved after an app restart until the backend exists.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceZones'>;

const texts = Strings.serviceArea;

export const ServiceZonesScreen: React.FC<Props> = ({ navigation }) => {
    const area = useServiceArea();
    const { removeZone } = useServiceAreaActions();

    const handleRemoveZone = (zoneId: string) => {
        if (!removeZone(zoneId)) {
            Alert.alert(texts.limits.title, texts.limits.lastZone);
        }
    };

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.intro}>{texts.zonesIntro}</Text>

            {/* MES ZONES */}
            <MenuSection title={texts.zonesCounter(area.zones.length, REQUEST_RULES.maxZones)} cardStyle={styles.card}>
                {area.zones.map((zone) => {
                    const { title, subtitle } = describeZone(zone);
                    return (
                        <View key={zone.id} style={styles.zoneRow}>
                            <View style={styles.zoneIcon}>
                                <Ionicons name={ZONE_ICONS[zone.kind]} size={20} color={Colors.primary.main} />
                            </View>
                            <View style={styles.zoneTexts}>
                                <Text style={styles.zoneTitle}>{title}</Text>
                                <Text style={styles.zoneSubtitle}>{subtitle}</Text>
                            </View>
                            <Pressable
                                onPress={() => handleRemoveZone(zone.id)}
                                hitSlop={Spacing.sm}
                                style={({ pressed }) => pressed && styles.pressed}
                                accessibilityRole="button"
                                accessibilityLabel={texts.removeZone(title)}
                            >
                                <Ionicons name="close" size={22} color={Colors.text.secondary} />
                            </Pressable>
                        </View>
                    );
                })}
                {/* Never blocked at the maximum: changing a radius or adding a region that replaces
                    its departments stays possible; addZone refuses only what would exceed it */}
                <Button label={texts.addZone} onPress={() => navigation.navigate('AddZone')} variant="secondary" fullWidth />
            </MenuSection>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    intro: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
    },
    card: {
        padding: Spacing.md,
    },
    pressed: {
        opacity: 0.6,
    },
    zoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,
        marginBottom: Spacing.md,
    },
    zoneIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.subtle,
    },
    zoneTexts: {
        flex: 1,
        gap: 2,
    },
    zoneTitle: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    zoneSubtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
