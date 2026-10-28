import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// DETAIL CTA BAR
// Bottom action bar for detail screens: a square secondary button (message)
// and a full-width primary button (call). Labels come from the caller so the
// component carries no copy of its own and works in any locale / project.
// Render it OUTSIDE the ScrollView so it stays anchored at the bottom.
// ============================================

interface DetailCtaBarProps {
    // Primary action
    onPrimaryPress: () => void;
    primaryLabel: string;                        // e.g. "Appeler"
    primaryIcon?: React.ComponentProps<typeof Ionicons>['name'];   // default 'call'

    // Secondary square action (hidden when no handler)
    onSecondaryPress?: () => void;
    secondaryAccessibilityLabel?: string;        // Screen readers: "Envoyer un message"
    secondaryIcon?: React.ComponentProps<typeof Ionicons>['name']; // default 'chatbubble-outline'
}

export const DetailCtaBar: React.FC<DetailCtaBarProps> = ({
    onPrimaryPress,
    primaryLabel,
    primaryIcon = 'call',
    onSecondaryPress,
    secondaryAccessibilityLabel,
    secondaryIcon = 'chatbubble-outline',
}) => {
    // Home-indicator area on iPhone: pad the bar so the buttons stay tappable
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            {/* Secondary square button */}
            {onSecondaryPress && (
                <Pressable
                    onPress={onSecondaryPress}
                    accessibilityRole='button'
                    accessibilityLabel={secondaryAccessibilityLabel}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                    <Ionicons name={secondaryIcon} size={22} color={Colors.primary.main} />
                </Pressable>
            )}

            {/* Primary full-width button */}
            <Pressable
                onPress={onPrimaryPress}
                accessibilityRole='button'
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
            >
                <Ionicons name={primaryIcon} size={18} color={Colors.text.inverse} />
                <Text style={styles.primaryText}>{primaryLabel}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,            // 12px between the two buttons
        backgroundColor: Colors.neutral.white,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm + Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
    },

    pressed: {
        opacity: 0.7,
    },

    secondaryButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.border,
        justifyContent: 'center',
        alignItems: 'center',
    },

    primaryButton: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.md,
    },

    primaryPressed: {
        backgroundColor: Colors.primary.dark,
    },

    primaryText: {
        ...Typography.button,
        color: Colors.text.inverse,
    },
});
