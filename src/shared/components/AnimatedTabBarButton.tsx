// Animation of the icons in the navigation tab bar
import React, { useRef, useEffect } from 'react';                                                                                       
import { Pressable, Animated } from 'react-native'; 
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";      

// Scale values as constants for easy adjustment                                                                                  
const SCALE_ACTIVE = 1.15;    // Size when tab is selected                                                                        
const SCALE_INACTIVE = 1;     // Size when tab is not selected                                                                    
const SCALE_PRESSED = 0.85;   // Size when pressing down 

export const AnimatedTabBarButton: React.FC<BottomTabBarButtonProps> =  ({                                                                                               
  children,                                                                                                                       
  onPress,                                                                                                                        
  'aria-selected': isSelected,                                                                                                                    
}) => {                                                                                           
  const focused = isSelected ?? false;                                                                
  const scale = useRef(new Animated.Value(focused ? SCALE_ACTIVE : SCALE_INACTIVE)).current;  // Animated value for scale (starts at 1 = normal size)  
  
  // Animation between active and inactve when focused changes from true or false and and vice versa
  useEffect(() => {                                                                                       
    Animated.spring(scale, {                                                                                                      
      toValue: focused ? SCALE_ACTIVE : SCALE_INACTIVE,                                                                                                     
      useNativeDriver: true,                                                                                                      
      friction: 6, 
      tension: 120,                                                                                                               
    }).start();                                                                                                                   
  }, [focused]);   
  
  // Animation when pressing down
  const handlePressIn = () => {                                                                                      
    Animated.spring(scale, {                                                                                                      
      toValue: SCALE_PRESSED,                                                                                                               
      useNativeDriver: true,                                                                                                      
      friction: 6, 
      tension: 120,                                                                                                               
    }).start();                                                                                                                   
  };                                                                                                                    
  
  // Animation when the icon is already focused so when focused = true 
  const handlePress = (e: any) => {
    Animated.spring(scale, {
      toValue: SCALE_ACTIVE,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();

    onPress?.(e);
  }
                                                                                                                                  
  return (                                                                                                                        
    <Pressable   
      onPress={handlePress}                                                                                                           
      onPressIn={handlePressIn}                                                                                                   
      style={{ flex: 1 }}
    >                                                                                                                             
      <Animated.View 
        style={{ 
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale }] 
        }}
      >                                                                          
        {children}                                                                                                                
      </Animated.View>                                                                                                            
    </Pressable>                                                                                                                  
  );                                                                                                                              
};   
