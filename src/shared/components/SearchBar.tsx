import React from 'react';
import { View, TextInput, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface SearchBarProps extends TextInputProps {
    onClear?: () => void;       // Callback when clear button is pressed
    onBackPress?: () => void;   // Callback when back arrow is pressed
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onClear,
    onBackPress,
    ...textInputProps
}) => {
    // Check if search is active (text entered)
    const isActive = value !== undefined && value?.length > 0;

    return (
        <View style={styles.container}>
            {/* Search icon (visible when inactive) / Back arrow (visible when active) */}
            {isActive ? (
                <Pressable onPress={onBackPress} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </Pressable>
            ) : (
                <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} style={styles.iconButton} />
            )}

            {/* Text input */}
            <TextInput style={styles.input} placeholderTextColor={Colors.text.tertiary} autoCapitalize='none' autoCorrect={false} returnKeyType='search' value={value} {...textInputProps} />
        
            {/* Clear button (visible when text is entered) */}
            {value && value.length > 0 && (
                <Pressable onPress={onClear} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
                    <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
        height: 48,
    },

    iconButton: {
        marginRight: Spacing.sm,
    },

    input: {
        ...Typography.caption,
        flex: 1,
        color: Colors.text.primary,
        paddingVertical: 0,             // Remove default padding on Android
    },

    clearButton: {
        marginLeft: Spacing.sm
    },

    pressed: {
        opacity: 0.6
    }
})