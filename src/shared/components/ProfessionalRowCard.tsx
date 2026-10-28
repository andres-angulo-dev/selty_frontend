import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// PROFESSIONAL ROW CARD
// Compact "proposed by" row used on detail screens (offer, annonce...).
// Project-agnostic: only primitives in, no business type. The caller maps
// its own model (Professional, Vendor, Host...) to these props and provides
// every user-facing label, so the component can be dropped into any app.
// ============================================

interface ProfessionalRowCardProps {
    // Identity
    name: string;
    subtitle?: string;               // e.g. "Plombier · Paris"
    avatarUrl?: string | null;       // Falls back to a person icon when missing

    // Rating (both must be provided to render the row)
    rating?: number;
    reviewsCount?: number;
    reviewsLabel?: string;           // e.g. "avis" → "4.8 (120 avis)"

    // Badges
    isVerified?: boolean;
    verifiedLabel?: string;          // e.g. "Pro vérifié" — required to render the pill
    isOnline?: boolean;              // Green dot on the avatar

    // Interaction
    onPress?: () => void;            // Optional: without it the card is static (no chevron)
    style?: StyleProp<ViewStyle>;    // Container override (margins from the parent)
}

export const ProfessionalRowCard: React.FC<ProfessionalRowCardProps> = ({
    name,
    subtitle,
    avatarUrl,
    rating,
    reviewsCount,
    reviewsLabel,
    isVerified = false,
    verifiedLabel,
    isOnline = false,
    onPress,
    style,
}) => {
    // Rating row only makes sense when both values exist
    const hasRating = rating !== undefined && reviewsCount !== undefined;

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed, style]}
        >
            {/* Avatar + online dot */}
            <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name='person' size={22} color={Colors.text.tertiary} />
                    </View>
                )}
                {isOnline && <View style={styles.onlineDot} />}
            </View>

            {/* Text block */}
            <View style={styles.info}>
                {/* Name + verified pill on the same line */}
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    {isVerified && verifiedLabel && (
                        <View style={styles.verifiedPill}>
                            <Ionicons name='checkmark' size={10} color={Colors.text.inverse} />
                            <Text style={styles.verifiedText}>{verifiedLabel}</Text>
                        </View>
                    )}
                </View>

                {subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                )}

                {hasRating && (
                    <View style={styles.ratingRow}>
                        <Ionicons name='star' size={12} color={Colors.semantic.warning} />
                        <Text style={styles.rating}>{rating}</Text>
                        <Text style={styles.reviews}>
                            ({reviewsCount}{reviewsLabel ? ` ${reviewsLabel}` : ''})
                        </Text>
                    </View>
                )}
            </View>

            {/* Chevron only when the card is actionable */}
            {onPress && (
                <Ionicons name='chevron-forward' size={18} color={Colors.text.tertiary} />
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,            // 12px between avatar, text and chevron
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.7,
    },

    // ── Avatar ────────────────────────────────────────
    avatarWrapper: {
        width: 48,
        height: 48,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
    },

    avatarPlaceholder: {
        backgroundColor: Colors.neutral.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // White ring around the dot so it reads on any avatar
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.semantic.success,
        borderWidth: 2,
        borderColor: Colors.neutral.white,
    },

    // ── Text block ────────────────────────────────────
    info: {
        flex: 1,
        gap: 2,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    name: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
        flexShrink: 1,                           // Name truncates, pill keeps its width
    },

    verifiedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },

    verifiedText: {
        ...Typography.captionBis,
        color: Colors.text.inverse,
        fontWeight: '700',
    },

    subtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },

    rating: {
        ...Typography.caption,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    reviews: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },
});
