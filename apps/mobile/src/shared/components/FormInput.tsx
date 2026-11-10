// Avanced input
import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

interface FormInputProps extends TextInputProps {
    label: string;              // Label displayed above the input
    error?: string;             // Error message
    showEditButton?: boolean;   // Show edit button on the right
    onEditPress?: () => void;   // Callback when edit button is pressed
    hint?: string;              // Helper text under the field (hidden while an error shows)
    showCounter?: boolean;      // "24/80" under the field; needs `maxLength`
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    editable = true,
    showEditButton = false,
    onEditPress,
    hint,
    showCounter = false,
    ...textInputProps // All other TextInput props (value, onChangeText, placeholder ect...)
}) => {
    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputRow}>
                {/* Input field */}
                <TextInput style={[ styles.input, textInputProps.multiline && styles.inputMultiline, !editable && styles.inputDisabled, error && styles.inputError ]} placeholderTextColor={Colors.text.tertiary} editable={editable} {...textInputProps} />

                {/* Edit Button */}
                {showEditButton && (
                    <Pressable onPress={onEditPress} style={({ pressed }) => [ styles.editButton, pressed && styles.editButtonPressed ]}>
                        <Ionicons name={editable ? "close" : "pencil"} size={20} color={Colors.primary.main} />
                    </Pressable>
                )}
            </View>

            {/* Footer: error (or hint) on the left, character counter on the right */}
            {error || hint || (showCounter && textInputProps.maxLength) ? (
                <View style={styles.footer}>
                    <Text style={error ? styles.errorText : styles.hintText}>{error ?? hint ?? ''}</Text>
                    {showCounter && textInputProps.maxLength ? (
                        <Text style={styles.counter}>
                            {(textInputProps.value ?? '').length}/{textInputProps.maxLength}
                        </Text>
                    ) : null}
                </View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },

    label: {
        ...Typography.label,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    input: {
        ...Typography.body,
        flex: 1, 
        backgroundColor: Colors.neutral.surface,
        // Transparent border at rest: the error state colours it without
        // shifting the layout by one pixel
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md - Spacing.xs,   // 12px
        color: Colors.text.primary,
    },

    // Description-like field: several lines, text starts at the top
    inputMultiline: {
        minHeight: 110,
        textAlignVertical: 'top',
    },

    // Locked field: same cream background, muted text
    inputDisabled: {
        color: Colors.text.secondary,
    },

    inputError: {
        borderColor: Colors.semantic.error,
    },

    editButton: {
        marginLeft: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.surface,
    },

    editButtonPressed: {
        opacity: 0.7,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },

    // flex: 1 keeps the counter on the right even with a long message
    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
        flex: 1,
    },

    hintText: {
        ...Typography.caption,
        color: Colors.text.secondary,
        flex: 1,
    },

    counter: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },
})


// // Simple input
// import React from "react";
// import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
// import { Colors, Typography, Spacing } from '@/shared/constants';

// interface FormInputProps extends TextInputProps {
//     label: string;  // Label displayed above the input
//     error?: string; // Error message
// }

// export const FormInput: React.FC<FormInputProps> = ({
//     label,
//     error,
//     ...textInputProps // All other TextInput props (value, onChangeText, placeholder ect...)
// }) => {
//     return (
//         <View>
//             {/* Label */}
//             <Text>{label}</Text>

//             {/* Input field */}
//             <TextInput style={[ styles.input, error && styles.inputError ]} placeholderTextColor={Colors.text.tertiary} {...textInputProps} />
//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     container: {
//         marginBottom: Spacing.md,
//     },

//     label: {
//         ...Typography.BodyBold,
//         color: Colors.text.primary,
//         marginBottom: Spacing.xs,
//     },

//     input: {
//         ...Typography.body,
//         backgroundColor: Colors.neutral.white,
//         borderWidth: 1,
//         borderColor: Colors.neutral.border,
//         borderRadius: 8,
//         paddingHorizontal: Spacing.md,
//         paddingVertical: Spacing.sm,
//         color: Colors.text.primary,
//     },

//     inputError: {
//         borderColor: Colors.semantic.error,
//     },

//     errorText: {
//         ...Typography.caption,
//         color: Colors.semantic.error,
//         marginTop: Spacing.xs,
//     }
// })
