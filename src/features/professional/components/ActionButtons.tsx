import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Strings, Spacing, BorderRadius } from '@/shared/constants';

type ActionButtonsProps = {
    phone: string | null;
    firstName: string;
    lastName: string;
    profession: string;
    isFavorite: boolean;
    onMessagePress: () => void;
    onFavoriteToggle: (newValue: boolean) => void;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    phone,
    firstName,
    lastName,
    profession,
    isFavorite,
    onMessagePress,
    onFavoriteToggle,
}) => {
    const [favorite, setFavorite] = useState(isFavorite);

    const handleCall = () => {
        if (!phone) {
            Alert.alert(
                Strings.professional.actions.noPhoneTitle,
                Strings.professional.actions.noPhoneMessage,
            );
            return;
        }
        Linking.openURL(`tel:${phone}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${Strings.professional.actions.shareMessage} ${firstName} ${lastName} (${profession}) ${Strings.professional.actions.shareOnSialty}`,
            });
        } catch (error) {
            // User cancelled or error occurred — do nothing
        }
    };

    const handleFavorite = () => {
        const newValue = !favorite;
        setFavorite(newValue);
        onFavoriteToggle(newValue);
    };

    return (
        <View style={styles.container}>
            {/* Call button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleCall}>
                <View style={styles.iconContainer}>
                    <Ionicons name='call-outline' size={22} color={Colors.primary.main} />
                </View>
                <Text style={styles.buttonText}>{Strings.professional.actions.call}</Text>
            </Pressable>

            {/* Message button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onMessagePress}>
                <View style={styles.iconContainer}>
                    <Ionicons name="chatbubble-outline" size={22} color={Colors.primary.main} />
                </View>
                <Text style={styles.buttonText}>{Strings.professional.actions.message}</Text>
            </Pressable>

            {/* Favorite button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleFavorite}>
                <View style={[styles.iconContainer, favorite && styles.iconContainerFavorite]}>
                    <Ionicons
                        name={favorite ? 'heart' : 'heart-outline'}
                        size={22}
                        color={favorite ? Colors.semantic.error : Colors.primary.main}
                    />
                </View>
                <Text style={styles.buttonText}>{Strings.professional.actions.favorite}</Text>
            </Pressable>

            {/* Share button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleShare}>
                <View style={styles.iconContainer}>
                    <Ionicons name='share-outline' size={22} color={Colors.primary.main} />
                </View>
                <Text style={styles.buttonText}>{Strings.professional.actions.share}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },

    button: {
        alignItems: 'center',
        gap: 6,
    },

    pressed: {
        opacity: 0.7,
    },

    // Gray rounded square container — matches the Stitch design
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Light red tint when favorited
    iconContainerFavorite: {
        backgroundColor: 'rgba(235,87,87,0.10)',
    },

    buttonText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
