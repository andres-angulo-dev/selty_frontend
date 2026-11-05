import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// UNAVAILABLE CARD
// A saved item that can no longer be opened (deleted, ended offer...).
// Shows the copy kept at save time, greyed under a white veil, with a message
// pill and a "remove" action. Deliberately NOT pressable: there is no detail
// to open. All texts come from the caller.
// - layout 'tile': column card for grids (annonces, offers), width from the caller
// - layout 'row': full-width row (professionals list)
// ============================================

interface UnavailableCardProps {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    message: string;                     // e.g. "Offre terminée"
    removeLabel: string;                 // e.g. "Retirer"
    removeAccessibilityLabel?: string;   // e.g. "Retirer Pose de parquet des favoris"
    onRemove: () => void;
    layout?: 'tile' | 'row';
    imageShape?: 'circle' | 'square';    // row only: circle = person (pro), square = content (annonce, offer)
    width?: number;                      // tile only
    style?: StyleProp<ViewStyle>;
}

const ROW_IMAGE_SIZE = 48;

export const UnavailableCard: React.FC<UnavailableCardProps> = ({
    title,
    subtitle,
    imageUrl,
    message,
    removeLabel,
    removeAccessibilityLabel,
    onRemove,
    layout = 'tile',
    imageShape = 'circle',
    width,
    style,
}) => {
    const isRow = layout === 'row';

    // Image (or icon placeholder) under a white veil
    const media = (
        <View
            style={
                isRow
                    ? [styles.rowMedia, imageShape === 'square' && styles.rowMediaSquare]
                    : [styles.tileMedia, width ? { height: width * 0.75 } : null]
            }
        >
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
                <Ionicons name="image-outline" size={isRow ? 22 : 28} color={Colors.text.tertiary} />
            )}
            <View style={styles.veil} />
        </View>
    );

    const messagePill = (
        <View style={styles.pill}>
            <Ionicons name="alert-circle-outline" size={12} color={Colors.text.secondary} />
            <Text style={styles.pillText} numberOfLines={1}>{message}</Text>
        </View>
    );

    const removeButton = (
        <Pressable
            onPress={onRemove}
            hitSlop={8}
            style={({ pressed }) => [styles.removeButton, isRow && styles.removeButtonRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={removeAccessibilityLabel ?? removeLabel}
        >
            <Text style={styles.removeText}>{removeLabel}</Text>
        </Pressable>
    );

    return (
        <View
            style={[
                styles.card,
                isRow ? styles.rowCard : null,
                isRow && imageShape === 'square' ? styles.rowCardFlush : null,
                !isRow && width ? { width } : null,
                style,
            ]}
            // VoiceOver reads title + message together, then the remove button
            accessible={false}
        >
            {media}

            <View
                style={
                    isRow
                        ? [styles.rowBody, imageShape === 'square' && styles.rowBodyFlush]
                        : styles.tileBody
                }
            >
                {/* Greyed texts: what the item WAS */}
                <View accessible accessibilityLabel={`${title}. ${message}`}>
                    {/* Row: one line per text, same height as the other rows */}
                    <Text style={styles.title} numberOfLines={isRow ? 1 : 2}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
                {messagePill}
                {isRow ? null : removeButton}
            </View>

            {isRow ? removeButton : null}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.neutral.border,
    },

    rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
    },

    // ── Media ─────────────────────────────────────────
    tileMedia: {
        height: 120,
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    rowMedia: {
        width: ROW_IMAGE_SIZE,
        height: ROW_IMAGE_SIZE,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Square = same photo as MediaRowCard: flush left, full card height
    // (the card has overflow: hidden, so its rounded corners clip the photo)
    rowMediaSquare: {
        width: Spacing.md + ROW_IMAGE_SIZE,
        height: undefined,
        alignSelf: 'stretch',
        borderRadius: 0,
    },

    // White veil = the "greyed" look on photos
    veil: {
        position: 'absolute',            // covers the whole media box
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: Colors.overlay.whiteVeil,
    },

    // ── Texts ─────────────────────────────────────────
    tileBody: {
        padding: Spacing.sm + Spacing.xs,
        gap: Spacing.sm,
    },

    // Same spacing as the ProfessionalRowCard text block
    rowBody: {
        flex: 1,
        gap: 2,
    },

    // Flush row: the vertical padding moves from the card to the texts
    rowCardFlush: {
        alignItems: 'stretch',
        paddingLeft: 0,
        paddingVertical: 0,
    },

    rowBodyFlush: {
        justifyContent: 'center',
        paddingVertical: Spacing.md,
    },

    title: {
        ...Typography.bodyBold,
        color: Colors.text.tertiary,
    },

    subtitle: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginTop: 2,
    },

    // ── Message + action ──────────────────────────────
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        maxWidth: '100%',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.inputBg,
    },

    pillText: {
        ...Typography.caption,
        color: Colors.text.secondary,
        fontWeight: '600',
        flexShrink: 1,
    },

    removeButton: {
        alignSelf: 'flex-start',
        paddingVertical: Spacing.xs,
    },

    // Row: action vertically centered on the right, like the bookmark of the other rows
    removeButtonRow: {
        alignSelf: 'center',
        paddingVertical: 0,
    },

    removeText: {
        ...Typography.label,
        color: Colors.primary.main,
        textDecorationLine: 'underline',
    },

    pressed: {
        opacity: 0.6,
    },
});
