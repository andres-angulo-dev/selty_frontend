import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Strings } from '@/shared/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator }  from './TabNavigator';
import { ProfessionalDetailScreen } from '@/features/professional/screens/ProfessionalDetailScreen';
import { OfferDetailScreen } from '@/features/offer/screens/OfferDetailScreen';
import { AnnonceDetailScreen } from '@/features/annonce/screens/AnnonceDetailScreen';
import { CommentsModal } from '@/features/annonce/screens/CommentsModal';
import { LocationMapScreen } from '@/features/map/screens/LocationMapScreen';
import { AnnonceFormScreen } from '@/features/add/screens/AnnonceFormScreen';
import { OfferFormScreen } from '@/features/add/screens/OfferFormScreen';
import { PublishSuccessScreen } from '@/features/add/screens/PublishSuccessScreen';
import { RequestFormScreen } from '@/features/request/screens/RequestFormScreen';
import { RequestDetailScreen } from '@/features/request/screens/RequestDetailScreen';
import { MyRequestsScreen } from '@/features/request/screens/MyRequestsScreen';
import { ServiceTradesScreen } from '@/features/serviceArea/screens/ServiceTradesScreen';
import { ServiceZonesScreen } from '@/features/serviceArea/screens/ServiceZonesScreen';
import { AddZoneScreen } from '@/features/serviceArea/screens/AddZoneScreen';

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
                    headerTitle: Strings.offer.headerTitle,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
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
                    headerTitle: 'Annonce',
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />

            <Stack.Screen
                name='LocationMap'
                component={LocationMapScreen}
                options={({ navigation, route }) => ({
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    headerShown: true,
                    headerTitle: route.params.title,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    // Modal: close with a cross, not a back chevron
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='close' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />

            {/* Add feature (professionals): above the tabs, so no tab bar on the forms */}
            {/* The forms draw their own header (FormHeader): centered title on iOS too */}
            <Stack.Screen name='AnnonceForm' component={AnnonceFormScreen} />
            <Stack.Screen name='OfferForm' component={OfferFormScreen} />
            <Stack.Screen name='RequestForm' component={RequestFormScreen} />
            <Stack.Screen name='AddZone' component={AddZoneScreen} />
            <Stack.Screen
                name='ServiceTrades'
                component={ServiceTradesScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: Strings.serviceArea.trades,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />
            <Stack.Screen
                name='ServiceZones'
                component={ServiceZonesScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: Strings.serviceArea.zones,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />
            <Stack.Screen
                name='MyRequests'
                component={MyRequestsScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: Strings.request.myRequests.title,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />
            <Stack.Screen
                name='RequestDetail'
                component={RequestDetailScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: Strings.request.detail.headerTitle,
                    headerTitleStyle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: Colors.neutral.background },
                    headerLeft: () => (
                        <Pressable onPress={() => navigation.goBack()} style={{ paddingRight: Spacing.sm }}>
                            <Ionicons name='chevron-back' size={BACK_ICON_SIZE} color={Colors.text.primary} />
                        </Pressable>
                    ),
                })}
            />
            <Stack.Screen name='PublishSuccess' component={PublishSuccessScreen} />

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