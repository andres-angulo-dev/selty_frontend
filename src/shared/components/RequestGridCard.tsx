import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, FontSize } from '@/shared/constants';

// ============================================
// REQUEST GRID CARD
// A need published by an individual, in the 2-column feed. Same size as
// AnnonceGridCard (4:5) so the grid stays regular, but no full-bleed photo:
// light blue background and navy texts, so a request is never taken for a
// professional's annonce.
// Primitive props only: every text is prepared by the caller.
// Enlarged text: each line is limited, and the description is the part that
// gives way, so the location and the urgency always stay visible.
// `highlightLabel`: strong outline + top strip, so a pro spots at a glance the
// requests of their own trade among all the others.
// ============================================

interface RequestGridCardProps {
    badgeLabel: string;              // "DEMANDE"
    tradeLabel?: string;             // "Peintre"
    title: string;
    description: string;
    authorName: string;              // "Sophie M." — never a full name
    authorInitial: string;           // "S"
    locationLabel: string;           // "Melun (77) · 3.0 km"
    urgencyLabel: string;            // "Cette semaine"
    isUrgent?: boolean;              // Shows the urgency in red
    timeLabel: string;               // "Il y a 2 h"
    highlightLabel?: string;         // "Votre métier": outline + strip when given
    onPress?: () => void;
}

const AVATAR_SIZE = 20;

export const RequestGridCard: React.FC<RequestGridCardProps> = ({
    badgeLabel,
    tradeLabel,
    title,
    description,
    authorName,
    authorInitial,
    locationLabel,
    urgencyLabel,
    isUrgent = false,
    timeLabel,
    highlightLabel,
    onPress,
}) => {
    // Same computation as AnnonceGridCard: half the screen minus the page padding and the 3px gap
    const { width: screenWidth } = useWindowDimensions();
    const cardWidth = (screenWidth - Spacing.md * 2 - 3) / 2;
    const cardHeight = cardWidth * (5 / 4);

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [
                styles.container,
                { width: cardWidth, height: cardHeight },
                highlightLabel ? styles.highlighted : null,
                pressed && onPress && styles.pressed,
            ]}
        >
            {highlightLabel ? (
                <View style={styles.highlightStrip}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.text.inverse} />
                    <Text style={styles.highlightText} numberOfLines={1}>{highlightLabel}</Text>
                </View>
            ) : null}

            {/* Badge + trade: always in the same place, on every card */}
            <View style={styles.topRow}>
                <View style={styles.badge}>
                    <Ionicons name="megaphone-outline" size={10} color={Colors.text.inverse} />
                    <Text style={styles.badgeText} numberOfLines={1}>{badgeLabel}</Text>
                </View>
                {tradeLabel ? <Text style={styles.trade} numberOfLines={1}>{tradeLabel}</Text> : null}
            </View>

            <Text style={styles.title} numberOfLines={2}>{title}</Text>

            {/* Flexible part: takes the free space, clipped first when space is short */}
            <View style={styles.descriptionBox}>
                <Text style={styles.description} numberOfLines={3}>{description}</Text>
            </View>

            <View style={styles.authorRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText} maxFontSizeMultiplier={1.2}>{authorInitial}</Text>
                </View>
                <Text style={styles.meta} numberOfLines={1}>{authorName}</Text>
            </View>

            <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={11} color={Colors.text.secondary} />
                <Text style={styles.meta} numberOfLines={1}>{locationLabel}</Text>
            </View>

            <View style={styles.metaRow}>
                <Ionicons
                    name={isUrgent ? 'flash-outline' : 'time-outline'}
                    size={11}
                    color={isUrgent ? Colors.semantic.error : Colors.text.secondary}
                />
                <Text style={[styles.meta, isUrgent && styles.urgent]} numberOfLines={1}>
                    {urgencyLabel} · {timeLabel}
                </Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,                 // Same tight rounding as AnnonceGridCard
        overflow: 'hidden',
        backgroundColor: Colors.primary.subtle,
        padding: Spacing.sm + 2,
        gap: 3,
    },
    pressed: {
        opacity: 0.85,
    },
    highlighted: {
        borderWidth: 2,
        borderColor: Colors.primary.main,
        paddingTop: 0,                   // The strip touches the top edge
    },
    // Edge to edge: negative margins cancel the card padding
    highlightStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginHorizontal: -(Spacing.sm + 2),
        marginBottom: 3,
        paddingVertical: 2,
        backgroundColor: Colors.primary.main,
    },
    highlightText: {
        ...Typography.captionBis,
        color: Colors.text.inverse,
        fontWeight: '700',
        flexShrink: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.xs,
        marginBottom: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.main,
    },
    badgeText: {
        ...Typography.captionBis,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
    trade: {
        ...Typography.captionBis,
        color: Colors.primary.main,
        fontWeight: '600',
        flexShrink: 1,
    },
    title: {
        ...Typography.bodyBold,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.25,
        color: Colors.primary.main,
    },
    descriptionBox: {
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    },
    description: {
        ...Typography.captionBis,
        color: Colors.text.secondary,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: Colors.primary.main,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...Typography.captionBis,
        lineHeight: undefined,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    meta: {
        ...Typography.captionBis,
        color: Colors.text.secondary,
        flexShrink: 1,
    },
    urgent: {
        color: Colors.semantic.error,
        fontWeight: '700',
    },
});
