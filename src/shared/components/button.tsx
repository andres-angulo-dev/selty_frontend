import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

// Available button variants 
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

// Available button sizes 
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    label: string,
    onPress: () => void,
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    disable?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disable = false,
    loading = false,
}) => {
    // Determine if button is interactive  
    const isDisabled = disable || loading;

    // Get styles based on variant
    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primary;
            case 'secondary':
                return styles.secondary;
            case 'danger':
                return styles.danger;
            case 'ghost':
                return styles.ghost;
        }
    }

    // Get text styles based on variant
    const getVariantTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryLabel;
            case 'secondary':
                return styles.secondaryLabel;
            case 'danger':
                return styles.dangerLabel;
            case 'ghost':
                return styles.ghostLabel;            
        }
    }

    // Get styles size based on size
    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.small;
            case 'medium':
                return styles.medium;
            case 'large':
                return styles.large;    
        }
    }

    // Get text size based on size
    const getSizeTextSize = () => {
        switch (size) {
            case 'small':
                return styles.smallLabel;
            case 'medium':
                return styles.mediumLabel;
            case 'large':
                return styles.largeLabel;    
        }
    }

    // Get spinner color based on variant
    const getSpinnerColor = () => {
        return variant === 'primary' ? Colors.neutral.white : Colors.primary.main;
    }

    return(
        <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [styles.base, getVariantStyle(), getSizeStyle(), fullWidth && styles.fullWidth, isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed,]}>
            {loading ? (
                // Show spinner when loading
                <ActivityIndicator size='small' color={getSpinnerColor()} />
            ) : (
                <Text style={[styles.labelBase, getVariantTextStyle(), getSizeTextSize(), isDisabled && styles.disabledLabel,]}>
                    {label}
                </Text>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    // Base container style             
    base: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Variant styles - containers   
    primary: {
        backgroundColor: Colors.primary.main,
        borderWidth: 0,
    },

    secondary: {
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.primary.main,
    },

    danger: {
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.semantic.error,
    },

    ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },

    // Size styles - containers  
    small: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        minHeight: 32,
    },

    medium: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
    },

    large: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        minHeight: 52,
    },

    // Full width  
    fullWidth: {
        width: '100%',
    },

    // Disabled state
    disabled: {
        opacity: 0.5,
    },

    // Pressed state 
    pressed: {
        opacity: 0.8,
    },

    // Base label style  
    labelBase: {
        ...Typography.bodyBold,
    },

    // Variant styles - labels 
    primaryLabel: {
        color: Colors.neutral.white,
    },

    secondaryLabel: {
        color: Colors.primary.main,
    },

    dangerLabel: {
        color: Colors.semantic.error,
    },

    ghostLabel: {
        color: Colors.primary.main
    },

    // Size styles - labels      
    smallLabel: {
        fontSize: 14,
    },

    mediumLabel: {
        fontSize: 16,
    },

    largeLabel: {
        fontSize: 18,
    },

    // Disabled label   
    disabledLabel: {
        opacity: 0.7,
    }
})