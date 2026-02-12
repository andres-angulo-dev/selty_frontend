import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Category } from '@/features/home/types';

interface CategoryCardProps {
    category: Category;
    onPress: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onPress,
}) => {
    return (
        <Pressable onPress={() => onPress(category)} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
            {/* Icon with colored background */}
            <View style={[styles.iconContainer, { backgroundColor: category.color || Colors.neutral.border }]}>
                <Ionicons name={category.icon as any} size={28} color={Colors.neutral.white} />
            </View>
            
            {/* Category name */}
            <Text style={styles.name} numberOfLines={1}>
                {category.name}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 80,
    },

    pressed: {
        opacity: 0.7,
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
    }
})