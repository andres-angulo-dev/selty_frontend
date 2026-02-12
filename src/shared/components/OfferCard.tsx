import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Offer } from '@/features/offer/types';

interface OfferCardProps {
    offer: Offer;
    onPress: (offer: Offer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
    offer,
    onPress,
}) => {
    return (
        <Pressable onPress={() => onPress(offer)} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
            {/* Top part - Badge + Title */}
            <>
                {/* Discount badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{offer.discount}</Text>
                </View>

                {/* Offer title */}
                <Text style={styles.title} numberOfLines={2}>
                    {offer.title}
                </Text>
            </>

            {/* Bottom part - Professional info */}
            <View>
                {/* Professional name */}
                {offer.professional && (
                    <View style={styles.professionalRow}>
                        <Ionicons name='person-circle-outline' size={14} color={Colors.text.tertiary} />
                        <Text style={styles.professionalName} numberOfLines={1}>
                            {offer.professional.firstName} {offer.professional.lastName}
                        </Text>
                    </View>
                )}

                {/* Category */}
                {offer.category && (
                    <View style={styles.categoryRow}>
                        <Ionicons name={offer.category.icon as any} size={14} color={Colors.text.tertiary} />
                        <Text style={styles.categoryName} numberOfLines={1}>
                            {offer.category.name}
                        </Text> 
                    </View>
                )}
            </View>            
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        backgroundColor: Colors.neutral.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginRight: Spacing.md,
        width: 200,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    pressed: {
        opacity: 0.7,
    },

    badge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.semantic.error,
        borderRadius: 8,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        marginBottom: Spacing.sm,
    },

    badgeText: {
        ...Typography.caption,
        color: Colors.neutral.white,
        fontWeight: '700',
    },

    title: {
        ...Typography.label,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },

    professionalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    professionalName: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginLeft: 4,
    },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    categoryName: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft:4,
    }
})