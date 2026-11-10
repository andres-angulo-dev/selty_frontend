import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// MENU SECTION
// Groups several MenuRow items under a small uppercase title, inside one
// white card. No divider lines between rows: spacing alone separates them
// ("no-line" design rule). Generic on purpose: settings screens, profile
// screens or any grouped list in another project can reuse it as is.
// ============================================

interface MenuSectionProps {
    title?: string;                     // Optional uppercase label above the card
    children: React.ReactNode;          // Usually MenuRow items
    style?: StyleProp<ViewStyle>;       // Outer spacing tweaks from the caller
    cardStyle?: StyleProp<ViewStyle>;   // Card tweaks (e.g. larger padding for a form)
}

export const MenuSection: React.FC<MenuSectionProps> = ({ title, children, style, cardStyle }) => {
    return (
        <View style={[styles.container, style]}>
            {/* Section label, read as a header by screen readers */}
            {title ? (
                <Text style={styles.title} accessibilityRole="header">
                    {title}
                </Text>
            ) : null}

            {/* White card holding the rows */}
            <View style={[styles.card, cardStyle]}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },

    // Small uppercase label with tracking, like the design's "COMPTE"
    title: {
        ...Typography.caption,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: Colors.text.secondary,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },

    // Inner padding lets each row show its own rounded pressed state
    card: {
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs + 2,          // 6px
        ...Colors.shadow.card,
    },
});
