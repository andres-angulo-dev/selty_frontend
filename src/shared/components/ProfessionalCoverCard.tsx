import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, FontSize } from '@/shared/constants';
import { Professional } from '@/shared/types';

const CARD_WIDTH = 200;
const COVER_HEIGHT = 120;
const CERTIFIED_GREEN = '#27AE60';

interface ProfessionalCoverCardProps {
    professional: Professional;
    onPress: (professional: Professional) => void;
}

export const ProfessionalCoverCard: React.FC<ProfessionalCoverCardProps> = ({
    professional,
    onPress,
}) => {
    const coverSource = professional.coverImage ? { uri: professional.coverImage } : null;

    return (
        <Pressable
            onPress={() => onPress(professional)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            {/* Cover image / fallback — wrapper clips image to top rounded corners */}
            <View style={styles.coverWrapper}>
                {coverSource ? (
                    <ImageBackground source={coverSource} style={styles.cover}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color="#FFD700" />
                            <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                        </View>
                    </ImageBackground>
                ) : (
                    <View style={[styles.cover, styles.coverFallback]}>
                        <Ionicons name="person-outline" size={32} color={Colors.neutral.border} />
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={10} color="#FFD700" />
                            <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Name + profession */}
                <Text style={styles.name} numberOfLines={1}>
                    {professional.firstName} {professional.lastName}
                </Text>
                <Text style={styles.profession} numberOfLines={1}>
                    {professional.profession}
                </Text>

                {/* Certified + distance row */}
                <View style={styles.metaRow}>
                    {professional.isCertified && (
                        <View style={styles.certifiedBadge}>
                            <Ionicons name="checkmark-circle" size={11} color={CERTIFIED_GREEN} />
                            <Text style={styles.certifiedText}>Certifié</Text>
                        </View>
                    )}
                    {professional.distance && (
                        <Text style={styles.distance}>{professional.distance}</Text>
                    )}
                </View>

                {/* Starting price */}
                {professional.startingPrice !== undefined && (
                    <Text style={styles.price}>
                        À partir de {professional.startingPrice}€
                    </Text>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.lg,
        marginRight: Spacing.sm,
        // No overflow: 'hidden' here — it kills shadow on iOS
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.85,
    },

    // Clips image to top rounded corners without breaking card shadow
    coverWrapper: {
        width: CARD_WIDTH,
        height: COVER_HEIGHT,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        overflow: 'hidden',
    },

    cover: {
        width: CARD_WIDTH,
        height: COVER_HEIGHT,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: Spacing.xs,
    },

    coverFallback: {
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
    },

    ratingText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.neutral.white,
    },

    content: {
        padding: 10,
    },

    name: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 2,
    },

    profession: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
        flexWrap: 'wrap',
    },

    certifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#E8F8EF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },

    certifiedText: {
        fontSize: FontSize.xxs,
        fontWeight: '600',
        color: CERTIFIED_GREEN,
    },

    distance: {
        fontSize: 11,
        color: Colors.text.secondary,
    },

    price: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary.main,
    },
});
