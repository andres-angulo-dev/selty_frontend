import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/shared/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator }  from './TabNavigator';
import { ProfessionalDetailScreen } from '@/features/professional/screens/ProfessionalDetailScreen';
import { OfferDetailScreen } from '@/features/offer/screens/offerDetailScreen';
import { AnnonceDetailScreen } from '@/features/annonce/screens/AnnonceDetailScreen';
import { CommentsModal } from '@/features/annonce/screens/CommentsModal';

const BACK_ICON_SIZE = 22;

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
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    )
                })}
            />

            <Stack.Screen
                name='OfferDetail'
                component={OfferDetailScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    )
                })}
            />

            <Stack.Screen
                name='AnnonceDetail'
                component={AnnonceDetailScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    )
                })}
            />

            <Stack.Screen
                name='CommentsModal'
                component={CommentsModal}
                options={({ navigation }) => ({
                    presentation: 'modal', // The modal begins with a bottom to top animation (IOs)
                    animation: 'slide_from_bottom', // // The modal begins with a bottom to top animation (IOs)
                    headerShown: false,
                })}
            />
        </Stack.Navigator>
    );
};