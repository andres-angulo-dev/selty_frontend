import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/button';
import { MenuSection } from '@/shared/components/MenuSection';
import { mockUser } from '../data/mockUser';

export const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

    // Form state - initialized with current user data
    const [userName, setUserName] = useState(mockUser.userName);
    const [firstName, setFirstName] = useState(mockUser.firstName);
    const [lastName, setLastName] = useState(mockUser.lastName);
    const [email, setEmail] = useState(mockUser.email);
    const [phone, setPhone] = useState(mockUser.phone);
    const [editableFields, setEditableFields] = useState({ // Edit mode state for each field (all locked by default)
        userName: false,
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
    })
    const [errors, setErrors] = useState({ // Error state for each field 
        userName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    })

    // Toggle edit mode for a spécific field
    const toggleEdit = (field: keyof typeof editableFields) => {    // TypeScript restricts to existing keys ('firstName' | 'lastName' | ...)   
        setEditableFields(prev => ({                                // Function that receives previous state to compute the new one
            ...prev,                                                // Copies all existing properties  
            [field]: !prev[field],                                  // Inverts the boolean (false → true, true → false)
        }))
    }

    // Validate form before saving
    const validateForm = (): boolean => {
        const errorMessage = Strings.validation.required;
        
        const newErrors = {
            userName: !userName.trim() ? errorMessage : '',
            firstName: !firstName.trim() ? errorMessage : '',
            lastName: !lastName.trim() ? errorMessage : '',
            email: !email.trim() ? errorMessage : '',
            phone: !phone.trim() ? errorMessage : '',
        };

        setErrors(newErrors); // Update UI with errors (re-renders)  

        // Check if any error existe
        const hasErrors = Object.values(newErrors).some(error => error !== ''); // True if at least one error exists 
        return !hasErrors; // Invert: hasErrors=true → invalid (false)  
    }

    // Handle save
    const handleSave = () => {
        // Validate before saving
        if (!validateForm()) { // If validateForm return False, we exit the function
            return;
        }

        // No backend yet: the values are not persisted, we only confirm
        Alert.alert(
            Strings.profile.alerts.profileUpdated.title,
            Strings.profile.alerts.profileUpdated.message,
            [{ text: Strings.buttons.ok, onPress: () => navigation.goBack() }]
        )
    }

    // Delete account: irreversible, so a destructive confirmation comes first.
    // SECURITY / store rule: Apple requires in-app account deletion; the real
    // call (re-authentication + backend deletion) comes with the auth feature.
    const handleDeleteAccount = () => {
        Alert.alert(
            Strings.profile.alerts.deleteAccount.title,
            Strings.profile.alerts.deleteAccount.message,
            [
                { text: Strings.buttons.cancel, style: 'cancel' },
                { text: Strings.profile.alerts.deleteAccount.confirm, style: 'destructive', onPress: () => {} },
            ]
        );
    }

    return (
        // KeyboardAvoidingView pushes content up when keyboard opens so the save button stays visible
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
                <MenuSection title={Strings.profile.formSections.identity} cardStyle={styles.formCard}>
                    {/* Username */}
                    <FormInput label={Strings.profile.labels.userName} value={userName} onChangeText={setUserName} placeholder={Strings.profile.placeholders.userName} autoCapitalize='none' editable={editableFields.userName} showEditButton onEditPress={() => toggleEdit('userName')} error={errors.userName} />
                
                    {/* First name */}
                    <FormInput label={Strings.profile.labels.firstName} value={firstName} onChangeText={setFirstName} placeholder={Strings.profile.placeholders.firstName} autoCapitalize='words' editable={editableFields.firstName} showEditButton onEditPress={() => toggleEdit('firstName')} error={errors.firstName} />

                    {/* Last name */}
                    <FormInput label={Strings.profile.labels.lastName} value={lastName} onChangeText={setLastName} placeholder={Strings.profile.placeholders.lastName} autoCapitalize='words'  editable={editableFields.lastName} showEditButton onEditPress={() => toggleEdit('lastName')} error={errors.lastName} />

                </MenuSection>

                <MenuSection title={Strings.profile.formSections.contact} cardStyle={styles.formCard}>
                    {/* Email */}
                    <FormInput label={Strings.profile.labels.email} value={email} onChangeText={setEmail} placeholder={Strings.profile.placeholders.email} keyboardType='email-address' autoCorrect={false}  editable={editableFields.email} showEditButton onEditPress={() => toggleEdit('email')} error={errors.email} />

                    {/* Phone */}
                    <FormInput label={Strings.profile.labels.phone} value={phone} onChangeText={setPhone} placeholder={Strings.profile.placeholders.phone} keyboardType='phone-pad' editable={editableFields.phone} showEditButton onEditPress={() => toggleEdit('phone')} error={errors.phone} />

                </MenuSection>

                {/* Save button */}
                <View style={styles.buttonContainer}>
                    <Button label={Strings.buttons.save} onPress={handleSave} variant='primary' size="large" fullWidth />
                </View>

                {/* Delete account: discreet red text at the very bottom, away from Save */}
                <Pressable
                    onPress={handleDeleteAccount}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                    <Text style={styles.deleteText}>{Strings.profile.menu.deleteAccount}</Text>
                </Pressable>

        </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },

    content: {
        padding: Spacing.md + Spacing.xs,   // 20px, as on the profile tab
        paddingBottom: Spacing.xxl,
    },

    // Form cards need more room than menu rows
    // No bottom padding: the last FormInput already brings its 16px margin
    formCard: {
        padding: Spacing.md,
        paddingBottom: 0,
    },

    buttonContainer: {
        marginTop: Spacing.sm,
    },

    deleteButton: {
        alignSelf: 'center',
        marginTop: Spacing.xl,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    pressed: {
        opacity: 0.6,
    },
    deleteText: {
        ...Typography.bodyBold,
        color: Colors.semantic.error,
    },
})
