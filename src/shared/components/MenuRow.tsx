import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// MENU ROW
// One tappable line of a MenuSection: icon in a soft rounded square, label with
// an optional badge UNDER it ("Gratuit": the label keeps the full width), then an
// optional trailing value ("Français") and a chevron.
// Every text comes from the caller, so the row has no copy of its own.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Two badge looks: neutral grey pill, or filled brand pill for emphasis
type MenuRowBadgeVariant = 'neutral' | 'primary';

interface MenuRowProps {
    icon: IoniconName;                  // Leading icon
    label: string;                      // Main text
    onPress: () => void;                // Tap action
    value?: string;                     // Current value shown before the chevron
    badge?: string;                     // Short pill text shown under the label
    badgeVariant?: MenuRowBadgeVariant; // Default 'neutral'
    showChevron?: boolean;              // Default true
}

export const MenuRow: React.FC<MenuRowProps> = ({
    icon,
    label,
    onPress,
    value,
    badge,
    badgeVariant = 'neutral',
    showChevron = true,
}) => {
    const isPrimaryBadge = badgeVariant === 'primary';

    // Screen readers hear "Langue, Français" in one sentence
    const accessibilityLabel = [label, value, badge].filter(Boolean).join(', ');

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        >
            {/* Left side: icon square + label */}
            <View style={styles.left}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={18} color={Colors.primary.main} />
                </View>
                <View style={styles.texts}>
                    {/* No line limit: a long label wraps instead of ending with "…" */}
                    <Text style={styles.label}>{label}</Text>
                    {badge ? (
                        <View style={[styles.badge, isPrimaryBadge && styles.badgePrimary]}>
                            <Text style={[styles.badgeText, isPrimaryBadge && styles.badgeTextPrimary]}>
                                {badge}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {/* Right side: optional value, then chevron */}
            <View style={styles.right}>
                {value ? <Text style={styles.value}>{value}</Text> : null}

                {showChevron ? (
                    <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
                ) : null}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md - Spacing.xs,   // 12px
        borderRadius: BorderRadius.md,
    },

    // Pressed feedback: the row itself turns cream, rounded inside the card
    pressed: {
        backgroundColor: Colors.neutral.surface,
    },

    // flex: 1 lets a long label shrink instead of pushing the chevron out
    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },

    iconBox: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md - Spacing.xs, // 12px
    },

    texts: {
        flex: 1,
        gap: Spacing.xs,
    },

    // Regular body weight, same size as the former profile menu items
    label: {
        ...Typography.body,
        color: Colors.text.primary,
    },

    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs + 2,                 // 6px
    },

    value: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },

    // alignSelf: the pill hugs its text instead of stretching over the row
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.neutral.surface,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm + 2,   // 10px
        paddingVertical: 2,
    },
    badgePrimary: {
        backgroundColor: Colors.primary.main,
    },
    badgeText: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    badgeTextPrimary: {
        color: Colors.text.inverse,
    },
});
