import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface ProfileHeaderProps {
    userName: string;
    avatar: string | null;
    createdAt: Date;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userName,
    avatar,
    createdAt,
}) => {
    const memberSince = createdAt.toLocaleDateString('fr-FR', {
        month: 'long', 
        year: 'numeric',
    });

    // // Allows you to wrap a word that extends beyond the screen to a new line by creating an invisible space that is read by React
    // const makeEmailWrappable = (email: string) => {
    //   return email
    //     .replace(/@/g, '@\u200B')
    //     .replace(/\./g, '.\u200B')
    //     .replace(/-/g, '-\u200B')
    //     .replace(/_/g, '_\u200B');
    // };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                {/* Avatar or placeholder */}
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name='person' size={40} color={Colors.text.tertiary} />
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    {/* Username */}
                    <Text style={styles.userName}>{userName}</Text>

                    {/* Member since */}
                    <View>
                        <Text style={styles.memberSince}>Membre depuis:</Text>
                        <Text style={styles.memberSince}>{memberSince}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.xxxl,
    },

    subContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary.light,
        paddingVertical: 30,
        shadowOpacity: 1,
        shadowColor: 'grey',
    },

    avatarContainer: {
        marginHorizontal: '4%',
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },

    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.neutral.background,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    infoContainer:{
        flex: 1,
        maxWidth: '58%',
    },

    userName: {
        ...Typography.h2,
        color: Colors.neutral.white,
        marginBottom: Spacing.xs,
    },

    email: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },

    memberSince: {
        ...Typography.caption,
        color: Colors.neutral.white,
    },
})