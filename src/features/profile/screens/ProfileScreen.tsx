import React from "react";
import Constants from "expo-constants";
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

// Navigation
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/app/navigation/types";

import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileSection } from "../components/ProfileSection";
import { ProfileInfoItem } from "../components/ProfileInfoItem";
import { ProfileMenuItem } from "../components/ProfileMenuItem";
import { Button } from "@/shared/components/button";

import { mockUser } from "../data/mockUser";


export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();   
    
    // Handlers for menu items (empty for now, will implement later)
    const handleNotifications = () => console.log('Notifications pressed');   
    const handleEditProfile = () => navigation.navigate('EditProfile');                                                                     
    const handleLanguage = () => console.log('Language pressed');                                                                               
    const handleTheme = () => console.log('Theme pressed');                                                                                     
    const handleHelp = () => console.log('Help pressed');                                                                                       
    const handleTerms = () => console.log('Terms pressed');                                                                                     
    const handlePrivacy = () => console.log('Privacy pressed');                                                                                 
    const handleContact = () => console.log('Contact pressed');                                                                                 
    const handleLogout = () => console.log('Logout pressed');                                                                                   
    const handleDeleteAccount = () => console.log('Delete account pressed');
    
    return (                                                                                                                        
        <ScrollView style={styles.container}>
            

            {/* Header with avatar, name, email */}
            <ProfileHeader
                userName={mockUser.userName}
                avatar={mockUser.avatar}
                createdAt={mockUser.createdAt}
            />

            {/* Personal information section */}
            <ProfileSection title='Informations Personnelles' paddingIsActive={false}>
                <ProfileInfoItem label="Nom" value={`${mockUser.firstName} ${mockUser.lastName}`} />
                <ProfileInfoItem label="Email" value={`${mockUser.email}`} />
                <ProfileInfoItem label="Téléphone" value={`${mockUser.phone}`} isLast/>

                <View style={{ padding: Spacing.md }}>
                    <Button label="Modifier le profil" onPress={handleEditProfile} variant="secondary" size="medium" />
                </View>
            </ProfileSection>

            {/* Settings section */}
            <ProfileSection title='Paramètres'>
                <ProfileMenuItem icon="notifications-outline" label="Notifications" onPress={handleNotifications} />
                <ProfileMenuItem icon="language-outline" label="Langue" onPress={handleLanguage} />
                <ProfileMenuItem icon="moon-outline" label="Thème" onPress={handleTheme} isLast/>
            </ProfileSection>

            {/* Support section */}
            <ProfileSection title="Support">
                <ProfileMenuItem icon="help-circle-outline" label="Centre d'aide" onPress={handleHelp} />
                <ProfileMenuItem icon="document-text-outline" label="Conditions d'utilisation" onPress={handleTerms} />
                <ProfileMenuItem icon="shield-checkmark-outline" label="Politique de confidentialité" onPress={handlePrivacy} />
                <ProfileMenuItem icon="mail-outline" label="Nous contacter" onPress={handleContact} isLast/>
            </ProfileSection>

            {/* Account Section - Buttons */}
            <ProfileSection title="Compte">
                <View style={styles.buttonContainer}>
                    <Button label="Déconnexion" onPress={handleLogout} variant="secondary" size="medium" />
                    {/* <Pressable onPress={handleLogout} style={({ pressed }) => [styles.button, styles.logoutButton, pressed && styles.buttonPressed]}>
                        <Text style={styles.logoutText}>Déconnexion</Text>
                    </Pressable> */}

                    <Button label="Supprimer mon compte" onPress={handleDeleteAccount} variant='danger' size="medium" />
                    {/* <Pressable onPress={handleDeleteAccount} style={({ pressed }) => [styles.button, styles.deleteButton, pressed && styles.buttonPressed]}>
                        <Text style={styles.deleteText}>Supprimer mon compte</Text>
                    </Pressable> */}
                </View>
            </ProfileSection>

            {/* Button spacing */}
            <View style={styles.bottomSpacer} />

            {/* App version */}
            <Text style={styles.version}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </ScrollView>                                                                                                                  
    );                                                                                                                              
  };                                                                                                                                
                                                                                                                                    
const styles = StyleSheet.create({                                                                                                
    container: {                                                                                                                    
        flex: 1,                                                                                                                                                                                                                 
        backgroundColor: Colors.neutral.background,                                                                                   
    },       

    buttonContainer: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    
    button: {
        paddingVertical: Spacing.md,
        borderRadius: 8, 
        alignItems: 'center',
        borderWidth: 1,
    },

    logoutButton: {
        backgroundColor: Colors.neutral.white,
    },

    deleteButton: {
        backgroundColor: Colors.neutral.white,
        borderColor: Colors.semantic.error,
    },

    buttonPressed: {
        opacity: 0.7,
    },

    logoutText: {
        ...Typography.bodyBold,
        color:  Colors.primary.main,
    },

    deleteText: {
        ...Typography.bodyBold, 
        color: Colors.semantic.error,
    },

    bottomSpacer: {
        height: Spacing.lg,
    },

    version: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        textAlign: 'center',
        paddingBottom: Spacing.md,
    }
});                                                                                                                               
             