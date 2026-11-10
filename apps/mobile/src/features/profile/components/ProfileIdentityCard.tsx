import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, FontSize, LineHeight } from '@/shared/constants';

// ============================================
// PROFILE IDENTITY CARD
// Top card of the profile tab: avatar, name, subtitle, then optional
// professional extras (verified pill, rating) and one or two action buttons.
// The same card serves both variants: the individual simply passes no pro
// props. Extra content (e.g. a stats strip) goes in `children`, at the bottom.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// One button under the identity block
export interface ProfileIdentityAction {
    label: string;
    onPress: () => void;
    icon?: IoniconName;
}

interface ProfileIdentityCardProps {
    name: string;
    subtitle: string;                   // "Membre depuis mars 2025" or "Plombier · Lyon 3e"
    avatarUrl?: string | null;          // Falls back to a person icon

    // Professional extras: each block renders only when its props are given
    isVerified?: boolean;
    verifiedLabel?: string;             // e.g. "Vérifié"
    ratingText?: string;                // Already formatted by the caller: "4,8"
    reviewsText?: string;               // Already formatted: "(127 avis)"

    actions: ProfileIdentityAction[];   // 1 or 2 buttons, equal width
    children?: React.ReactNode;         // Optional footer (stats strip)
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
    name,
    subtitle,
    avatarUrl,
    isVerified = false,
    verifiedLabel,
    ratingText,
    reviewsText,
    actions,
    children,
}) => {
    return (
        <View style={styles.card}>
            {/* Identity block: avatar + texts */}
            <View style={styles.identityRow}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={32} color={Colors.text.tertiary} />
                    </View>
                )}

                <View style={styles.texts}>
                    {/* Name + verified pill on the same line */}
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={2}>
                            {name}
                        </Text>
                        {isVerified && verifiedLabel ? (
                            <View style={styles.verifiedPill}>
                                <Ionicons name="checkmark" size={11} color={Colors.text.inverse} />
                                <Text style={styles.verifiedText}>{verifiedLabel}</Text>
                            </View>
                        ) : null}
                    </View>

                    <Text style={styles.subtitle} numberOfLines={2}>
                        {subtitle}
                    </Text>

                    {/* Rating line (professionals only) */}
                    {ratingText ? (
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color={Colors.semantic.warning} />
                            <Text style={styles.rating}>{ratingText}</Text>
                            {reviewsText ? <Text style={styles.reviews}>{reviewsText}</Text> : null}
                        </View>
                    ) : null}
                </View>
            </View>

            {/* Action buttons: flex 1 each, so 1 button = full width, 2 = halves */}
            <View style={styles.actionsRow}>
                {actions.map((action) => (
                    <Pressable
                        key={action.label}
                        onPress={action.onPress}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                    >
                        {action.icon ? (
                            <Ionicons name={action.icon} size={16} color={Colors.primary.main} />
                        ) : null}
                        <Text style={styles.actionLabel} numberOfLines={1}>
                            {action.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {children}
        </View>
    );
};

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md + Spacing.xs,   // 20px
        gap: Spacing.md,
        marginBottom: Spacing.lg,
        ...Colors.shadow.card,
    },

    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },

    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // flex: 1 so a long name truncates instead of overflowing the card
    texts: {
        flex: 1,
        gap: 2,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    // 18px: a full name ("Alex Moreau") must fit beside the avatar
    name: {
        ...Typography.h3,
        fontSize: FontSize.lg,
        lineHeight: FontSize.lg * LineHeight.tight,
        color: Colors.text.primary,
        flexShrink: 1,
    },

    // Same look as the pill of ProfessionalRowCard, for app-wide consistency
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
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: 2,
    },
    rating: {
        ...Typography.bodySmall,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    reviews: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },

    actionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm + 2,                // 10px
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs + 2,                // 6px
        backgroundColor: Colors.neutral.surface,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm + 2,    // 10px
        paddingHorizontal: Spacing.sm,      // 8px: two half-width buttons need the room
    },
    actionPressed: {
        opacity: 0.7,
    },
    actionLabel: {
        ...Typography.buttonSmall,
        color: Colors.primary.main,
        flexShrink: 1,
    },
});
