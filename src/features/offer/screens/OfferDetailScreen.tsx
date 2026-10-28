import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Image, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { OfferCondition } from '@/shared/types';
import { ProfessionalRowCard } from '@/shared/components/ProfessionalRowCard';
import { MapPlaceholder } from '@/shared/components/MapPlaceholder';
import { DetailCtaBar } from '@/shared/components/DetailCtaBar';
import { formatAbsoluteDate, getDaysUntil } from '@/shared/utils/formatDate';
import { RootStackParamList } from '@/app/navigation/types';
import { getOfferById } from '../data/mockOffers';

// Screen props: gives access to route.params.offerId and navigation
type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Icon per condition — a view concern, so it lives here and not in the data model
const CONDITION_ICONS: Record<OfferCondition, IoniconName> = {
    free_quote: 'document-text-outline',
    fast_response: 'time-outline',
    no_commitment: 'shield-checkmark-outline',
    first_session_free: 'gift-outline',
};

const MAX_CONDITIONS = 3;                       // Design: three stat cards max in a row
const HERO_HEIGHT = 220;
const CARD_OVERLAP = 20;                        // Content card rides over the hero bottom

// Light tint for the stat cards: brand blue at ~15% alpha (hex alpha suffix)
const CONDITION_CARD_BG = `${Colors.secondary.main}26`;

// Countdown pill text from the expiry date. Returns null when there is no limit.
const getCountdownLabel = (expiresAt: Date | null): { label: string; isExpired: boolean } | null => {
    if (!expiresAt) return null;
    const daysLeft = getDaysUntil(expiresAt);

    if (daysLeft < 0) return { label: Strings.offer.expired, isExpired: true };
    if (daysLeft === 0) return { label: Strings.offer.expiresToday, isExpired: false };

    const unit = daysLeft === 1 ? Strings.offer.day : Strings.offer.days;
    return { label: `${Strings.offer.expiresIn} ${daysLeft} ${unit}`, isExpired: false };
};

// Validity meta text: "Du X au Y" / "Valable jusqu'au Y" / "Sans date limite"
const getValidityLabel = (startsAt: Date | null, expiresAt: Date | null): string => {
    if (startsAt && expiresAt) {
        return `${Strings.offer.validFrom} ${formatAbsoluteDate(startsAt)} ${Strings.offer.validTo} ${formatAbsoluteDate(expiresAt)}`;
    }
    if (expiresAt) return `${Strings.offer.validUntil} ${formatAbsoluteDate(expiresAt)}`;
    return Strings.offer.noExpiry;
};

export const OfferDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { offerId } = route.params;
    const offer = getOfferById(offerId);

    // ── All hooks must be declared before any conditional return ──────────
    const [isSaved, setIsSaved] = useState(false);

    const handleToggleSave = useCallback(() => {
        setIsSaved(prev => !prev);
    }, []);

    const handleShare = useCallback(async () => {
        if (!offer) return;
        await Share.share({ message: `${offer.title} — ${offer.description}` });
    }, [offer]);

    // Header actions: bookmark + share (design), synced with local saved state
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerActions}>
                    <Pressable onPress={handleToggleSave} hitSlop={8}>
                        <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={22}
                            color={Colors.text.primary}
                        />
                    </Pressable>
                    <Pressable onPress={handleShare} hitSlop={8}>
                        <Ionicons name='share-social-outline' size={22} color={Colors.text.primary} />
                    </Pressable>
                </View>
            ),
        });
    }, [navigation, isSaved, handleToggleSave, handleShare]);

    // ── Guard — after hooks ────────────────────────────────────────────────
    if (!offer) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.offer.notFound}</Text>
            </View>
        );
    }

    const countdown = getCountdownLabel(offer.expiresAt);
    const validityLabel = getValidityLabel(offer.startsAt, offer.expiresAt);
    const conditions = (offer.conditions ?? []).slice(0, MAX_CONDITIONS);
    const professional = offer.professional;

    const handleProfessionalPress = () => {
        if (professional) {
            navigation.navigate('ProfessionalDetail', { professionalId: professional.id });
        }
    };

    // Open the native phone dialer, or explain why we can't
    const handleCallPress = () => {
        if (professional?.phone) {
            Linking.openURL(`tel:${professional.phone}`);
            return;
        }
        Alert.alert(Strings.professional.actions.noPhoneTitle, Strings.professional.actions.noPhoneMessage);
    };

    const handleMessagePress = () => {
        Alert.alert(Strings.messaging.comingSoonTitle, Strings.messaging.comingSoonMessage);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Hero image + overlaid pills ─────────────────── */}
                <View style={styles.hero}>
                    {offer.image ? (
                        <Image source={{ uri: offer.image }} style={styles.heroImage} resizeMode='cover' />
                    ) : (
                        <View style={[styles.heroImage, styles.heroPlaceholder]}>
                            <Ionicons name='pricetag-outline' size={48} color={Colors.text.tertiary} />
                        </View>
                    )}

                    {/* Dark-to-transparent gradient so the pills stay readable on any photo */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent']}
                        style={styles.heroGradient}
                        pointerEvents='none'
                    />

                    {/* Discount pill (top-left) */}
                    <View style={styles.discountPill}>
                        <Text style={styles.discountText}>{offer.discount}</Text>
                    </View>

                    {/* Countdown pill (top-right) */}
                    {countdown && (
                        <View style={styles.countdownPill}>
                            <Ionicons
                                name={countdown.isExpired ? 'alert-circle' : 'time-outline'}
                                size={14}
                                color={Colors.semantic.error}
                            />
                            <Text style={[styles.countdownText, countdown.isExpired && styles.countdownExpired]}>
                                {countdown.label}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ── White content card ──────────────────────────── */}
                <View style={styles.contentCard}>
                    {/* Category + title + validity */}
                    <View style={styles.headerBlock}>
                        {offer.category && (
                            <View style={styles.categoryPill}>
                                <Text style={styles.categoryText}>{offer.category.name.toUpperCase()}</Text>
                            </View>
                        )}
                        <Text style={styles.title}>{offer.title}</Text>
                        <View style={styles.metaRow}>
                            <Ionicons name='calendar-outline' size={16} color={Colors.text.tertiary} />
                            <Text style={styles.metaText}>{validityLabel}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>{offer.description}</Text>

                    {/* Conditions — stat cards */}
                    {conditions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{Strings.offer.conditions}</Text>
                            <View style={styles.conditionsRow}>
                                {conditions.map((condition) => (
                                    <View key={condition} style={styles.conditionCard}>
                                        <View style={styles.conditionIconCircle}>
                                            <Ionicons name={CONDITION_ICONS[condition]} size={18} color={Colors.primary.main} />
                                        </View>
                                        <Text style={styles.conditionLabel}>
                                            {Strings.offer.conditionLabels[condition]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Professional */}
                    {professional && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{Strings.offer.professional}</Text>
                            <ProfessionalRowCard
                                name={`${professional.firstName} ${professional.lastName}`}
                                subtitle={`${professional.profession} · ${professional.city}`}
                                avatarUrl={professional.avatar}
                                rating={professional.rating}
                                reviewsCount={professional.reviewsCount}
                                reviewsLabel={Strings.offer.reviews}
                                isVerified={professional.isCertified}
                                verifiedLabel={Strings.offer.verified}
                                isOnline={professional.isAvailable}
                                onPress={handleProfessionalPress}
                            />
                        </View>
                    )}

                    {/* Location */}
                    {professional && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{Strings.offer.location}</Text>
                            <MapPlaceholder caption={`${professional.city} ${Strings.offer.locationSuffix}`} />
                        </View>
                    )}

                    {/* Social proof */}
                    {offer.likesCount !== undefined && (
                        <View style={styles.likesRow}>
                            <Ionicons name='heart' size={18} color={Colors.semantic.error} />
                            <Text style={styles.likesText}>
                                {offer.likesCount} {Strings.offer.likes}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed CTA — outside the ScrollView so it stays anchored at the bottom */}
            {professional && (
                <DetailCtaBar
                    onPrimaryPress={handleCallPress}
                    primaryLabel={Strings.offer.call}
                    onSecondaryPress={handleMessagePress}
                    secondaryAccessibilityLabel={Strings.offer.message}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
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

    headerActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        paddingLeft: Spacing.sm,
    },

    // ── Hero ──────────────────────────────────────────
    hero: {
        height: HERO_HEIGHT,
    },

    heroImage: {
        width: '100%',
        height: HERO_HEIGHT,
    },

    heroPlaceholder: {
        backgroundColor: Colors.neutral.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },

    discountPill: {
        position: 'absolute',
        top: Spacing.md,
        left: Spacing.md,
        backgroundColor: Colors.semantic.error,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md - Spacing.xs,  // 12px
        paddingVertical: Spacing.xs + 2,             // 6px
        ...Colors.shadow.card,
    },

    discountText: {
        ...Typography.buttonSmall,
        color: Colors.text.inverse,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    countdownPill: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: Colors.neutral.white,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md - Spacing.xs,  // 12px
        paddingVertical: Spacing.xs,
        ...Colors.shadow.card,
    },

    countdownText: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '600',
    },

    countdownExpired: {
        color: Colors.semantic.error,
    },

    // ── Content card ──────────────────────────────────
    contentCard: {
        backgroundColor: Colors.neutral.white,
        borderTopLeftRadius: CARD_OVERLAP,
        borderTopRightRadius: CARD_OVERLAP,
        marginTop: -CARD_OVERLAP,
        paddingHorizontal: Spacing.md + Spacing.xs,  // 20px
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        gap: Spacing.lg,
    },

    headerBlock: {
        gap: Spacing.sm + 2,                         // 10px
    },

    categoryPill: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.neutral.inputBg,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: Spacing.xs,
    },

    categoryText: {
        ...Typography.captionBis,
        color: Colors.primary.main,
        fontWeight: '800',
        letterSpacing: 1.5,
    },

    title: {
        ...Typography.h2,
        color: Colors.primary.main,
    },

    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    metaText: {
        ...Typography.caption,
        color: Colors.text.secondary,
        fontWeight: '500',
    },

    description: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 22,
    },

    // ── Sections ──────────────────────────────────────
    section: {
        gap: Spacing.sm + Spacing.xs,                // 12px
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.primary.main,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    conditionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm + 2,                         // 10px
    },

    conditionCard: {
        flex: 1,
        alignItems: 'center',
        gap: Spacing.xs + 2,
        backgroundColor: CONDITION_CARD_BG,
        borderRadius: BorderRadius.lg,
        padding: Spacing.sm + Spacing.xs,
    },

    conditionIconCircle: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    conditionLabel: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '700',
        textAlign: 'center',
    },

    likesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },

    likesText: {
        ...Typography.caption,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
});
