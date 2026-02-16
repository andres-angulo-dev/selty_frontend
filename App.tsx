import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStaclNavigator } from '@/app/navigation/RootStackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootStaclNavigator/>
    </NavigationContainer>
  );
}


