// ============================================
// ANNONCE GRID CARD
// Instagram-style card for the 2-column home feed.
// - Photo portrait 4:5 with smooth gradient overlay (expo-linear-gradient)
// - Category badge with frosted glass effect (expo-blur)
// - Rating displayed as ★ 4.9 (Airbnb style)
// - Distance with pin icon, fallback to city name
// Does NOT replace AnnonceCard (still used in ProfessionalDetailScreen
// and CommentsModal).
// ============================================

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Pressable,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, FontSize } from '@/shared/constants';
import { Annonce } from '@/shared/types';

// ============================================
// PROPS
// ============================================

interface AnnonceGridCardProps {
    annonce: Annonce;
    // Category name passed from the parent — Annonce only stores categoryId,
    // so we resolve the name at the list level to keep this card stateless.
    categoryName?: string;
    onPress: (annonce: Annonce) => void;
}

// ============================================
// COMPONENT
// ============================================

export const AnnonceGridCard: React.FC<AnnonceGridCardProps> = ({
    annonce,
    categoryName,
    onPress,
}) => {
    // Card width = half the screen minus outer padding (both sides) and the
    // 3 px gap between the two columns.
    const { width: screenWidth } = useWindowDimensions();
    const CARD_WIDTH = (screenWidth - Spacing.md * 2 - 3) / 2;

    // Portrait ratio 4:5 — same as an Instagram portrait post.
    const CARD_HEIGHT = CARD_WIDTH * (5 / 4);

    // First image URL — null triggers the placeholder.
    const imageUrl = annonce.images[0] ?? null;

    // Rating from the linked professional (e.g. 4.8 → "4.8").
    const rating = annonce.professional?.rating ?? null;
    const ratingLabel = rating !== null ? rating.toFixed(1) : null;

    // Distance first, city name as fallback when location is unavailable.
    const distance = annonce.professional?.distance ?? null;
    const locationLabel = distance ?? annonce.city;

    return (
        <Pressable
            onPress={() => onPress(annonce)}
            style={({ pressed }) => [
                styles.container,
                { width: CARD_WIDTH, height: CARD_HEIGHT },
                pressed && styles.pressed,
            ]}
        >
            {/* ── PHOTO ── */}
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            ) : (
                // Grey placeholder shown when no image is attached to the annonce.
                <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
                    <Ionicons name="image-outline" size={32} color={Colors.text.tertiary} />
                </View>
            )}

            {/* ── GRADIENT OVERLAY ──
                Smooth transition from fully transparent (top 40%) to dark
                (bottom). Replicates the CSS linear-gradient in the mockup.
                expo-linear-gradient handles this natively on both iOS and Android. */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.22)', 'rgba(0,0,0,0.72)']}
                locations={[0.4, 0.65, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            {/* ── INFO OVERLAY — anchored to the bottom of the card ── */}
            <View style={styles.content}>

                {/* Category badge — frosted glass pill.
                    BlurView renders a native blur on the pixels behind the badge,
                    giving the "verre dépoli" / glassmorphism effect from the mockup. */}
                {categoryName && (
                    <BlurView intensity={40} tint="light" style={styles.badge}>
                        <Text style={styles.badgeText} numberOfLines={1}>
                            {categoryName}
                        </Text>
                    </BlurView>
                )}

                {/* Annonce title — 2 lines max, text shadow for readability */}
                <Text style={styles.title} numberOfLines={2}>
                    {annonce.title}
                </Text>

                {/* Rating + Distance row */}
                <View style={styles.meta}>
                    {/* ★ 4.9 — Airbnb-style: single star + numeric rating */}
                    {ratingLabel && (
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={10} color="#F8C32C" />
                            <Text style={styles.ratingText}>{ratingLabel}</Text>
                        </View>
                    )}

                    {/* 📍 distance (or city name as fallback) — max 45% width */}
                    <View style={styles.distanceRow}>
                        <Ionicons name="location-outline" size={10} color={Colors.neutral.white} />
                        <Text style={styles.distanceText} numberOfLines={1}>
                            {locationLabel}
                        </Text>
                    </View>
                </View>

            </View>
        </Pressable>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,        // Instagram-style tight rounding
        overflow: 'hidden',     // Clips image and gradient to border radius
        backgroundColor: Colors.neutral.border,
    },

    pressed: {
        opacity: 0.85,
    },

    placeholder: {
        backgroundColor: Colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // All text content sits at the bottom of the card, above the gradient.
    content: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.xs,
    },

    // Pill-shaped frosted glass badge.
    // overflow: 'hidden' is required for BlurView to respect borderRadius.
    badge: {
        alignSelf: 'flex-start',
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginBottom: 5,
    },

    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: Colors.neutral.white,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },

    title: {
        ...Typography.caption,
        fontSize: 11,
        color: Colors.neutral.white,
        fontWeight: '700',
        lineHeight: 14,
        marginBottom: 5,
        // Shadow adds readability even on bright photo areas.
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    ratingText: {
        fontSize: FontSize.xxs,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },

    // maxWidth 45% prevents long city names from overflowing onto the rating.
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '45%',
        gap: 2,
    },

    distanceText: {
        fontSize: FontSize.xxs,
        color: 'rgba(255,255,255,0.85)',
        flexShrink: 1,          // Truncates with ellipsis if still too long
    },
});
