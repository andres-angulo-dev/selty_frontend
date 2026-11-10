import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';
import type { SelectOption } from './SelectField';

// ============================================
// DROPDOWN FIELD
// Labelled field whose list opens right UNDER it, inside the page (it pushes
// the content below). For short lists; a long one, or one that needs a search,
// should use SelectField (sheet with a search box).
// Long lists scroll inside a limited height (Paris has 21 postal codes).
// Controlled: the parent owns `value`. Every text comes from the caller.
// ============================================

interface DropdownFieldProps {
    label: string;
    options: SelectOption[];
    value: string;                   // '' when nothing is chosen
    onChange: (value: string) => void;
    placeholder: string;
    defaultOpen?: boolean;           // Open at once when the field appears because a choice is needed
    error?: string;
}

const LIST_MAX_HEIGHT = 220;

export const DropdownField: React.FC<DropdownFieldProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    defaultOpen = false,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const selected = options.find((option) => option.value === value);

    const choose = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <Pressable
                onPress={() => setIsOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${selected?.label ?? placeholder}`}
                accessibilityState={{ expanded: isOpen }}
                style={[styles.field, error ? styles.fieldError : null]}
            >
                <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
                    {selected?.label ?? placeholder}
                </Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text.tertiary} />
            </Pressable>

            {isOpen ? (
                <View style={styles.list}>
                    {/* Nested in the form's ScrollView: needs its own scrolling + taps kept with the keyboard open */}
                    <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator
                    >
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => choose(option.value)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {option.label}
                                    </Text>
                                    {isSelected ? (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary.main} />
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.label,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    // Same look as FormInput / SelectField
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md - Spacing.xs,
    },
    fieldError: {
        borderColor: Colors.semantic.error,
    },
    value: {
        ...Typography.body,
        color: Colors.text.primary,
        flexShrink: 1,
    },
    placeholder: {
        color: Colors.text.tertiary,
    },
    list: {
        maxHeight: LIST_MAX_HEIGHT,
        marginTop: Spacing.xs,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
        backgroundColor: Colors.neutral.card,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        minHeight: 44,                   // Apple's minimum touch target
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    pressed: {
        backgroundColor: Colors.neutral.inputBg,
    },
    optionText: {
        ...Typography.body,
        color: Colors.text.primary,
        flexShrink: 1,
    },
    optionTextSelected: {
        fontWeight: '600',
        color: Colors.primary.main,
    },
    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        marginTop: Spacing.xs,
    },
});
