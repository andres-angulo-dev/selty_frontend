import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';
import type { RequestStatus } from '@/shared/types';
import { Button } from '@/shared/components/button';
import { useRequest, useRequestActions } from '@/shared/hooks/useRequests';
import { useUserLocation } from '@/shared/hooks/useUserLocation';
import { useServiceArea } from '@/shared/hooks/useServiceArea';
import { useAccountType } from '@/app/providers/AccountTypeProvider';
import { calculateDistance, formatDistance } from '@/shared/utils/geolocation';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { formatAuthorName, getDaysUntilExpiry, getRequestStatus } from '@/shared/utils/requestStatus';
import { getTradeById, isTradeRemoteCapable } from '@/__mocks__/mockTrades';
import { CURRENT_USER_ID } from '@/__mocks__/mockSession';
import { getProAnswerEligibility, ProAnswerEligibility } from '@/shared/utils/requestEligibility';

// ============================================
// REQUEST DETAIL SCREEN
// A need published by an individual. The bottom action depends on who looks:
// - the author: "J'ai trouvé un pro" (open requests only)
// - a professional of the requested trade, inside their zone: "Répondre en privé"
// - any other professional (other trade, out of zone, own request): a note explains why
// - another individual: no action, reading only
// Privacy: first name + initial and city only; no phone, no address.
// Moderation: "···" → "Signaler" (App Store guideline 1.2, public content).
// Hiding a button is not security: the backend must check that only the author
// closes a request and only a professional answers.
// ============================================

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDetail'>;

const texts = Strings.request.detail;

const PHOTO_HEIGHT = 240;

// Dot color of the status pill
const STATUS_COLORS: Record<RequestStatus, string> = {
    open: Colors.semantic.success,
    fulfilled: Colors.primary.main,
    expired: Colors.text.tertiary,
};

/** Tells the professional why they can, or cannot, answer */
const getEligibilityNotice = (
    eligibility: ProAnswerEligibility,
    firstName: string,
    tradeLabel: string,
    place: string,
): string => {
    switch (eligibility) {
        case 'can_answer':
            return texts.privacyNotice(firstName);
        case 'own_request':
            return texts.ownRequestNotice;
        case 'other_trade':
            return texts.otherTradeNotice(tradeLabel);
        case 'out_of_zones':
            return texts.outOfZonesNotice(place);
    }
};

export const RequestDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { requestId } = route.params;
    const request = useRequest(requestId);
    const { markFulfilled } = useRequestActions();
    const { isProfessional } = useAccountType();
    const serviceArea = useServiceArea();
    const { userLocation } = useUserLocation();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();
    const [photoIndex, setPhotoIndex] = useState(0);

    // One account, two modes: "J'ai trouvé un pro" belongs to the individual mode,
    // but the author stays the author in professional mode (no answer, no report).
    const isAuthor = request?.author.id === CURRENT_USER_ID;
    const isOwner = !isProfessional && isAuthor;
    const answerStatus = request
        ? getProAnswerEligibility(serviceArea, request, isTradeRemoteCapable(request.tradeId))
        : null;

    /**
     * Report: confirmation, then acknowledgement.
     * TODO(backend): send the report (POST /reports) and block the author;
     * today nothing is transmitted: required before any release.
     */
    const handleReport = useCallback(() => {
        Alert.alert(texts.reportTitle, texts.reportMessage, [
            { text: Strings.buttons.cancel, style: 'cancel' },
            {
                text: texts.reportConfirm,
                style: 'destructive',
                onPress: () => Alert.alert(texts.reportDoneTitle, texts.reportDoneMessage),
            },
        ]);
    }, []);

    // "···" menu in the header. Nobody reports their own request
    useEffect(() => {
        navigation.setOptions({
            headerRight: isAuthor || !request ? undefined : () => (
                <Pressable
                    onPress={handleReport}
                    hitSlop={Spacing.sm}
                    accessibilityRole="button"
                    accessibilityLabel={texts.reportTitle}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.primary} />
                </Pressable>
            ),
        });
    }, [navigation, isAuthor, request, handleReport]);

    if (!request) {
        return (
            <View style={styles.notFound}>
                <Text style={styles.notFoundText}>{texts.notFound}</Text>
            </View>
        );
    }

    const status = getRequestStatus(request);
    const isOpen = status === 'open';
    const tradeLabel = getTradeById(request.tradeId)?.label;
    const memberYear = new Date(request.author.memberSince).getFullYear();

    // City center distance (never an address); nothing without coordinates
    const distance =
        userLocation && request.latitude !== null && request.longitude !== null
            ? formatDistance(calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                request.latitude,
                request.longitude,
            ))
            : null;

    const handleReply = () => {
        // TODO(messaging): open a private conversation with the author
        Alert.alert(Strings.messaging.comingSoonTitle, Strings.messaging.comingSoonMessage);
    };

    const handleMarkFulfilled = () => {
        Alert.alert(texts.fulfillTitle, texts.fulfillMessage, [
            { text: Strings.buttons.cancel, style: 'cancel' },
            { text: texts.fulfillConfirm, onPress: () => markFulfilled(request.id) },
        ]);
    };

    /** Which photo is displayed, once the swipe has settled */
    const handlePhotoScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth));
    };

    // Bottom action according to the viewer; none on a closed request
    let action: { label: string; onPress: () => void } | null = null;
    if (isOpen && isOwner) {
        action = { label: texts.markFulfilled, onPress: handleMarkFulfilled };
    } else if (isOpen && isProfessional && answerStatus === 'can_answer') {
        action = { label: texts.reply, onPress: handleReply };
    }

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Photos (optional): full width, swipe between them */}
                {request.photos.length > 0 ? (
                    <View>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={handlePhotoScroll}
                        >
                            {request.photos.map((uri) => (
                                <Image key={uri} source={{ uri }} style={{ width: screenWidth, height: PHOTO_HEIGHT }} />
                            ))}
                        </ScrollView>
                        {request.photos.length > 1 ? (
                            <View style={styles.photoCounter}>
                                <Text style={styles.photoCounterText}>
                                    {photoIndex + 1} / {request.photos.length}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                {/* Pills + title */}
                <View style={styles.card}>
                    <View style={styles.pills}>
                        <View style={styles.badge}>
                            <Ionicons name="megaphone-outline" size={12} color={Colors.text.inverse} />
                            <Text style={styles.badgeText}>{Strings.request.badge}</Text>
                        </View>
                        {tradeLabel ? (
                            <View style={styles.pill}>
                                <Text style={styles.pillText}>{tradeLabel}</Text>
                            </View>
                        ) : null}
                        {isProfessional && answerStatus === 'can_answer' ? (
                            <View style={styles.badge}>
                                <Ionicons name="checkmark-circle" size={12} color={Colors.text.inverse} />
                                <Text style={styles.badgeText}>{texts.tradeMatchPill}</Text>
                            </View>
                        ) : null}
                        <View style={styles.pill}>
                            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                            <Text style={styles.pillText}>{Strings.request.status[status]}</Text>
                        </View>
                    </View>

                    <Text style={styles.title} accessibilityRole="header">{request.title}</Text>

                    <Text style={styles.dates}>
                        {texts.published} {formatRelativeDate(new Date(request.createdAt), 'seconds')}
                        {isOpen ? ` · ${texts.expiresIn(getDaysUntilExpiry(request))}` : ''}
                    </Text>
                </View>

                {/* Urgency + place */}
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name={request.urgency === 'urgent' ? 'flash-outline' : 'time-outline'}
                            size={20}
                            color={request.urgency === 'urgent' ? Colors.semantic.error : Colors.primary.main}
                        />
                        <View style={styles.infoTexts}>
                            <Text style={styles.infoLabel}>{texts.urgency}</Text>
                            <Text style={styles.infoValue}>{Strings.request.urgency[request.urgency]}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color={Colors.primary.main} />
                        <View style={styles.infoTexts}>
                            <Text style={styles.infoLabel}>{texts.place}</Text>
                            <Text style={styles.infoValue}>
                                {request.city} ({request.department}){distance ? ` · ${texts.distance(distance)}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{texts.description}</Text>
                    <Text style={styles.description}>{request.description}</Text>
                </View>

                {/* Author: first name + initial only. No "verified": individuals are not verified */}
                <View style={[styles.card, styles.authorCard]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{request.author.firstName.charAt(0)}</Text>
                    </View>
                    <View style={styles.infoTexts}>
                        <Text style={styles.authorName}>{formatAuthorName(request.author)}</Text>
                        <Text style={styles.infoLabel}>{texts.memberSince(memberYear)}</Text>
                    </View>
                </View>

                {/* What a pro needs to know before answering */}
                {isProfessional && isOpen && answerStatus ? (
                    <View style={styles.notice}>
                        <Ionicons
                            name={answerStatus === 'can_answer' ? 'lock-closed-outline' : 'information-circle-outline'}
                            size={18}
                            color={Colors.primary.main}
                        />
                        <Text style={styles.noticeText}>
                            {getEligibilityNotice(answerStatus, request.author.firstName, tradeLabel ?? '', `${request.city} (${request.department})`)}
                        </Text>
                    </View>
                ) : null}

                {/* The refusal can be solved by the pro: direct way to their settings */}
                {isProfessional && isOpen && (answerStatus === 'other_trade' || answerStatus === 'out_of_zones') ? (
                    <Pressable
                        onPress={() => navigation.navigate(answerStatus === 'other_trade' ? 'ServiceTrades' : 'ServiceZones')}
                        style={({ pressed }) => [styles.manageLink, pressed && { opacity: 0.6 }]}
                        accessibilityRole="button"
                    >
                        <Text style={styles.manageLinkText}>
                            {answerStatus === 'other_trade' ? Strings.serviceArea.manageTrades : Strings.serviceArea.manageZones}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.primary.main} />
                    </Pressable>
                ) : null}
            </ScrollView>

            {action ? (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
                    <Button label={action.label} onPress={action.onPress} fullWidth size="large" />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingBottom: Spacing.xl,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    notFoundText: {
        ...Typography.body,
        color: Colors.text.secondary,
    },
    photoCounter: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.overlay.darkScrim,
    },
    photoCounterText: {
        ...Typography.caption,
        color: Colors.text.inverse,
        fontWeight: '600',
    },
    card: {
        marginHorizontal: Spacing.md,
        marginTop: Spacing.sm + Spacing.xs,
        padding: Spacing.md,
        gap: Spacing.sm + Spacing.xs,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.neutral.card,
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.main,
    },
    badgeText: {
        ...Typography.caption,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.subtle,
    },
    pillText: {
        ...Typography.caption,
        color: Colors.primary.main,
        fontWeight: '600',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    title: {
        ...Typography.h3,
        color: Colors.primary.main,
    },
    dates: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm + Spacing.xs,
    },
    infoTexts: {
        flex: 1,
        gap: 2,
    },
    infoLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    infoValue: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    sectionTitle: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    description: {
        ...Typography.body,
        color: Colors.text.primary,
    },
    authorCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.main,
    },
    avatarText: {
        ...Typography.bodyBold,
        color: Colors.text.inverse,
    },
    authorName: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    notice: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.sm + Spacing.xs,
        padding: Spacing.sm + Spacing.xs,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary.subtle,
    },
    noticeText: {
        ...Typography.caption,
        color: Colors.text.primary,
        flex: 1,
    },
    manageLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        minHeight: 44,
        marginHorizontal: Spacing.md,
    },
    manageLinkText: {
        ...Typography.label,
        color: Colors.primary.main,
        flexShrink: 1,
    },
    bottomBar: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
    },
});
