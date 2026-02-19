import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';
import { Review } from '@/features/profile/types';

type ReviewSummaryProps = {
    reviews: Review[];
    averageRating: number;
};

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
    reviews,
    averageRating,
}) => {
    const totalReviews = reviews.length;
    
    // Count reviews per star and calculate percentage
    const countByStar = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return { star, percentage };
    });

    if (totalReviews === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{Strings.professional.tabs.noReviews}</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Title */}
            <Text style={styles.container}>{Strings.professional.tabs.reviewsSummaryTitle}</Text>
            
            {/* Global stats */}
            <View style={styles.summary}>
                {/* Left: big average rating */}
                <View style={styles.averageContainer}>
                    <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
                    <Ionicons name='star' size={20} color={Colors.semantic.warning} />
                    <Text style={styles.totalText}>{Strings.professional.tabs.reviewsCount(totalReviews)}</Text>
                </View>

                {/* Right: progress bars per star */}
                <View style={styles.barsContainer}>
                    {countByStar.map(({ star, percentage }) => (
                        <View key={star} style={styles.barRow}>
                            {/* Star number */}
                            <Text style={styles.starLabel}>{star}</Text>
                            <Ionicons name='star' size={10} color={Colors.semantic.warning} />

                            {/* Progress bar track */}
                            <View style={styles.barTrack}>
                                {/* Filled portion - width is a percentage string */}
                                <View style={[styles.barFill, { width: `${percentage}%` }]} />
                            </View>

                            {/* % */}
                            <Text style={styles.countLabel}>{percentage}%</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
};

const styles =  StyleSheet.create({
    container: {
        ...Typography.label,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
    },    

    summary: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: Spacing.lg,
    },

    averageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },

    averageNumber: {
        ...Typography.h1,
        color: Colors.text.primary,
    },

    totalText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },

    barsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },

    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    starLabel: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        width: 10,
        textAlign: 'right',
    },

    barTrack: {
        flex: 1,
        height: 6,
        backgroundColor: Colors.neutral.border,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },

    barFill: {
        height: '100%',
        backgroundColor: Colors.semantic.warning,
        borderRadius: BorderRadius.full,
    },

    countLabel: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        width: 30,
        textAlign: 'center',
    },

    emptyContainer: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },

    emptyText: {
        ...Typography.body,
        color: Colors.text.tertiary,
    },
})