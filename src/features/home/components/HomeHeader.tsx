import React from 'react';
import { View, Text, StyleSheet ,Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface HomeHeaderProps {
    onNotificationPress: () => void;
    notificationCount?: number;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    onNotificationPress,
    notificationCount = 0,
}) => {
    return (
        <View style={styles.container}>
            {/* App logo / name */}
            <Text style={styles.logo}>Sialty</Text>

            {/* Notification bell */}
            <Pressable onPress={onNotificationPress} style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}>
                <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />

                {/* Badge with unread count */}
                {notificationCount > 0 && (
                    <View style={styles.badge}></View>
                )}
            </Pressable>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        width: '100%',
    },

    logo: {
        ...Typography.h2,
        color: Colors.primary.main,
        fontWeight: '700',
    },

    bellButton: {
        position: 'absolute',
        padding: Spacing.xs,
        right: 0,
        marginRight: Spacing.sm,
    },
    
    pressed: {
        opacity: 0.7,
    },

    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: Colors.semantic.error,
        borderRadius: 8,
        minWidth: 12,
        height: 12,
    },
})