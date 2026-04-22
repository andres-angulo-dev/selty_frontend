import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Category } from '@/shared/types';

interface CategoryCardProps {
    category: Category;
    onPress: (category: Category) => void;
    variant?: 'square' | 'circle';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onPress,
    variant = 'square',
}) => {
    const baseColor = category.color || Colors.neutral.border;

    if (variant === 'circle') {
        return (
            <Pressable onPress={() => onPress(category)} style={({ pressed }) => [styles.circleContainer, pressed && styles.pressed]}>
                {/* Circle with light tint background + colored icon */}
                <View style={[styles.circleIconContainer, { backgroundColor: baseColor + '25' }]}>
                    <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={24} color={baseColor} />
                </View>
                <Text style={styles.circleName} numberOfLines={1}>
                    {category.name}
                </Text>
            </Pressable>
        );
    }

    return (
        <Pressable onPress={() => onPress(category)} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
            {/* Icon with colored background */}
            <View style={[styles.iconContainer, { backgroundColor: baseColor }]}>
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={28} color={Colors.neutral.white} />
            </View>

            {/* Category name */}
            <Text style={styles.name} numberOfLines={1}>
                {category.name}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    // ── Square variant (original) ──────────────────
    container: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 80,
    },

    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },

    name: {
        ...Typography.caption,
        color: Colors.text.primary,
        textAlign: 'center',
    },

    // ── Circle variant (Stitch AI / Airbnb style) ──
    circleContainer: {
        alignItems: 'center',
        marginRight: Spacing.lg,
        width: 68,
    },

    circleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },

    circleName: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.text.secondary,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ── Shared ─────────────────────────────────────
    pressed: {
        opacity: 0.7,
    },
});