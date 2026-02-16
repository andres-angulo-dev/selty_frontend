import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Category } from '../types';
import { Professional } from '@/features/professional/types';

interface SearchOverlayProps {
    searchText: string;
    recentSearches: string[];
    categoryResults: Category[];
    professionalResults: Professional[];
    onRecentSearchPress: (search: string) => void;
    onClearHistory: () => void;
    onCategoryPress: (category: Category) => void;
    onProfessionalPress: (professional: Professional) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
    searchText,
    recentSearches,
    categoryResults,
    professionalResults,
    onRecentSearchPress,
    onClearHistory,
    onCategoryPress,
    onProfessionalPress,
}) => {
    // ============================================
    // STATE: Empty search - Show recent searches
    // ============================================
    if (searchText.length === 0) {
        // No recent searches at all
        if (recentSearches.length === 0) return null;

        return (
            <View style={styles.container}>
                {/* Header with clear button */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recherches récentes</Text>
                    <Pressable onPress={onClearHistory} style={({ pressed }) => [pressed && styles.pressed]}>
                        <Text style={styles.clearText}>Effacer</Text>
                    </Pressable>
                </View>

                {/* Recent searches list */}
                {recentSearches.map((search, index) => (
                    <Pressable key={index} onPress={() => onRecentSearchPress(search)} style={({ pressed }) => [pressed && styles.pressed]}>
                        <Ionicons name='time-outline' size={18} color={Colors.text.tertiary} />
                        <Text style={styles.resultText}>{search}</Text>
                    </Pressable>
                ))}
            </View>
        )
    }

    // ============================================
    // STATE: No results
    // ============================================
    const hasResults = categoryResults.length > 0 || professionalResults.length > 0;
    
    if (!hasResults) {
        return (
            <View style={styles.container}>
                <View style={styles.noResults}>
                    <Ionicons name='search-outline' size={40} color={Colors.text.tertiary} />
                    <Text style={styles.noResultsText}>Aucun Résultat pour "{searchText}"</Text>
                </View>
            </View>
        )
    }

    // ============================================
    // STATE 2: Show suggestions
    // ============================================
    return (
        <ScrollView style={styles.container}> 
            {/* Catégory suggestions */}
            {categoryResults.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Catégories</Text>
                    {categoryResults.map((category) => (
                        <Pressable key={category.id} onPress={() => onCategoryPress(category)} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
                            <Ionicons name={category.icon as any} size={18} color={Colors.primary.main} />
                            <Text style={styles.resultText}>{category.name}</Text>
                        </Pressable>
                    ))}
                </>
            )}

            {/* Professional suggestions */}
            {professionalResults.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Professionnels</Text>
                    {professionalResults.map((pro) => (
                        <Pressable key={pro.id} onPress={() => onProfessionalPress(pro)} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
                            <View style={styles.profilContainer}>
                                <Ionicons name='person-outline' size={18} color={Colors.primary.main} />
                                <View>
                                    <Text style={styles.resultText}>{pro.firstName} {pro.lastName}</Text>
                                    <Text style={styles.resultSubText}>{pro.profession}</Text>
                                </View>
                            </View>
                            {pro.distance && (
                                <View style={styles.distanceContainer}>
                                    <Ionicons name='location-outline' size={14} color={Colors.text.tertiary} />
                                    <Text style={styles.distanceText}>{pro.distance}</Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
        paddingHorizontal: Spacing.md,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },

    clearText: {
        ...Typography.caption,
        color: Colors.primary.main,
    },

    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.border,
    },

    profilContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    resultText: {
        ...Typography.body,
        color: Colors.text.primary,
        marginLeft: Spacing.sm,
    },

    resultSubText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft: Spacing.sm,
    },

    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    distanceText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },

    noResults: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Spacing.xxxl,
    },

    noResultsText: {
        ...Typography.body,
        color: Colors.text.tertiary,
        marginTop: Spacing.md,
    },

    pressed: {
        opacity: 0.6,
    },
})