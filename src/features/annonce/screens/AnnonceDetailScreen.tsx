import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Image, Share, Alert } from 'react-native';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { getAnnonceById } from '../data/mockAnnonces';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { ProfessionalRowCard } from '@/shared/components/ProfessionalRowCard';
import { MapPlaceholder } from '@/shared/components/MapPlaceholder';
import { DetailCtaBar } from '@/shared/components/DetailCtaBar';

type Props = NativeStackScreenProps<RootStackParamList, 'AnnonceDetail'>;

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
        Alert.alert(Strings.messaging.comingSoonTitle, Strings.messaging.comingSoonMessage);
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

    const categoryLabel = annonce.category?.name ?? null;
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

    // Open the native phone dialer, or explain why we can't
    const handleCallPress = () => {
        if (annonce.professional?.phone) {
            Linking.openURL(`tel:${annonce.professional.phone}`);
            return;
        }
        Alert.alert(Strings.professional.actions.noPhoneTitle, Strings.professional.actions.noPhoneMessage);
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

                    {/* Professional card (shared component) */}
                    {annonce.professional && (
                        <>
                            <Text style={styles.sectionTitle}>{Strings.annonce.professional}</Text>
                            <ProfessionalRowCard
                                name={`${annonce.professional.firstName} ${annonce.professional.lastName}`}
                                subtitle={`${annonce.professional.profession} · ${annonce.professional.city}`}
                                avatarUrl={annonce.professional.avatar}
                                rating={annonce.professional.rating}
                                reviewsCount={annonce.professional.reviewsCount}
                                reviewsLabel={Strings.offer.reviews}
                                isVerified={annonce.professional.isCertified}
                                verifiedLabel={Strings.offer.verified}
                                isOnline={annonce.professional.isAvailable}
                                onPress={handleProfessionalPress}
                                style={styles.professionalCard}
                            />
                        </>
                    )}

                    {/* Location section (shared placeholder until the real map lands) */}
                    <Text style={styles.sectionTitle}>{Strings.annonce.location}</Text>
                    <MapPlaceholder
                        caption={`${annonce.city} — ${Strings.annonce.department} ${annonce.department}`}
                        captionIcon='location-outline'
                    />
                </View>
            </ScrollView>

            {/* Fixed CTA — anchored outside ScrollView at screen bottom */}
            {annonce.professional && (
                <DetailCtaBar
                    onPrimaryPress={handleCallPress}
                    primaryLabel={`${Strings.annonce.call} ${annonce.professional.firstName}`}
                    onSecondaryPress={handleMessagePress}
                    secondaryAccessibilityLabel={Strings.annonce.message}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
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
    // Spacing only: the card itself is the shared ProfessionalRowCard
    professionalCard: {
        marginBottom: Spacing.lg,
    },

    pressed: {
        opacity: 0.7,
    },
});
