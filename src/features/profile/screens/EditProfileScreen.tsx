import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/shared/constants'

export const EditProfileScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Edit Profile Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.neutral.background,
    },

    text: {
        ...Typography.h2,
        color: Colors.text.primary,
    }
})