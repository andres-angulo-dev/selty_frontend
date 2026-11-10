import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '@/stores/store';
import { RootStackNavigator } from '@/app/navigation/RootStackNavigator';
import { AccountTypeProvider } from '@/app/providers/AccountTypeProvider';
import { mockUser } from '@/features/profile/data/mockUser';

export default function App() {
  return (
    // Redux store (favorites today) available to every screen
    <Provider store={store}>
      {/* Account role shared by every screen. Seeded from the mock user until
          authentication provides the real role. */}
      <AccountTypeProvider initialAccountType={mockUser.accountType}>
        <NavigationContainer>
          <RootStackNavigator/>
        </NavigationContainer>
      </AccountTypeProvider>
    </Provider>
  );
}
