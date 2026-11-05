import React from 'react';
// Stack navigator for Profile feature   
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/app/navigation/types';
import { defaultStackScreenOptions } from '@/app/navigation/options';
import { Colors, Strings } from '@/shared/constants';

// Import screens
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// Sub-screens share the cream page background, so the header blends in
const creamHeader = { backgroundColor: Colors.neutral.surface };

export const ProfileStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={defaultStackScreenOptions}>
            {/* No native header: the screen draws its own large title (design).
                `title` still feeds the back button label of EditProfile / ChangePassword. */}
            <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: Strings.tabs.profile, headerShown: false }} />
            <Stack.Screen name='EditProfile' component={EditProfileScreen} options={{ headerTitle: Strings.profile.menu.personalInfo, headerStyle: creamHeader }} />
            <Stack.Screen name='ChangePassword' component={ChangePasswordScreen} options={{ headerTitle: Strings.profile.menu.passwordSecurity, headerStyle: creamHeader }} />
        </Stack.Navigator>
    )
}