import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Button } from './button';

// ============================================
// EMPTY STATE
// Centered message for an empty list: soft round icon, title, short text,
// optional action button. All texts and the icon come from the caller.
// ============================================

interface EmptyStateProps {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    message?: string;
    actionLabel?: string;            // Button shown only with onAction
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
}

const ICON_CIRCLE_SIZE = 88;

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    actionLabel,
    onAction,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={36} color={Colors.primary.main} />
            </View>

            <Text style={styles.title} accessibilityRole="header">{title}</Text>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {actionLabel && onAction ? (
                <View style={styles.action}>
                    <Button label={actionLabel} onPress={onAction} />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xl,
    },

    iconCircle: {
        width: ICON_CIRCLE_SIZE,
        height: ICON_CIRCLE_SIZE,
        borderRadius: ICON_CIRCLE_SIZE / 2,
        backgroundColor: Colors.primary.subtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    title: {
        ...Typography.h3,
        color: Colors.primary.main,
        textAlign: 'center',
    },

    message: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },

    action: {
        marginTop: Spacing.lg,
    },
});
