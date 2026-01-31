import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface ProfileMenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;  // Icon name from Ionicons 
    label: string;                  // Menu text 
    onPress: () => void;            // Action when pressed
    isLast?: boolean;               // If true, no bottom border 
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
    icon, 
    label,
    onPress,
    isLast = false,
}) => {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.container, !isLast && styles.border, pressed && styles.pressed,]}>
            {/* Left side: icon + label */}   
            <View style={styles.left}>
                <Ionicons name={icon} size={22} color={Colors.text.secondary} />
                <Text style={styles.label}>{label}</Text>
            </View>

            {/* Right side: chevron arrow */} 
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.neutral.white,
    },

    border: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.border,
    },

    pressed: {
        backgroundColor: Colors.neutral.background, // Subtle feedback 
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    label: {
        ...Typography.body,
        color: Colors.text.primary,
        marginLeft: Spacing.md,
    },
})