import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Professional } from '@/features/professional/types';

interface ProfessionalCardProps {
    professional: Professional;
    onPress: (professional: Professional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
    professional,
    onPress
}) => {
    return (
        <Pressable onPress={() => onPress(professional)} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
            {/* Avatar placeholder */}
            <View style={styles.avatar}>
                <Ionicons name='person' size={28} color={Colors.text.tertiary} />
            </View>

            {/* Professional info */}
            <View style={styles.info}>
                {/* Name */}
                <Text style={styles.name} numberOfLines={1}>
                    {professional.firstName} {professional.lastName}
                </Text>
                
                {/* Profession */}
                <Text style={styles.profession} numberOfLines={1}>
                    {professional.profession}
                </Text>

                {/* Rating + Distance */}
                <View style={styles.details}>
                    {/* Rating on the left */}
                    <View style={styles.ratingContainer}>
                        <Ionicons name='star' size={14} color={Colors.semantic.warning} /> 
                        <Text style={styles.rating}>
                            {professional.rating}
                        </Text>
                        <Text style={styles.reviewsCount}>
                            ({professional.reviewsCount})
                        </Text>
                    </View>

                    {/* Distance on the right */}    
                    {professional.distance && (
                        <View style={styles.distanceContainer}>
                            <Ionicons name='location-outline' size={14} color={Colors.text.tertiary} />
                            <Text style={styles.distanceText}>{professional.distance}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Certified badge */}
            {professional.isCertified && (
                <View style={styles.badge}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.semantic.success} />
                </View>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginRight: Spacing.md,
        width: 260,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    pressed: {
        opacity: 0.7,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: Colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    info: {
        flex: 1,
    },

    name: {
        ...Typography.label,
        color: Colors.text.primary,
    },

    profession: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: 2,
    },

    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },

    ratingContainer: {
        flexDirection: 'row',
    },

    rating: {
        ...Typography.caption,
        color: Colors.text.primary,
        fontWeight: '600',
        marginLeft: 3,
    },
    
    reviewsCount: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft: 2,
    },
    
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },

    distanceText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },

    badge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
    }
})