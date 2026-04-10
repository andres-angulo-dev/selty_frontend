import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Strings, Spacing} from '@/shared/constants';

// Props type
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
    // Local State for favorite toggle
    const [favorite, setFavorite] = useState(isFavorite);

    // Open native phone app
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

    // Open native share sheet
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${Strings.professional.actions.shareMessage} ${firstName} ${lastName} (${profession}) ${Strings.professional.actions.shareOnSialty}`,
            });
        } catch (error) {
            // User cancelled or error occured - do nothing
        }
    };

    // Toggle favorite state
    const handleFavorite = () => {
        const newValue = !favorite;
        setFavorite(newValue);
        onFavoriteToggle(newValue);
    };

    return (
        <View style={styles.container}>
            {/* Call button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleCall}>
                <Ionicons name='call-outline' size={22} color={Colors.primary.main} />
                <Text style={styles.buttonText}>{Strings.professional.actions.call}</Text>
            </Pressable>

            {/* Message button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onMessagePress}>
                <Ionicons name="chatbubble-outline" size={22} color={Colors.primary.main} />
                <Text style={styles.buttonText}>{Strings.professional.actions.message}</Text>
            </Pressable>

            {/* Favorite button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleFavorite}>
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? Colors.semantic.error : Colors.primary.main } />
                <Text style={styles.buttonText}>{Strings.professional.actions.favorite}</Text>
            </Pressable>

            {/* Share button */}
            <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={handleShare}>
                <Ionicons name='share-outline' size={22} color={Colors.primary.main} />
                <Text style={styles.buttonText}>{Strings.professional.actions.share}</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },

    button: {
        alignItems: 'center',
        gap: 4,
    },

    pressed: {
        opacity: 0.7,
    },

    buttonText: {
        ...Typography.caption,
        color: Colors.primary.main,
    },
})