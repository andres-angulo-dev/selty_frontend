import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// CHIP SELECTOR
// Row of pill chips that wraps on several lines.
// - single mode: exactly one value (price type)
// - multiple mode: several values, optionally capped by `max` (offer
//   conditions, 3 max). Once the cap is reached the other chips are disabled.
// Generic over the value type, so `T` can be a string union
// ('fixed' | 'quote' | 'free') and TypeScript checks every value.
// ============================================

export interface ChipOption<T extends string> {
    value: T;
    label: string;
}

interface ChipSelectorProps<T extends string> {
    options: ChipOption<T>[];
    selected: T[];                       // Always an array, even in single mode
    onChange: (selected: T[]) => void;
    multiple?: boolean;                  // Default false
    max?: number;                        // Only used in multiple mode
    error?: string;
}

export function ChipSelector<T extends string>({
    options,
    selected,
    onChange,
    multiple = false,
    max,
    error,
}: ChipSelectorProps<T>) {
    const isFull = multiple && max !== undefined && selected.length >= max;

    /** Toggles a chip and returns a new array (the previous one is never mutated). */
    const handlePress = (value: T) => {
        const isSelected = selected.includes(value);

        if (!multiple) {
            onChange([value]);
            return;
        }
        if (isSelected) {
            onChange(selected.filter((v) => v !== value));
            return;
        }
        if (!isFull) {
            onChange([...selected, value]);
        }
    };

    return (
        <View>
            <View style={styles.row}>
                {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    const isDisabled = !isSelected && isFull;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => handlePress(option.value)}
                            disabled={isDisabled}
                            // Radio for a single choice, checkbox for several
                            accessibilityRole={multiple ? 'checkbox' : 'radio'}
                            accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                            style={({ pressed }) => [
                                styles.chip,
                                isSelected && styles.chipSelected,
                                isDisabled && styles.chipDisabled,
                                pressed && styles.pressed,
                            ]}
                        >
                            {isSelected ? (
                                <Ionicons name="checkmark" size={14} color={Colors.text.inverse} />
                            ) : null}
                            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
                        </Pressable>
                    );
                })}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.neutral.surface,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    chipSelected: {
        backgroundColor: Colors.primary.main,
    },
    chipDisabled: {
        opacity: 0.4,
    },
    pressed: {
        opacity: 0.8,
    },
    label: {
        ...Typography.bodySmall,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    labelSelected: {
        color: Colors.text.inverse,
    },
    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        marginTop: Spacing.sm,
    },
});
