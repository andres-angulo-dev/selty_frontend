import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/shared/constants';
import { Annonce } from '@/shared/types';

interface AnnonceListCardProps {
    annonce: Annonce;
    onPress: (annonce: Annonce) => void;
}

// Horizontal card used in ProfessionalDetailScreen's annonce tab.
// Compact layout: thumbnail left, title + location right, chevron.
export const AnnonceListCard: React.FC<AnnonceListCardProps> = ({ annonce, onPress }) => {
    const imageUrl = annonce.images[0] ?? null;

    return (
        <Pressable
            onPress={() => onPress(annonce)}
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        >
            {/* Thumbnail */}
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={24} color={Colors.text.tertiary} />
                </View>
            )}

            {/* Text content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{annonce.title}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.text.tertiary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {annonce.city}, {annonce.department}
                    </Text>
                </View>
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={18} color={Colors.neutral.border} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        padding: Spacing.sm,
        gap: Spacing.sm,
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.75,
    },

    image: {
        width: 96,
        height: 72,
        borderRadius: BorderRadius.lg,
    },

    imagePlaceholder: {
        backgroundColor: Colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    content: {
        flex: 1,
        gap: 6,
    },

    title: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text.primary,
        lineHeight: 18,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },

    locationText: {
        fontSize: 11,
        color: Colors.text.tertiary,
        flexShrink: 1,
    },
});
