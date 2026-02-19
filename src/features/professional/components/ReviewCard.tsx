import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';
import { Review } from '@/features/profile/types';
import { formatRelativeDate } from '@/shared/utils/formatDate';

type ReviewCardProps = {
    review: Review;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    // Build stars array based on rating (1 to 5)
    const stars = Array.from({ length: 5 }, (_, i) => i < review.rating);

    return (
        <View style={styles.reviews}>
            {/* Header: avatar + name + date */}
            <View style={styles.header}>
                {/* Avatar placeholder with initials */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarInitials}>{review.userName.charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.userName}>{review.userName}</Text>
                    <Text style={styles.date}>{formatRelativeDate(review.createdAt)}</Text>
                </View>
            </View>

            {/* Stars */}
            <View style={styles.starsRow}>
                {stars.map((filled, index) => 
                    <Ionicons key={index} name={filled ? 'star' : 'star-outline'} size={14} color={Colors.semantic.warning} />
                )}
            </View>

            {/* Comment */}
            <Text style={styles.comment}>{review.comment}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm, 
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },    
    
    reviews: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm, 
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },

    avatarInitials: {
        ...Typography.label,
        color: Colors.text.inverse,
        fontWeight: '600',
    },

    headerInfo: {
        flex: 1
    },

    userName: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    date: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },

    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: Spacing.sm,
    },

    comment: {
        ...Typography.caption,
        color: Colors.text.secondary,
        lineHeight: 20,
    },
});