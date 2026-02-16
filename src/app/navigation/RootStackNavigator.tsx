import React from 'react';
import { Colors, Strings } from '@/shared/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator }  from './TabNavigator';
import { ProfessionalDetailScreen } from '@/features/professional/screens/ProfessionalDetailScreen';

// Create the root stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            {/* Main tabs 'default screen */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* Modals */}
            <Stack.Screen 
                name="ProfessionalDetail" 
                component={ProfessionalDetailScreen} 
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerBackTitle: Strings.buttons.back,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                }}
            />
        </Stack.Navigator>
    );
};