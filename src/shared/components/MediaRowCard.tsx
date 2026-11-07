import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// MEDIA ROW CARD
// Full-width row: photo flush with the left edge (full card height), title, subtitle,
// optional pill, optional action on the right (e.g. a bookmark).
// Project-agnostic: primitives only, every text comes from the caller
// (annonces, offers, products, listings...).
// Always TWO lines (title, then subtitle + pill on the right), so a row with a
// pill is exactly as tall as a row without one (dev's choice, 2026-11-07).
// The pill is never cut: the subtitle gives way first ("Plombier · Mel…").
// The thumbnail and the action keep their size.
// ============================================

export type MediaRowBadgeTone = 'danger' | 'neutral' | 'primary';

interface MediaRowCardProps {
    title: string;
    subtitle?: string;
    imageUrl?: string | null;            // Falls back to an icon when missing
    placeholderIcon?: React.ComponentProps<typeof Ionicons>['name'];
    badge?: { label: string; tone?: MediaRowBadgeTone };   // e.g. "-30%" (danger), "Beauté" (neutral)
    onPress?: () => void;
    trailing?: React.ReactNode;          // Right-side action (bookmark...)
    style?: StyleProp<ViewStyle>;
}

// Photo width = where a ProfessionalRowCard avatar ends (16 padding + 48 avatar),
// so the texts of every row start at the same x. Its height follows the card.
const THUMBNAIL_WIDTH = Spacing.md + 48;

export const MediaRowCard: React.FC<MediaRowCardProps> = ({
    title,
    subtitle,
    imageUrl,
    placeholderIcon = 'image-outline',
    badge,
    onPress,
    trailing,
    style,
}) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.container, pressed && onPress && styles.pressed, style]}
        >
            {/* Thumbnail */}
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                    <Ionicons name={placeholderIcon} size={22} color={Colors.text.tertiary} />
                </View>
            )}

            {/* Texts */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {/* Second line: subtitle (shrinks) + pill (keeps its width) */}
                {subtitle || badge ? (
                    <View style={styles.secondLine}>
                        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                        {badge ? (
                            <View
                                style={[
                                    styles.badge,
                                    badge.tone === 'danger' && styles.badgeDanger,
                                    badge.tone === 'primary' && styles.badgePrimary,
                                    (!badge.tone || badge.tone === 'neutral') && styles.badgeNeutral,
                                ]}
                            >
                                <Text
                                    style={[styles.badgeText, (badge.tone === 'danger' || badge.tone === 'primary') && styles.badgeTextInverse]}
                                    numberOfLines={1}
                                >
                                    {badge.label}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}
            </View>

            {/* Wrapper keeps the action vertically centered while the row stretches */}
            {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.sm + Spacing.xs,
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.xl,
        alignItems: 'stretch',                   // photo takes the full card height
        paddingRight: Spacing.md,                // no left / vertical padding: the photo touches the edges
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.7,
    },

    // Left corners follow the card (no overflow: hidden on the card, it would cut the shadow on iOS)
    thumbnail: {
        width: THUMBNAIL_WIDTH,
        minHeight: 48,
        borderTopLeftRadius: BorderRadius.xl,
        borderBottomLeftRadius: BorderRadius.xl,
    },

    thumbnailPlaceholder: {
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Vertical padding lives here now, so the photo can go edge to edge
    info: {
        flex: 1,
        gap: 2,
        justifyContent: 'center',
        paddingVertical: Spacing.md,
    },

    trailing: {
        justifyContent: 'center',
    },

    title: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },

    secondLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    // flexShrink: the subtitle is the one cut when the line is full
    subtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
        flexShrink: 1,
    },

    // Slim pill: no vertical padding, so the line is as tall as a subtitle alone.
    // Never shrinks, but a very long label (a long price) is capped and ends with "…"
    badge: {
        flexShrink: 0,
        maxWidth: '60%',
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
    },

    badgeNeutral: {
        backgroundColor: Colors.primary.subtle,
    },

    badgeDanger: {
        backgroundColor: Colors.semantic.error,
    },

    badgePrimary: {
        backgroundColor: Colors.primary.main,
    },

    badgeText: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '700',
    },

    badgeTextInverse: {
        color: Colors.text.inverse,
    },
});
