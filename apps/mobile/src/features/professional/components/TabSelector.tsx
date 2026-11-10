import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
 
// Define the possible tab values
export type TabName = 'annonces' | 'avis';

// Props Type
type TabSelectorProps = {
    activeTab: TabName;
    onTabChange: (tab: TabName) => void;
    annoncesCount: number;
    reviewsCount: number;
};

export const TabSelector: React.FC<TabSelectorProps> = ({
    activeTab,
    onTabChange,
    annoncesCount,
    reviewsCount,
}) => {
    return (
        <View style={styles.container}>
            {/* Annonces tab */}
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'annonces' && styles.activeTab]}
                onPress={() => onTabChange('annonces')}
            >
                <Text style={[styles.tabText, activeTab === 'annonces' && styles.activeTabText]}>{Strings.professional.tabs.annonces} ({annoncesCount})</Text>
            </TouchableOpacity>

            {/* Avis tab */}
            <TouchableOpacity
                style={[styles.tab, activeTab === 'avis' && styles.activeTab]}
                onPress={() => onTabChange('avis')}
            >
                <Text style={[styles.tabText, activeTab === 'avis' && styles.activeTabText]}>{Strings.professional.tabs.reviews} ({reviewsCount})</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: Colors.neutral.border,
        marginBottom: Spacing.md,
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        paddingBottom: Spacing.sm,
        borderBottomWidth: 4,
        borderBottomColor: 'transparent',
    },

    activeTab: {
        borderBottomColor: Colors.primary.main,
    },

    tabText: {
        ...Typography.label,
        color: Colors.text.tertiary,
    },

    activeTabText: {
        color: Colors.primary.main,
        fontWeight: '600',
    },
})