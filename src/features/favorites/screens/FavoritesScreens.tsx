import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

export const FavoritesScreen: React.FC = () => {
    return (                                                                                                                        
        <View style={styles.container}>                                                                                               
            <Text style={styles.title}>Favoris</Text>                                                                                    
            <Text style={styles.subtitle}>Vos professionnels sauvegardés</Text>                                                                     
        </View>                                                                                                                       
    );                                                                                                                              
  };                                                                                                                                
                                                                                                                                    
const styles = StyleSheet.create({                                                                                                
    container: {                                                                                                                    
        flex: 1,                                                                                                                      
        justifyContent: 'center',                                                                                                     
        alignItems: 'center',                                                                                                         
        backgroundColor: Colors.neutral.background,                                                                                   
    },       

    title: {                                                                                                                        
        ...Typography.h2,                                                                                                             
        color: Colors.text.primary,                                                                                                   
    },     

    subtitle: {                                                                                                                     
        ...Typography.body,                                                                                                           
        color: Colors.text.secondary,                                                                                                 
        marginTop: Spacing.sm,                                                                                                        
    },                                                                                                                              
});                                                                                                                               
             