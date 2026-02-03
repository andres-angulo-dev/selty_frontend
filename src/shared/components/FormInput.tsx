// Avanced input
import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface FormInputProps extends TextInputProps {
    label: string;              // Label displayed above the input
    error?: string;             // Error message
    showEditButton?: boolean;   // Show edit button on the right
    onEditPress?: () => void;   // Callback when edit button is pressed
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    editable = true,
    showEditButton = false,
    onEditPress,
    ...textInputProps // All other TextInput props (value, onChangeText, placeholder ect...)
}) => {
    return (
        <View style={styles.container}>
            {/* Label */}
            <Text>{label}</Text>

            <View style={styles.inputRow}>
                {/* Input field */}
                <TextInput style={[ styles.input, !editable && styles.inputDisabled, error && styles.inputError ]} placeholderTextColor={Colors.text.tertiary} editable={editable} {...textInputProps} />

                {/* Edit Button */}
                {showEditButton && (
                    <Pressable onPress={onEditPress} style={({ pressed }) => [ styles.editButton, pressed && styles.editButtonPressed ]}>
                        <Ionicons name={editable ? "close" : "pencil"} size={20} color={Colors.primary.main} />
                    </Pressable>
                )}
            </View>

            {/* Error message */}
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },

    label: {
        ...Typography.BodyBold, 
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    input: {
        ...Typography.body,
        flex: 1, 
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        color: Colors.text.primary,
    },

    inputDisabled: {
        backgroundColor: Colors.neutral.background,
        color: Colors.text.secondary,
    },

    inputError: {
        borderColor: Colors.semantic.error,
    },

    editButton: {
        marginLeft: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: 8,
        backgroundColor: Colors.neutral.white,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    editButtonPressed: {
        opacity: 0.7,
    },

    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error, 
        marginTop: Spacing.xs,
    }
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