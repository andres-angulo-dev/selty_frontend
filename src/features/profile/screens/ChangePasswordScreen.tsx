import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { Colors, Spacing } from '@/shared/constants';
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
        if (!currentPassword.trim()) newErrors.currentPassword = 'Ce champs est obligatoire';
        
        // Check if new password is empty or too short
        if (!newPassword.trim()) {
            newErrors.newPassword = 'Ce champ est obligatoire';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Le mot de passe doit contenur au moins 6 caractères';
        }

        // Check if confirm password matches
        if (!confirmNewPassword.trim()) {
            newErrors.confirmNewPassword = 'Ce champ est obligatoire';
        } else if (confirmNewPassword !== newPassword) {
            newErrors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
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
            'Mot de passe modifié',
            'Votre mot de passe a été mis à jour avec succès.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Current password */}
                <FormInput label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} placeholder='Votre mot de passe actuel' secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.currentPassword} />

                {/* New password */}
                <FormInput label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} placeholder='Entrez votre nouveau mot de passe' secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.newPassword} />
            
                {/* Confirm new password */}
                <FormInput label="Confirmer le mot de passe" value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder='Confirmez votre nouveau mot de passe' secureTextEntry autoCapitalize='none' autoCorrect={false} error={errors.confirmNewPassword} />

                {/* Save button */}
                <View style={styles.buttonContainer}>
                    <Button label='Modifier' onPress={handleSave} variant='primary' size='large' fullWidth />
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