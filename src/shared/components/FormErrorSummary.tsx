import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// FORM ERROR SUMMARY
// Shown above the submit button after a refused attempt. The field in error
// can be off-screen in a long form: without this message, pressing the button
// looks like it does nothing. It names the fields to fix, and disappears by
// itself once they are all valid.
// Announced by screen readers as soon as it appears (accessibilityLiveRegion
// on Android, accessibilityRole="alert" on iOS).
// Every text comes from the caller.
// ============================================

interface FormErrorSummaryProps {
    message: string;                 // "Corrigez ces champs pour continuer :"
    fieldLabels: string[];           // ["Titre", "Description"]
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ message, fieldLabels }) => {
    if (fieldLabels.length === 0) {
        return null;
    }

    return (
        <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={Colors.semantic.error} />
            <Text style={styles.text}>
                {message} <Text style={styles.fields}>{fieldLabels.join(', ')}</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.sm + Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.white,
    },
    text: {
        ...Typography.caption,
        color: Colors.semantic.error,
        flex: 1,
    },
    fields: {
        fontWeight: '700',
    },
});
