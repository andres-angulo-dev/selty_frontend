import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { Colors, Spacing, Strings } from '@/shared/constants';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/button';

export const ChangePasswordScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

    // Form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // Error state
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // Validate form before saving (return true if valid, false is invalid)
    const validateForm = ():boolean => {
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword:'',
        };

        // Check if current password is empty
        if (!currentPassword.trim()) newErrors.currentPassword = Strings.validation.required;
        
        // Check if new password is empty or too short
        if (!newPassword.trim()) {
            newErrors.newPassword = Strings.validation.required;
        } else if (newPassword.length < 6) {
            newErrors.newPassword = Strings.validation.passwordMinLength;
        }

        // Check if confirm password matches
        if (!confirmNewPassword.trim()) {
            newErrors.confirmNewPassword = Strings.validation.required;
        } else if (confirmNewPassword !== newPassword) {
            newErrors.confirmNewPassword = Strings.validation.passwordMismatch;
        }

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !=='');
        return !hasErrors;
    }

    // Handle save
    const handleSave = () => {
        // Validate before saving
        if (!validateForm()) return;

        // Just log the data (backend will come later)
        console.log('Changing password...');

        Alert.alert(
            Strings.profile.alerts.passwordChanged.title,
            Strings.profile.alerts.passwordChanged.message,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Current password */}
                <FormInput label={Strings.profile.labels.currentPassword} value={currentPassword} onChangeText={setCurrentPassword} placeholder={Strings.profile.placeholders.currentPassword} secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.currentPassword} />

                {/* New password */}
                <FormInput label={Strings.profile.labels.newPassword} value={newPassword} onChangeText={setNewPassword} placeholder={Strings.profile.placeholders.newPassword} secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.newPassword} />
            
                {/* Confirm new password */}
                <FormInput label={Strings.profile.labels.confirmNewPassword} value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder={Strings.profile.placeholders.confirmNewPassword} secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.confirmNewPassword} />

                {/* Save button */}
                <View style={styles.buttonContainer}>
                    <Button label={Strings.buttons.edit} onPress={handleSave} variant='primary' size='large' fullWidth />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
    },

    form: {
        padding: Spacing.lg,
    },

    buttonContainer: {
        marginTop: Spacing.lg,
    }
})