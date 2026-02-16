import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackNavigator } from '@/app/navigation/RootStackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootStackNavigator/>
    </NavigationContainer>
  );
}


