import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { BorderRadius, Colors, Spacing, Strings, Typography } from '@/shared/constants';
import { REQUEST_RULES } from '@/shared/constants/requestRules';
import type { ServiceZone } from '@/shared/types';
import { Button } from '@/shared/components/button';
import { FormErrorSummary } from '@/shared/components/FormErrorSummary';
import { FormHeader } from '@/shared/components/FormHeader';
import { LocationFields } from '@/shared/components/LocationFields';
import { MenuSection } from '@/shared/components/MenuSection';
import { SelectField } from '@/shared/components/SelectField';
import { StepSlider } from '@/shared/components/StepSlider';
import { useServiceArea, useServiceAreaActions } from '@/shared/hooks/useServiceArea';
import { EMPTY_LOCATION, LocationValue } from '@/shared/utils/locationSchema';
import {
    buildDepartmentZone,
    buildRegionZone,
    COUNTRY_ZONE,
    DEPARTMENT_OPTIONS,
    estimateCityRadiusKm,
    REGION_OPTIONS,
} from '@/shared/utils/serviceZones';
import { FRENCH_DEPARTMENTS } from '@/shared/constants/frenchGeo';
import { isTradeRemoteCapable } from '@/__mocks__/mockTrades';

// ============================================
// ADD ZONE SCREEN (professionals)
// Choose a type of zone, then what it covers. "Toute la France" is only offered
// to a pro with a trade that can be done at a distance. The rules (duplicates,
// maximum) are applied by addZone; this screen explains the outcome.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'AddZone'>;
type ZoneKind = ServiceZone['kind'];
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const texts = Strings.serviceArea.add;

const KINDS: { kind: ZoneKind; icon: IoniconName }[] = [
    { kind: 'city', icon: 'location-outline' },
    { kind: 'department', icon: 'map-outline' },
    { kind: 'region', icon: 'layers-outline' },
    { kind: 'country', icon: 'globe-outline' },
];

export const AddZoneScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const area = useServiceArea();
    const { addZone } = useServiceAreaActions();

    const [kind, setKind] = useState<ZoneKind>('city');
    const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
    const [radiusKm, setRadiusKm] = useState<number>(REQUEST_RULES.defaultRadiusKm);
    const [departmentCode, setDepartmentCode] = useState('');
    const [regionCode, setRegionCode] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // "Toute la France" only makes sense with a trade that can be done at a distance
    const canChooseCountry = area.tradeIds.some(isTradeRemoteCapable);
    const visibleKinds = KINDS.filter((item) => item.kind !== 'country' || canChooseCountry);

    const isCityMissing = !location.communeCode && location.latitude === null && location.city === '';
    const isCityUnverified = location.city !== '' && (location.latitude === null || location.longitude === null || !location.communeCode);

    /** What is still missing for the selected type, named above the button */
    const getMissingLabels = (): string[] => {
        if (kind === 'city' && (isCityMissing || !location.postalCode)) {
            return [Strings.locationFields.summaryLabel];
        }
        if (kind === 'department' && !departmentCode) {
            return [texts.department];
        }
        if (kind === 'region' && !regionCode) {
            return [texts.region];
        }
        return [];
    };

    /** Builds the zone; null when something is missing or the city could not be verified */
    const buildZone = (): ServiceZone | null => {
        switch (kind) {
            case 'city':
                if (location.latitude === null || location.longitude === null || !location.communeCode || !location.postalCode) {
                    return null;
                }
                return {
                    kind: 'city',
                    id: `city-${location.communeCode}`,
                    communeCode: location.communeCode,
                    city: location.city,
                    department: location.department,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    cityRadiusKm: estimateCityRadiusKm(location.surfaceHectares),
                    radiusKm,
                };
            case 'department': {
                const department = FRENCH_DEPARTMENTS.find((item) => item.code === departmentCode);
                return department ? buildDepartmentZone(department.code, department.name) : null;
            }
            case 'region': {
                const region = REGION_OPTIONS.find((item) => item.value === regionCode);
                return region ? buildRegionZone(region.value, region.label) : null;
            }
            case 'country':
                return COUNTRY_ZONE;
        }
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        if (getMissingLabels().length > 0) {
            return;
        }
        // Coordinates are needed to measure a distance: a city typed by hand cannot be used
        if (kind === 'city' && isCityUnverified) {
            Alert.alert(Strings.serviceArea.limits.title, texts.cityUnavailable);
            return;
        }
        const zone = buildZone();
        if (!zone) {
            return;
        }

        const result = addZone(zone);
        switch (result.outcome) {
            case 'added':
                if (result.replaced.length > 0 && zone.kind === 'region') {
                    Alert.alert(texts.replaced(result.replaced.join(', '), zone.name));
                }
                navigation.goBack();
                break;
            case 'updated':
                Alert.alert(texts.updated);
                navigation.goBack();
                break;
            case 'duplicate':
                Alert.alert(Strings.serviceArea.limits.title, texts.duplicate);
                break;
            case 'covered_by_region':
                Alert.alert(Strings.serviceArea.limits.title, texts.coveredByRegion(result.regionName));
                break;
            case 'limit_reached':
                Alert.alert(Strings.serviceArea.limits.title, texts.limitReached(REQUEST_RULES.maxZones));
                break;
        }
    };

    return (
        <View style={styles.screen}>
            <FormHeader title={texts.title} leftLabel={Strings.buttons.cancel} onLeftPress={navigation.goBack} />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}
            >
                {/* TYPE DE ZONE */}
                <MenuSection title={texts.kind} cardStyle={styles.kindCard}>
                    {visibleKinds.map((item) => {
                        const isSelected = item.kind === kind;
                        return (
                            <Pressable
                                key={item.kind}
                                onPress={() => setKind(item.kind)}
                                style={[styles.kindRow, isSelected && styles.kindRowSelected]}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                            >
                                <View style={[styles.kindIcon, isSelected && styles.kindIconSelected]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={isSelected ? Colors.text.inverse : Colors.primary.main}
                                    />
                                </View>
                                <View style={styles.kindTexts}>
                                    <Text style={styles.kindTitle}>{texts.kinds[item.kind].title}</Text>
                                    <Text style={styles.kindDescription}>{texts.kinds[item.kind].description}</Text>
                                </View>
                                <Ionicons
                                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                    size={22}
                                    color={isSelected ? Colors.primary.main : Colors.text.tertiary}
                                />
                            </Pressable>
                        );
                    })}
                </MenuSection>

                {/* Autour d'une ville */}
                {kind === 'city' ? (
                    <>
                        <MenuSection title={texts.city} cardStyle={styles.card}>
                            <LocationFields value={location} onChange={setLocation} labels={Strings.locationFields} />
                        </MenuSection>
                        <MenuSection title={texts.radiusSection} cardStyle={styles.card}>
                            <Text style={styles.radiusValue}>
                                {Strings.serviceArea.radius(radiusKm, location.city || texts.city.toLowerCase())}
                            </Text>
                            <StepSlider
                                steps={REQUEST_RULES.radiusStepsKm}
                                value={radiusKm}
                                onChange={setRadiusKm}
                                formatValue={(km) => `${km} km`}
                                accessibilityLabel={texts.radiusSection}
                            />
                        </MenuSection>
                    </>
                ) : null}

                {kind === 'department' ? (
                    <MenuSection title={texts.department} cardStyle={styles.card}>
                        <SelectField
                            label={texts.department}
                            options={DEPARTMENT_OPTIONS}
                            value={departmentCode}
                            onChange={setDepartmentCode}
                            placeholder={texts.departmentPlaceholder}
                            searchPlaceholder={texts.departmentSearch}
                            emptyText={texts.empty}
                            closeLabel={Strings.selectField.close}
                        />
                    </MenuSection>
                ) : null}

                {kind === 'region' ? (
                    <MenuSection title={texts.region} cardStyle={styles.card}>
                        <SelectField
                            label={texts.region}
                            options={REGION_OPTIONS}
                            value={regionCode}
                            onChange={setRegionCode}
                            placeholder={texts.regionPlaceholder}
                            searchPlaceholder={texts.regionSearch}
                            emptyText={texts.empty}
                            closeLabel={Strings.selectField.close}
                        />
                    </MenuSection>
                ) : null}

                {kind === 'country' ? <Text style={styles.hint}>{texts.countryHint}</Text> : null}
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
                {isSubmitted ? <FormErrorSummary message={texts.missing} fieldLabels={getMissingLabels()} /> : null}
                <Button label={texts.submit} onPress={handleSubmit} fullWidth size="large" />
            </View>
        </View>
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
    card: {
        padding: Spacing.md,
    },
    kindCard: {
        padding: Spacing.xs,
    },
    kindRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,
        padding: Spacing.sm + Spacing.xs,
        borderRadius: BorderRadius.md,
    },
    kindRowSelected: {
        backgroundColor: Colors.primary.subtle,
    },
    kindIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.subtle,
    },
    kindIconSelected: {
        backgroundColor: Colors.primary.main,
    },
    kindTexts: {
        flex: 1,
        gap: 2,
    },
    kindTitle: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    kindDescription: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    radiusValue: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    hint: {
        ...Typography.body,
        color: Colors.text.secondary,
    },
    bottomBar: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
    },
});
