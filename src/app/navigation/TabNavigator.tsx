// Bottom tab bar with animation
import React from "react";                                                                                                        
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";  // Bottom tabs navigator 
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';  // Expo vector icons                                                       
                                                                                                                                  
// Import all screens                                                                                                             
import { HomeScreen } from "@/features/home/screens/HomeScreen";                                                                  
import { FavoritesScreen } from "@/features/favorite/screens/FavoritesScreen";                                                  
import { MessagingScreen } from "@/features/messaging/screens/MessagingScreens";                                                  
import { ProfileStackNavigator } from "@/features/profile/navigation/ProfileStackNavigator";
import { AddScreen } from "@/features/add/screens/AddScreen";
import { NewRequestScreen } from "@/features/request/screens/NewRequestScreen";
import { MyPublicationsScreen } from "@/features/publication/screens/MyPublicationsScreen";
                                                                                                                                  
// Import shared components                                                        
import { Strings } from '@/shared/constants/strings';                                               
import { AnimatedTabBarButton } from '@/shared/components/AnimatedTabBarButton';
import { RaisedTabBarButton } from '@/shared/components/RaisedTabBarButton';
import { useAccountType } from '@/app/providers/AccountTypeProvider';                                                                                                                 
                                                                                                                                  
// Import Constants                                                                                                               
import { Colors, Typography } from '@/shared/constants';
import { RootTabParamList, RootStackParamList } from '@/app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
const Tab = createBottomTabNavigator<RootTabParamList>();

// Shared by the bar and the ring of the raised "Publier" circle, so the ring melts into the bar
const TAB_BAR_BACKGROUND = Colors.neutral.white;                                                                                           

export const TabNavigator: React.FC = () => {
    // Same 5-slot bar for both roles, the content depends on the role:
    // - slot 2: Favorites (individual) / MyPublications (pro)
    // - slot 3 "Publier": new request (individual) / annonce or offer choice (pro)
    const { isProfessional } = useAccountType();

    return (                                                                                                                        
        <Tab.Navigator                                                                                                                
            screenOptions={({ route }) => ({                                                                                                            
                headerShown: false, // Disable a top container with title of menu                                                                                                       
                tabBarActiveTintColor: Colors.primary.main,                                                                               
                tabBarInactiveTintColor: Colors.text.tertiary,                                                                            
                tabBarStyle: { 
                  height: 84,
                //   paddingBottom: 6,
                //   paddingTop: 6,                                                                                                           
                  backgroundColor: TAB_BAR_BACKGROUND,                                                                                  
                  borderTopColor: Colors.neutral.border,                                                                                  
                  borderTopWidth: 1, // Top border                                                                                                       
                },                                                                                                                        
                tabBarButton: (props) => <AnimatedTabBarButton {...props} />,       
                tabBarIcon: ({ color, size, focused }) => {
                    const iconSize = size;

                    // Route names are English identifiers — labels (French) are set via tabBarLabel in each Tab.Screen
                    switch (route.name) {
                        case 'Home':
                            return <Ionicons name={focused ? "home-sharp" : "home-outline"} size={iconSize} color={color} />;
                        case 'Add':
                            return null; // Drawn by RaisedTabBarButton itself
                        case 'Favorites':
                            return <Fontisto name={focused ? "bookmark-alt" : "bookmark"} size={iconSize} color={color} />;
                        case 'MyPublications':
                            return <Ionicons name={focused ? "albums" : "albums-outline"} size={iconSize} color={color} />;
                        case 'Messages':
                            return <MaterialCommunityIcons name={focused ? "message-reply" : "message-reply-outline"} size={iconSize} color={color} />;
                        case 'Profile':
                            return <MaterialCommunityIcons name={focused ? "account-circle" : "account-circle-outline"} size={iconSize} color={color} />;
                    }
                }
            })}
        >

            {/* Route name = English identifier, tabBarLabel = French display label */}
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: Strings.tabs.home }} />
            {/* Slot 2 depends on the role. When the displayed tab disappears (role
                switch), React Navigation focuses the last visited tab that still exists. */}
            {isProfessional ? (
                <Tab.Screen name="MyPublications" component={MyPublicationsScreen} options={{ tabBarLabel: Strings.tabs.myPublications }} />
            ) : (
                <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: Strings.tabs.favorites }} />
            )}

            {/* Central "Publier" for both roles, content chosen by role.
                Hiding an entry point is not a security measure: the backend must
                still refuse annonces/offers from non-professional accounts. */}
            <Tab.Screen
                name="Add"
                component={isProfessional ? AddScreen : NewRequestScreen}
                // Individual: one kind of publication only, so the tab opens the request
                // form right away (full screen, tab bar hidden) instead of a choice screen
                listeners={({ navigation }) => ({
                    tabPress: (event) => {
                        if (!isProfessional) {
                            event.preventDefault();
                            navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('RequestForm');
                        }
                    },
                })}
                options={{
                    tabBarLabel: Strings.tabs.add,
                    tabBarButton: (props) => (
                        <RaisedTabBarButton
                            {...props}
                            icon="add"
                            label={Strings.tabs.add}
                            ringColor={TAB_BAR_BACKGROUND}
                        />
                    ),
                }}
            />

            <Tab.Screen name="Messages" component={MessagingScreen} options={{ tabBarLabel: Strings.tabs.messages, headerShown: true, headerTitle: Strings.tabs.messages, headerStyle: {backgroundColor: Colors.neutral.background}, headerTitleAlign: 'left', headerTitleStyle: {...Typography.h3, color: Colors.text.primary}}}/>
            <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarLabel: Strings.tabs.profile }} />

        </Tab.Navigator>                                                                                                              
    );                                                                                                                              
};
