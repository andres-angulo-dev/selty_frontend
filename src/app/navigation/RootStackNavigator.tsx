import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator }  from './TabNavigator';

// Create the root stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStaclNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            {/* Main tabs 'default screen */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* Modals - will be added here as we create them */}
            
        </Stack.Navigator>
    );
};