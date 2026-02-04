import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { Colors, Spacing, Strings } from '@/shared/constants'
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/button';
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

        // Just log the data (backend will come later)
        console.log('Saving profile', { userName, firstName, lastName, email, phone });

        Alert.alert(
            Strings.profile.alerts.profileUpdated.title,
            Strings.profile.alerts.profileUpdated.message,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Username */}
                <FormInput label={Strings.profile.labels.userName} value={userName} onChangeText={setUserName} placeholder={Strings.profile.placeholders.userName} autoCapitalize='none' editable={editableFields.userName} showEditButton onEditPress={() => toggleEdit('userName')} error={errors.userName} />
                
                {/* First name */}
                <FormInput label={Strings.profile.labels.firstName} value={firstName} onChangeText={setFirstName} placeholder={Strings.profile.placeholders.firstName} autoCapitalize='words' editable={editableFields.firstName} showEditButton onEditPress={() => toggleEdit('firstName')} error={errors.firstName} />

                {/* Last name */}
                <FormInput label={Strings.profile.labels.lastName} value={lastName} onChangeText={setLastName} placeholder={Strings.profile.placeholders.lastName} autoCapitalize='words'  editable={editableFields.lastName} showEditButton onEditPress={() => toggleEdit('lastName')} error={errors.lastName} />

                {/* Email */}
                <FormInput label={Strings.profile.labels.email} value={email} onChangeText={setEmail} placeholder={Strings.profile.placeholders.email} keyboardType='email-address' autoCorrect={false}  editable={editableFields.email} showEditButton onEditPress={() => toggleEdit('email')} error={errors.email} />

                {/* Phone */}
                <FormInput label={Strings.profile.labels.phone} value={phone} onChangeText={setPhone} placeholder={Strings.profile.placeholders.phone} keyboardType='phone-pad' editable={editableFields.phone} showEditButton onEditPress={() => toggleEdit('phone')} error={errors.phone} />

                {/* Save button */}
                <View style={styles.buttonContainer}>
                    <Button label={Strings.buttons.save} onPress={handleSave} variant='primary' size="large" fullWidth />
                </View>
            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
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