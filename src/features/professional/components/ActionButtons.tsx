import React from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Strings, Spacing, BorderRadius } from '@/shared/constants';
import { callPhone } from '@/shared/utils/callPhone';

type ActionButtonsProps = {
    phone: string | null;
    firstName: string;
    lastName: string;
    profession: string;
    isFavorite?: boolean;           // Saved by the current user (read from the favorites store by the screen)
    onMessagePress: () => void;
    onFavoritePress?: () => void;   // Save / unsave — the parent owns the state. Omit to hide the button (professional viewers)
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    phone,
    firstName,
    lastName,
    profession,
    isFavorite = false,
    onMessagePress,
    onFavoritePress,
}) => {

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${Strings.professional.actions.shareMessage} ${firstName} ${lastName} (${profession}) ${Strings.professional.actions.shareOnSialty}`,
            });
        } catch (error) {
            // User cancelled or error occurred — do nothing
        }
    };

    return (
        <View style={styles.container}>
            {/* Call button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={() => callPhone(phone)}>
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

            {/* Favorite button — hidden when the parent gives no handler (professional viewers) */}
            {onFavoritePress ? (
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                    onPress={onFavoritePress}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? Strings.favorites.remove : Strings.favorites.add}
                    accessibilityState={{ selected: isFavorite }}
                >
                    <View style={[styles.iconContainer, isFavorite && styles.iconContainerFavorite]}>
                        <Ionicons
                            name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                            size={22}
                            color={Colors.primary.main}
                        />
                    </View>
                    <Text style={styles.buttonText}>{Strings.professional.actions.favorite}</Text>
                </Pressable>
            ) : null}

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

    // Gray rounded square container — matches the design
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Light blue tint when saved
    iconContainerFavorite: {
        backgroundColor: Colors.primary.subtle,
    },

    buttonText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
