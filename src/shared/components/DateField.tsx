import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';

// ============================================
// DATE FIELD
// Labelled field showing a date (or a placeholder) that opens the native
// date picker. Controlled: the parent owns `value` (Date or null).
// - Android: the system dialog, opened imperatively (DateTimePickerAndroid)
// - iOS: the calendar opens in a white card above the form, closed with "OK"
//   (keeps the highlighted date) or a tap outside (keeps the field as it was).
//   Not inside the form: the native calendar imposes its own
//   size (bigger with enlarged text) and has no background of its own.
// Optional dates get a "clear" link to go back to null (e.g. no end date).
// ============================================

interface DateFieldProps {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder: string;                 // Shown when value is null ("Aujourd'hui", "Aucune")
    minimumDate?: Date;
    clearable?: boolean;                 // Shows the clear link when a date is set
    error?: string;
}

/** Formats a date in the app language: "30 nov. 2026" */
const formatDate = (date: Date) =>
    date.toLocaleDateString(Strings.locale, { day: 'numeric', month: 'short', year: 'numeric' });

export const DateField: React.FC<DateFieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    minimumDate,
    clearable = false,
    error,
}) => {
    // iOS only: whether the calendar card is open
    const [isIosPickerOpen, setIsIosPickerOpen] = useState(false);
    const closeIosPicker = () => setIsIosPickerOpen(false);

    // "OK" confirms the date the calendar highlights, even when no other day was tapped.
    // A tap outside only closes, so it stays the way to leave without choosing.
    const confirmIosPicker = () => {
        if (!value) onChange(initialPickerDate);
        closeIosPicker();
    };

    // Date shown when the picker opens: the current value, else the minimum, else today
    const initialPickerDate = value ?? minimumDate ?? new Date();

    const handlePress = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: initialPickerDate,
                mode: 'date',
                minimumDate,
                onValueChange: (_event, date) => onChange(date),
            });
            return;
        }
        setIsIosPickerOpen(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <Pressable
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${value ? formatDate(value) : placeholder}`}
                style={[styles.field, error && styles.fieldError]}
            >
                <Ionicons name="calendar-outline" size={18} color={Colors.text.secondary} />
                <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
                    {value ? formatDate(value) : placeholder}
                </Text>
            </Pressable>

            {clearable && value ? (
                <Pressable onPress={() => onChange(null)} accessibilityRole="button" hitSlop={Spacing.xs}>
                    <Text style={styles.clear}>{Strings.dateField.clear}</Text>
                </Pressable>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* iOS calendar card: every tap updates the value, "OK" or a tap outside closes it */}
            {Platform.OS === 'ios' ? (
                <Modal visible={isIosPickerOpen} transparent animationType="fade" onRequestClose={closeIosPicker}>
                    <View style={styles.backdrop}>
                        {/* Behind the card, so a tap on the calendar itself never closes it */}
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={closeIosPicker}
                            accessibilityRole="button"
                            accessibilityLabel={Strings.selectField.close}
                        />
                        <View style={styles.calendarCard}>
                            <Text style={styles.calendarTitle}>{label}</Text>
                            {/* The native calendar lays months side by side and does not clip them:
                                without this wrapper, the next month shows outside the card */}
                            <View style={styles.calendarClip}>
                                {/* Forced light: the card stays white, even on a phone in dark mode */}
                                <DateTimePicker
                                    value={initialPickerDate}
                                    mode="date"
                                    display="inline"
                                    themeVariant="light"
                                    locale={Strings.locale}
                                    minimumDate={minimumDate}
                                    accentColor={Colors.primary.main}
                                    onValueChange={(_event, date) => onChange(date)}
                                />
                            </View>
                            <Pressable onPress={confirmIosPicker} accessibilityRole="button" style={styles.doneButton}>
                                <Text style={styles.doneText}>{Strings.dateField.done}</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            ) : null}
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
    // Same look as FormInput: cream background, transparent border for the error state
    field: {
        flexDirection: 'row',
        alignItems: 'center',
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
    clear: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },
    // Dark layer over the form, the calendar card centered on it
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
        backgroundColor: Colors.overlay.darkScrim,
    },
    // No fixed width: the card wraps the native calendar, whose size cannot be set
    calendarCard: {
        maxWidth: '100%',
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    calendarClip: {
        overflow: 'hidden',
    },
    calendarTitle: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    doneButton: {
        alignSelf: 'flex-end',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    doneText: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        marginTop: Spacing.xs,
    },
});
