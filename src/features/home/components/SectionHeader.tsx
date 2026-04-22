import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface SectionHeaderProps {
    title: string;
    onSeeAllPress?: () => void;
    containerStyle?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    onSeeAllPress,
    containerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {/* Section Title */}
            <Text style={styles.title}>{title}</Text>

            {/* "See All" button - only visible if callback is provided */}
            {onSeeAllPress && (
                <Pressable onPress={onSeeAllPress} style={({ pressed }) => [pressed && styles.pressed]}>
                    <Text style={styles.seeAll}>→</Text>
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        width: '100%',
    },

    title: {
        ...Typography.body,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    seeAll: {
        ...Typography.body,
        color: Colors.primary.main,
        fontWeight: '400',
        fontSize: 18,
    },

    pressed: {
        opacity: 0.6,
    },
})