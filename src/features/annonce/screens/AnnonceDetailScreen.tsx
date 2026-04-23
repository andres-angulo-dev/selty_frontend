import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Image, Share, Alert } from 'react-native';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { getAnnonceById } from '../data/mockAnnonces';
import { formatRelativeDate } from '@/shared/utils/formatDate';

type Props = NativeStackScreenProps<RootStackParamList, 'AnnonceDetail'>;

const CATEGORY_LABELS: Record<string, string> = {
    'cat-1': 'Artisans',
    'cat-2': 'Beauté',
    'cat-3': 'Juridique',
    'cat-4': 'Maison',
    'cat-5': 'Santé',
    'cat-6': 'Cours',
    'cat-7': 'Tech',
    'cat-8': 'Événements',
};

export const AnnonceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { annonceId } = route.params;
    const annonce = getAnnonceById(annonceId);

    // ── All hooks must be declared before any conditional return ──────────
    const [isLiked, setIsLiked] = useState(annonce?.isLiked ?? false);
    const [likesCount, setLikesCount] = useState(annonce?.likesCount ?? 0);

    const handleToggleLike = useCallback(() => {
        setIsLiked(prev => {
            setLikesCount(count => prev ? count - 1 : count + 1);
            return !prev;
        });
    }, []);

    const handleShare = useCallback(async () => {
        if (!annonce) return;
        await Share.share({
            message: `${annonce.title} — ${annonce.city}, ${annonce.department}`,
        });
    }, [annonce]);

    const handleMessagePress = useCallback(() => {
        Alert.alert('Messagerie', 'La messagerie sera disponible prochainement.');
    }, []);

    // Sync header heart with isLiked state — same action as the in-content like button
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 16, paddingLeft: Spacing.sm }}>
                    <Pressable onPress={handleToggleLike}>
                        <Ionicons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isLiked ? Colors.semantic.error : Colors.text.primary}
                        />
                    </Pressable>
                    <Pressable onPress={handleShare}>
                        <Ionicons name='share-social-outline' size={22} color={Colors.text.primary} />
                    </Pressable>
                </View>
            ),
        });
    }, [navigation, isLiked, handleToggleLike, handleShare]);

    // ── Guard — after hooks ────────────────────────────────────────────────
    if (!annonce) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.annonce.notFound}</Text>
            </View>
        );
    }

    const categoryLabel = CATEGORY_LABELS[annonce.categoryId] ?? null;
    const imageUrl = annonce.images[0] ?? null;

    // Stat items with icons derived from pricing fields
    const statItems: { icon: string; label: string }[] = [];
    if (annonce.isFree) statItems.push({ icon: 'gift-outline', label: 'Gratuit' });
    if (annonce.priceType === 'fixed') statItems.push({ icon: 'pricetag-outline', label: 'Prix fixe' });
    if (annonce.priceType === 'quote') statItems.push({ icon: 'document-text-outline', label: 'Devis gratuit' });

    const handleProfessionalPress = () => {
        if (annonce.professional) {
            navigation.navigate('ProfessionalDetail', { professionalId: annonce.professional.id });
        }
    };

    const handleCallPress = () => {
        if (annonce.professional?.phone) {
            Linking.openURL(`tel:${annonce.professional.phone}`);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero image with optional "Nouveau" badge */}
                <View style={styles.heroContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.heroImage, styles.heroPlaceholder]}>
                            <Ionicons name="image-outline" size={40} color={Colors.text.tertiary} />
                        </View>
                    )}
                    {annonce.isNew && (
                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>Nouveau</Text>
                        </View>
                    )}
                </View>

                {/* White content card overlapping the image bottom */}
                <View style={styles.contentCard}>
                    {/* Category pill */}
                    {categoryLabel && (
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{categoryLabel.toUpperCase()}</Text>
                        </View>
                    )}

                    {/* Title */}
                    <Text style={styles.title}>{annonce.title}</Text>

                    {/* Meta row: location • time — merged on one line */}
                    <View style={styles.metaRow}>
                        <Ionicons name='location-outline' size={14} color={Colors.text.tertiary} />
                        <Text style={styles.metaText}>{annonce.city}, {annonce.department}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Ionicons name='time-outline' size={14} color={Colors.text.tertiary} />
                        <Text style={styles.metaText}>{formatRelativeDate(annonce.createdAt, 'seconds')}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>{annonce.description}</Text>

                    {/* Price stat items with icons */}
                    {statItems.length > 0 && (
                        <View style={styles.statsRow}>
                            {statItems.map((item) => (
                                <View key={item.label} style={styles.statItem}>
                                    <Ionicons name={item.icon as any} size={18} color={Colors.primary.main} />
                                    <Text style={styles.statLabel}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Interactions */}
                    <View style={styles.interactionsRow}>
                        <Pressable
                            onPress={handleToggleLike}
                            style={({ pressed }) => [styles.interactionItem, pressed && styles.pressed]}
                        >
                            <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isLiked ? Colors.semantic.error : Colors.text.tertiary}
                            />
                            <Text style={styles.interactionText}>{Strings.annonce.likes(likesCount)}</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => navigation.navigate('CommentsModal', { annonceId: annonce.id })}
                            style={({ pressed }) => [styles.interactionItem, pressed && styles.pressed]}
                        >
                            <Ionicons name='chatbubbles-outline' size={16} color={Colors.text.tertiary} />
                            <Text style={styles.interactionText}>{Strings.annonce.comments(annonce.commentsCount)}</Text>
                        </Pressable>
                    </View>

                    <View style={styles.separator} />

                    {/* Professional card */}
                    {annonce.professional && (
                        <>
                            <Text style={styles.sectionTitle}>{Strings.annonce.professional}</Text>
                            <Pressable
                                onPress={handleProfessionalPress}
                                style={({ pressed }) => [styles.professionalCard, pressed && styles.pressed]}
                            >
                                <View style={styles.avatar}>
                                    <Ionicons name='person' size={20} color={Colors.text.tertiary} />
                                </View>
                                <View style={styles.professionalInfo}>
                                    <Text style={styles.professionalName}>
                                        {annonce.professional.firstName} {annonce.professional.lastName}
                                    </Text>
                                    <Text style={styles.profession}>{annonce.professional.profession}</Text>
                                </View>
                                <Ionicons name='chevron-forward' size={18} color={Colors.neutral.border} />
                            </Pressable>
                        </>
                    )}

                    {/* Location section with map placeholder */}
                    <Text style={styles.sectionTitle}>{Strings.annonce.location}</Text>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name='location' size={32} color={Colors.primary.main} />
                    </View>
                    <View style={styles.locationRow}>
                        <Ionicons name='location-outline' size={14} color={Colors.text.tertiary} />
                        <Text style={styles.locationText}>
                            {annonce.city} — {Strings.annonce.department} {annonce.department}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed CTA — anchored outside ScrollView at screen bottom */}
            {annonce.professional?.phone && (
                <View style={styles.ctaContainer}>
                    {/* Message button */}
                    <Pressable
                        onPress={handleMessagePress}
                        style={({ pressed }) => [styles.messageButton, pressed && styles.pressed]}
                    >
                        <Ionicons name='chatbubble-outline' size={22} color={Colors.primary.main} />
                    </Pressable>

                    {/* Primary call button */}
                    <Pressable
                        onPress={handleCallPress}
                        style={({ pressed }) => [styles.callButton, pressed && styles.callButtonPressed]}
                    >
                        <Ionicons name='call-outline' size={18} color={Colors.neutral.white} />
                        <Text style={styles.callButtonText}>
                            {Strings.annonce.call} {annonce.professional.firstName}
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F3F2',
    },

    errorContainer: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
    },

    // ── Hero image ────────────────────────────────────
    heroContainer: {
        position: 'relative',
    },

    heroImage: {
        width: '100%',
        height: 220,
    },

    heroPlaceholder: {
        backgroundColor: Colors.neutral.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    heroBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: Colors.semantic.success,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
    },

    heroBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.neutral.white,
        letterSpacing: 0.5,
    },

    // ── White card (content below image) ─────────────
    contentCard: {
        backgroundColor: Colors.neutral.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,         // Overlaps image bottom for smooth transition
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    categoryPill: {
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2F7',
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        marginBottom: Spacing.sm,
    },

    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary.main,
        letterSpacing: 0.8,
    },

    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: Spacing.md,
    },

    metaText: {
        ...Typography.bodySmall,
        color: Colors.text.tertiary,
    },

    metaDot: {
        color: Colors.text.tertiary,
        fontSize: 12,
        marginHorizontal: 2,
    },

    description: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 22,
        marginBottom: Spacing.md,
    },

    // ── Price stat items ──────────────────────────────
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },

    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: '#EEF2F7',
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm,
    },

    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary.main,
    },

    // ── Interactions ──────────────────────────────────
    interactionsRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.md,
    },

    interactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },

    interactionText: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },

    separator: {
        height: 1,
        backgroundColor: Colors.neutral.border,
        marginBottom: Spacing.md,
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },

    // ── Professional card ─────────────────────────────
    professionalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
        ...Colors.shadow.card,
    },

    pressed: {
        opacity: 0.7,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    professionalInfo: {
        flex: 1,
    },

    professionalName: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    profession: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },

    // ── Location / Map placeholder ────────────────────
    mapPlaceholder: {
        height: 140,
        backgroundColor: '#E8EDF2',
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },

    locationText: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },

    // ── Fixed CTA ─────────────────────────────────────
    ctaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.neutral.white,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
    },

    messageButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.neutral.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
    },

    callButtonPressed: {
        opacity: 0.8,
    },

    callButtonText: {
        ...Typography.label,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
});
