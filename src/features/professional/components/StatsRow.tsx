import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';

// Props type
type StatsRowProps = {
    rating: number;
    reviewsCount: number;
    annoncesCount: number;
    createdAt: Date;
};

export const StatsRow: React.FC<StatsRowProps> = ({
    rating,
    reviewsCount,
    annoncesCount,
    createdAt,
}) => {
    // Format the year from the createdAt date
    const memberSince = createdAt.getFullYear().toString();

    return (
        <View style={styles.container}>
            {/* Annonces count */}
            <View style={styles.stat}>
                <Text style={styles.statLabel}>{Strings.professional.stats.annonces}</Text>
                <Text style={styles.statValue}>{annoncesCount}</Text>
            </View>
            
            {/* Vertical separator */}
            <View style={styles.separator} />

            {/* Rating */}
            <View style={styles.stat}>
                <Text style={styles.statLabel}>{Strings.professional.stats.reviews}</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name='star' size={18} color={Colors.semantic.warning} />
                    <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
                </View>
            </View>

            {/* Vertical separator */}
            <View style={styles.separator} />

            {/* Member since */}
            <View style={styles.stat}>
                <Text style={styles.statLabel}>{Strings.professional.stats.memberSince}</Text>
                <Text style={styles.statValue}>{memberSince}</Text>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: Colors.neutral.card,
        marginHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    stat: {
        flex: 1,
        alignItems: 'center',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    statValue: {
       ...Typography.h6,
       color: Colors.text.primary, 
    },

    statLabel: {
        ...Typography.captionBis,
        color: Colors.text.tertiary,
        textAlign: 'center',
        marginTop: 2,
    },

    separator: {
        width: 1,
        height: 30,
        backgroundColor: Colors.neutral.border,
    },
})