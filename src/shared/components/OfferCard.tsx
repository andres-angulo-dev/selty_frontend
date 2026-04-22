import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '@/shared/constants';
import { Offer } from '@/shared/types';

const CARD_WIDTH = 175;
const COVER_HEIGHT = 90;
const BADGE_OVERLAP = 14; // px the badge overlaps below the image

interface OfferCardProps {
    offer: Offer;
    onPress: (offer: Offer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
    offer,
    onPress,
}) => {
    return (
        <Pressable
            onPress={() => onPress(offer)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            {/* Cover image — top of card */}
            <View style={styles.coverWrapper}>
                {offer.image ? (
                    <ImageBackground source={{ uri: offer.image }} style={styles.cover}>
                        <View style={styles.overlay} />
                    </ImageBackground>
                ) : (
                    <View style={[styles.cover, styles.coverFallback]} />
                )}
            </View>

            {/* Discount badge — floats over image/content boundary */}
            <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{offer.discount}</Text>
            </View>

            {/* Title — top of content area, below floating badge */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {offer.title}
                </Text>
            </View>

            {/* Pro name — absolutely anchored to bottom, independent of title length */}
            {offer.professional && (
                <View style={styles.professionalRow}>
                    <Ionicons name="person-circle-outline" size={12} color={Colors.text.tertiary} />
                    <Text style={styles.professionalName} numberOfLines={1}>
                        {offer.professional.firstName} {offer.professional.lastName}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: 195,
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        marginRight: Spacing.sm,
        // No overflow: 'hidden' — would kill shadow AND clip the floating badge
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.75,
    },

    // Clips image to top rounded corners only
    coverWrapper: {
        height: COVER_HEIGHT,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        overflow: 'hidden',
    },

    cover: {
        flex: 1,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.38)',
    },

    coverFallback: {
        backgroundColor: Colors.primary.main,
    },

    // Floats at the image/content boundary — absolute relative to card
    discountBadge: {
        position: 'absolute',
        top: COVER_HEIGHT - BADGE_OVERLAP,
        left: 10,
        zIndex: 10,
        backgroundColor: Colors.semantic.error,
        borderRadius: BorderRadius.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 5,
    },

    discountText: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: Colors.neutral.white,
        letterSpacing: 0.3,
    },

    content: {
        paddingTop: BADGE_OVERLAP + 20,
        paddingHorizontal: 10,
    },

    title: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text.primary,
        lineHeight: 18,
    },

    // Anchored to the bottom of the card — decoupled from title length
    professionalRow: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    professionalName: {
        fontSize: 11,
        color: Colors.text.tertiary,
        flex: 1,
    },
});
