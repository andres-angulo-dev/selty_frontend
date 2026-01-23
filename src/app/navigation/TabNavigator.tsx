// Bottom tab bar with animation
import React from "react";                                                                                                        
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";  // Bottom tabs navigator 
import { Fontisto, Feather, Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';  // Expo vector icons                                                       
                                                                                                                                  
// Import all screens                                                                                                             
import { HomeScreen } from "@/features/home/screens/HomeScreen";                                                                  
import { SearchScreen } from "@/features/search/screens/SearchScreen";                                                            
import { FavoritesScreen } from "@/features/favorites/screens/FavoritesScreens";                                                  
import { MessagingScreen } from "@/features/messaging/screens/MessagingScreens";                                                  
import { ProfileScreen } from "@/features/profile/screens/ProfileScreens";                                                        
                                                                                                                                  
// Import shared components                                                        
import { Strings } from '@/shared/constants/strings';                                               
import { AnimatedTabBarButton } from '@/shared/components/AnimatedTabBarButton';                                                                                                                 
                                                                                                                                  
// Import Constants                                                                                                               
import { Colors } from '@/shared/constants';                                                                                      
const Tab = createBottomTabNavigator();                                                                                           

export const TabNavigator: React.FC = () => {                                                                                     

    return (                                                                                                                        
        <Tab.Navigator                                                                                                                
            screenOptions={({ route }) => ({                                                                                                            
                headerShown: false, // Disable a top container with title of menu                                                                                                       
                tabBarActiveTintColor: Colors.primary.main,                                                                               
                tabBarInactiveTintColor: Colors.text.tertiary,                                                                            
                tabBarStyle: { 
                  height: 60,
                  paddingBottom: 6,
                  paddingTop: 6,                                                                                                           
                  backgroundColor: Colors.neutral.white,                                                                                  
                  borderTopColor: Colors.neutral.border,                                                                                  
                  borderTopWidth: 1, // Top border                                                                                                       
                },                                                                                                                        
                tabBarButton: (props) => <AnimatedTabBarButton {...props} />,       
                tabBarIcon: ({ color, size, focused }) => {
                    const iconSize = size;
                    
                    switch (route.name) {
                        case Strings.tabs.home:
                            return <Ionicons name={focused ? "home-sharp" : "home-outline"} size={iconSize} color={color} />;
                        case Strings.tabs.search:
                            return  focused 
                                ? <AntDesign name="search" size={iconSize} color={color} /> 
                                : <Feather name="search" size={iconSize} color={color} />;
                        case Strings.tabs.favorites:
                            return <Fontisto name={focused ? "bookmark-alt" : "bookmark"} size={iconSize} color={color} />;
                        case Strings.tabs.messages:
                            return <MaterialCommunityIcons name={focused ? "message-reply" : "message-reply-outline"} size={iconSize} color={color} />;
                        case Strings.tabs.profile:
                            return <MaterialCommunityIcons name={focused ? "account-circle" : "account-circle-outline"} size={iconSize} color={color} />;
                    }
                }                                                        
            })}                                                                                                                          
        > 

            <Tab.Screen name={Strings.tabs.home} component={HomeScreen} />
            <Tab.Screen name={Strings.tabs.search} component={SearchScreen} />
            <Tab.Screen name={Strings.tabs.favorites} component={FavoritesScreen} />
            <Tab.Screen name={Strings.tabs.messages} component={MessagingScreen} />
            <Tab.Screen name={Strings.tabs.profile} component={ProfileScreen} />

        </Tab.Navigator>                                                                                                              
    );                                                                                                                              
};   




// // Simple bottom tab bar without no animation   
// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Bottom tabs navigator 
// import { Feather, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';  // Expo vector icons

// // Import all screens
// import { HomeScreen } from "@/features/home/screens/HomeScreen";
// import { SearchScreen } from "@/features/search/screens/SearchScreen";
// import { FavoritesScreen } from "@/features/favorites/screens/FavoritesScreens";
// import { MessagingScreen } from "@/features/messaging/screens/MessagingScreens";
// import { ProfileScreen } from "@/features/profile/screens/ProfileScreens";

// // Import Constants
// import { Colors } from '@/shared/constants';

// const Tab = createBottomTabNavigator();

// export const TabNavigator: React.FC = () => {
//     return (
//         <Tab.Navigator
//             screenOptions={{
//                 headerShown: false,
//                 tabBarActiveTintColor: Colors.primary.main,
//                 tabBarInactiveTintColor: Colors.text.tertiary,
//                 tabBarLabelPosition: "below-icon",
//                 tabBarStyle: {
//                     backgroundColor: Colors.neutral.white,
//                     borderTopColor: Colors.neutral.border,
//                     borderTopWidth: 1,
//                 },
//             }}    
//         >
//             <Tab.Screen
//                 name="Home"
//                 component={HomeScreen}
//                 options={{
//                     tabBarLabel: Strings.tabs.home,
//                     tabBarIcon: ({ color, size }) => (
//                         <Feather name="home" size={size} color={color} />
//                     ),
//                 }}
//             />

//             <Tab.Screen
//                 name="Search"
//                 component={SearchScreen}
//                 options={{
//                     tabBarLabel:  Strings.tabs.search,
//                     tabBarIcon: ({ color, size }) => (
//                         <Feather name="search" size={size} color={color} />
//                     ),
//                 }}
//             />

//             <Tab.Screen
//                 name="Favorites"
//                 component={FavoritesScreen}
//                 options={{
//                     tabBarLabel: Strings.tabs.favoris,
//                     tabBarIcon: ({ color, size }) => (
//                         // <Feather name="bookmark" color={color} size={size} /> // For users 
//                         <Ionicons name="add-circle-outline" color={color} size={size} /> // For professionals
//                     ),
//                 }}
//             />

//             <Tab.Screen
//                 name={Strings.tabs.favorites}
//                 component={MessagingScreen}
//                 options={{
//                     tabBarLabel: Strings.tabs.messages,
//                     tabBarIcon: ({ color, size }) => (
//                         <Feather name="message-circle" color={color} size={size} />
//                     ),
//                 }}
//             />

//             <Tab.Screen
//                 name="Profiles"
//                 component={ProfileScreen}
//                 options={{
//                     tabBarLabel: Strings.tabs.profile,
//                     tabBarIcon: ({ color, size }) => (
//                         <Octicons name="person" color={color} size={size} /> 
//                     )
//                 }}
//             />
            
//         </Tab.Navigator>
//     )
// }