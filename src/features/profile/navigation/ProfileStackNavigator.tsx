import React from 'react';
// Stack navigator for Profile feature   
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { defaultStackScreenOptions } from '@/app/navigation/options';

// Import screens
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={defaultStackScreenOptions}>
            <Stack.Screen name='Profile' component={ProfileScreen} options={{ headerTitle: 'Profile' }} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} options={{ headerTitle: 'Modifier mon profil', headerTitleAlign: 'left' }} />
            <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} options={{ headerTitle: 'Mot de passe' }}/>
        </Stack.Navigator>
    )
}