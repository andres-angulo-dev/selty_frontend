import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// SELECT FIELD
// Labelled field showing the chosen option ("Catégorie  Artisans  >").
// A tap opens a sheet with a search box and the list of options, so the
// list can grow (dozens of categories) without crowding the form.
// Controlled: the parent owns `value`. Every text comes from the caller.
// ============================================

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    options: SelectOption[];
    value: string;                   // '' when nothing is chosen
    onChange: (value: string) => void;
    onClose?: () => void;            // e.g. field.onBlur, to mark the field as touched
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;               // Shown when the search matches nothing
    closeLabel: string;
    error?: string;
}

/** Lower-case and strip accents, so "beaute" finds "Beauté". */
const normalize = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    options,
    value,
    onChange,
    onClose,
    placeholder,
    searchPlaceholder,
    emptyText,
    closeLabel,
    error,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selected = options.find((option) => option.value === value);

    // Filtered list, recomputed only when the options or the search change
    const visibleOptions = useMemo(() => {
        const search = normalize(query);
        return search ? options.filter((option) => normalize(option.label).includes(search)) : options;
    }, [options, query]);

    const close = () => {
        setIsOpen(false);
        setQuery('');
        onClose?.();
    };

    const choose = (optionValue: string) => {
        onChange(optionValue);
        close();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <Pressable
                onPress={() => setIsOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${selected?.label ?? placeholder}`}
                style={[styles.field, error && styles.fieldError]}
            >
                <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
                    {selected?.label ?? placeholder}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* iOS: card-style sheet that the user can also swipe down */}
            <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
                <View style={styles.sheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>{label}</Text>
                        <Pressable onPress={close} accessibilityRole="button" hitSlop={Spacing.sm}>
                            <Text style={styles.closeText}>{closeLabel}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color={Colors.text.tertiary} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={Colors.text.tertiary}
                            style={styles.searchInput}
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                    </View>

                    <FlatList
                        data={visibleOptions}
                        keyExtractor={(option) => option.value}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
                        renderItem={({ item }) => {
                            const isSelected = item.value === value;
                            return (
                                <Pressable
                                    onPress={() => choose(item.value)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: isSelected }}
                                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {item.label}
                                    </Text>
                                    {isSelected ? (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary.main} />
                                    ) : null}
                                </Pressable>
                            );
                        }}
                    />
                </View>
            </Modal>
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
    // Same look as FormInput / DateField
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
    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        marginTop: Spacing.xs,
    },

    sheet: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
        paddingHorizontal: Spacing.md + Spacing.xs,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
    },
    sheetTitle: {
        ...Typography.h3,
        color: Colors.primary.main,
    },
    closeText: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    searchInput: {
        ...Typography.body,
        flex: 1,
        paddingVertical: Spacing.md - Spacing.xs,
        color: Colors.text.primary,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    optionPressed: {
        backgroundColor: Colors.neutral.card,
    },
    optionText: {
        ...Typography.body,
        color: Colors.text.primary,
    },
    optionTextSelected: {
        fontWeight: '600',
        color: Colors.primary.main,
    },
    empty: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.xl,
    },
});
