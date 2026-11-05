import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';
import { FormInput } from './FormInput';
import { DropdownField } from './DropdownField';
import {
    Commune,
    departmentFromPostalCode,
    searchCommunesByName,
    searchCommunesByPostalCode,
} from '@/shared/services/geoService';
import { LOCATION_LIMITS, LocationValue } from '@/shared/utils/locationSchema';

// ============================================
// LOCATION FIELDS — postal code + city, each one fills the other.
// - Postal code first: at the 5th digit, 1 commune fills the city; with several
//   communes (77000 has 4) the city field becomes a dropdown open under it.
// - City first: from 3 letters, suggestions appear; picking one fills the postal
//   code, or turns that field into a dropdown when it has several (Paris has 21).
// - Changing a field after that clears the other: the pair can never mismatch.
// - API unavailable: manual mode, the city is typed freely and the department
//   comes from the postal code, so nobody is ever blocked.
// Controlled component: the parent (React Hook Form) owns `value`.
// Every text comes from the caller (`labels`).
// ============================================

export interface LocationFieldsLabels {
    postalCode: string;
    city: string;
    searching: string;
    notFound: string;
    unavailable: string;
    chooseCity: string;
    choosePostalCode: string;
}

interface LocationFieldsProps {
    value: LocationValue;
    onChange: (value: LocationValue) => void;
    labels: LocationFieldsLabels;
    postalCodeError?: string;
    cityError?: string;
}

type SearchResult =
    | { status: 'found'; communes: Commune[] }
    | { status: 'cancelled' }
    | { status: 'failed' };

const CITY_SEARCH_MIN_LENGTH = 3;
const CITY_SEARCH_DELAY_MS = 300;    // Waits for a pause in typing: one request, not one per letter

export const LocationFields: React.FC<LocationFieldsProps> = ({
    value,
    onChange,
    labels,
    postalCodeError,
    cityError,
}) => {
    const [isSearching, setIsSearching] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [isManual, setIsManual] = useState(false);              // API unavailable
    const [suggestions, setSuggestions] = useState<Commune[]>([]);    // City typed → communes
    const [cityChoices, setCityChoices] = useState<Commune[]>([]);    // Postal code → several communes
    const [codeChoices, setCodeChoices] = useState<string[]>([]);     // City → several postal codes

    // Only the latest search may update the fields: an older answer arriving late is ignored
    const searchController = useRef<AbortController | null>(null);
    const cityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Cancels any search in progress, and empties the lists */
    const resetSearch = () => {
        searchController.current?.abort();
        if (cityTimer.current) {
            clearTimeout(cityTimer.current);
        }
        setIsSearching(false);
        setIsNotFound(false);
        setSuggestions([]);
        setCityChoices([]);
        setCodeChoices([]);
    };

    // Leaving the screen: no answer may arrive on an unmounted component
    useEffect(() => () => {
        searchController.current?.abort();
        if (cityTimer.current) {
            clearTimeout(cityTimer.current);
        }
    }, []);

    /**
     * Runs a search. Three outcomes, on purpose: 'cancelled' (a newer search replaced
     * it: do nothing, its answer is outdated) must not be confused with 'failed'
     * (API unavailable: switch to manual mode).
     */
    const runSearch = async (search: (signal: AbortSignal) => Promise<Commune[]>): Promise<SearchResult> => {
        const controller = new AbortController();
        searchController.current = controller;
        setIsSearching(true);
        try {
            const communes = await search(controller.signal);
            return controller.signal.aborted ? { status: 'cancelled' } : { status: 'found', communes };
        } catch {
            if (controller.signal.aborted) {
                return { status: 'cancelled' };
            }
            setIsManual(true);
            return { status: 'failed' };
        } finally {
            if (searchController.current === controller) {
                setIsSearching(false);
            }
        }
    };

    /** Fills every field from a commune and a postal code */
    const applyCommune = (commune: Commune, postalCode: string) => {
        onChange({
            postalCode,
            city: commune.name,
            department: commune.department,
            latitude: commune.latitude,
            longitude: commune.longitude,
            communeCode: commune.code,
            surfaceHectares: commune.surfaceHectares,
        });
    };

    const handlePostalCodeChange = async (text: string) => {
        const postalCode = text.replace(/\D/g, '').slice(0, LOCATION_LIMITS.postalCodeLength);
        resetSearch();

        const isComplete = postalCode.length === LOCATION_LIMITS.postalCodeLength;
        // Manual mode keeps the typed city; otherwise the old city no longer matches
        const cityToKeep = isManual ? value.city : '';
        onChange({
            postalCode,
            city: cityToKeep,
            department: isManual && isComplete ? departmentFromPostalCode(postalCode) : '',
            latitude: null,
            longitude: null,
            communeCode: null,
            surfaceHectares: null,
        });
        if (!isComplete) {
            return;
        }

        const result = await runSearch((signal) => searchCommunesByPostalCode(postalCode, signal));
        if (result.status === 'cancelled') {
            return;
        }
        if (result.status === 'failed') {
            // The city will be typed by hand, the department comes from the code
            onChange({
                postalCode,
                city: cityToKeep,
                department: departmentFromPostalCode(postalCode),
                latitude: null,
                longitude: null,
                communeCode: null,
                surfaceHectares: null,
            });
            return;
        }

        // The service answered: back to the normal mode if it had been unavailable
        setIsManual(false);
        const { communes } = result;
        if (communes.length === 0) {
            setIsNotFound(true);
        } else if (communes.length === 1) {
            applyCommune(communes[0], postalCode);
        } else {
            // Hide the keyboard: it would cover the list opening under the city field
            Keyboard.dismiss();
            setCityChoices(communes);
        }
    };

    const handleCityChange = (city: string) => {
        resetSearch();

        if (isManual) {
            onChange({ ...value, city });
            return;
        }
        onChange({ postalCode: '', city, department: '', latitude: null, longitude: null, communeCode: null, surfaceHectares: null });

        const query = city.trim();
        if (query.length < CITY_SEARCH_MIN_LENGTH) {
            return;
        }
        cityTimer.current = setTimeout(async () => {
            const result = await runSearch((signal) => searchCommunesByName(query, signal));
            if (result.status === 'found') {
                setSuggestions(result.communes);
            }
        }, CITY_SEARCH_DELAY_MS);
    };

    /** A city was picked from the suggestions */
    const handleSuggestionPress = (commune: Commune) => {
        resetSearch();
        if (commune.postalCodes.length === 1) {
            applyCommune(commune, commune.postalCodes[0]);
            return;
        }
        // Several codes (Paris): the city is set, the user picks the code
        Keyboard.dismiss();
        applyCommune(commune, '');
        setCodeChoices([...commune.postalCodes].sort());
    };

    // The lists stay after a choice, so the dropdown can still be changed. They
    // disappear when the other field is edited (resetSearch).
    const handleCityChoice = (communeCode: string) => {
        const commune = cityChoices.find((candidate) => candidate.code === communeCode);
        if (commune) {
            applyCommune(commune, value.postalCode);
        }
    };

    const handleCodeChoice = (postalCode: string) => {
        onChange({ ...value, postalCode });
    };

    return (
        <View>
            {/* The field with several possible answers becomes a dropdown list */}
            {codeChoices.length > 0 ? (
                <DropdownField
                    label={labels.postalCode}
                    options={codeChoices.map((code) => ({ value: code, label: code }))}
                    value={value.postalCode}
                    onChange={handleCodeChoice}
                    placeholder={labels.choosePostalCode}
                    defaultOpen
                    error={postalCodeError}
                />
            ) : (
                <FormInput
                    label={labels.postalCode}
                    value={value.postalCode}
                    onChangeText={handlePostalCodeChange}
                    keyboardType="number-pad"
                    maxLength={LOCATION_LIMITS.postalCodeLength}
                    textContentType="postalCode"
                    hint={isSearching ? labels.searching : undefined}
                    error={isNotFound ? labels.notFound : postalCodeError}
                />
            )}

            {cityChoices.length > 0 ? (
                <DropdownField
                    label={labels.city}
                    options={cityChoices.map((commune) => ({ value: commune.code, label: commune.name }))}
                    value={cityChoices.find((commune) => commune.name === value.city)?.code ?? ''}
                    onChange={handleCityChoice}
                    placeholder={labels.chooseCity}
                    defaultOpen
                    error={cityError}
                />
            ) : (
                <FormInput
                    label={labels.city}
                    value={value.city}
                    onChangeText={handleCityChange}
                    maxLength={LOCATION_LIMITS.cityMax}
                    textContentType="addressCity"
                    hint={isManual ? labels.unavailable : undefined}
                    error={cityError}
                />
            )}

            {/* Cities matching what is typed */}
            {suggestions.length > 0 ? (
                <View style={styles.suggestions}>
                    {suggestions.map((commune) => (
                        <Pressable
                            key={commune.code}
                            onPress={() => handleSuggestionPress(commune)}
                            style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
                            accessibilityRole="button"
                            accessibilityLabel={`${commune.name} (${commune.department})`}
                        >
                            <Text style={styles.suggestionText}>
                                {commune.name} ({commune.department})
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    suggestions: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.inputBg,
        overflow: 'hidden',
    },
    suggestion: {
        minHeight: 44,                   // Apple's minimum touch target
        justifyContent: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    pressed: {
        opacity: 0.6,
    },
    suggestionText: {
        ...Typography.body,
        color: Colors.text.primary,
    },
});
