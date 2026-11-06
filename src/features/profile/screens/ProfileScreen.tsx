import React from 'react';
import Constants from 'expo-constants';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

// Navigation: the profile stack, plus the root stack for the public profile modal
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList, RootStackParamList } from '@/app/navigation/types';

import { MenuSection } from '@/shared/components/MenuSection';
import { MenuRow } from '@/shared/components/MenuRow';
import { MenuSwitchRow } from '@/shared/components/MenuSwitchRow';
import { useAccountType } from '@/app/providers/AccountTypeProvider';
import { useServiceArea } from '@/shared/hooks/useServiceArea';
import { getProfessionLabel } from '@/shared/utils/professionLabel';
import { isOfferLive } from '@/shared/utils/availability';
import { useMyPublications } from '@/shared/hooks/usePublications';
import { ProfileIdentityCard, ProfileIdentityAction } from '../components/ProfileIdentityCard';
import { ProfileStatsStrip } from '../components/ProfileStatsStrip';
import { HighlightCtaCard } from '../components/HighlightCtaCard';

import { SubscriptionPlan } from '../types';
import { mockUser } from '../data/mockUser';
import { mockProfessionalSummary } from '../data/mockProfessionalSummary';

// ============================================
// PROFILE SCREEN
// Profile tab, in two variants driven by the account type:
// - individual: identity card + "become a professional" card + settings
// - professional: identity card with rating and stats + activity and
//   subscription sections + the same settings
// Rows whose destination screen does not exist yet do nothing on tap.
// ============================================

type ProfileNavigation = CompositeNavigationProp<
    NativeStackNavigationProp<ProfileStackParamList, 'Profile'>,
    NativeStackNavigationProp<RootStackParamList>
>;

// Badge text for each plan: adding a plan to the union forces a label here
const PLAN_LABELS: Record<SubscriptionPlan, string> = {
    free: Strings.profile.plans.free,
};

// Placeholder for rows whose screen is not built yet (notifications, help...)
const noDestinationYet = () => {};

// Number formatting follows the app locale ("4,8" in French)
const formatRating = (rating: number) =>
    rating.toLocaleString(Strings.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<ProfileNavigation>();

    // App-wide role (seeded from the mock user, switchable in development)
    const { isProfessional: isPro, setAccountType } = useAccountType();
    const pro = mockProfessionalSummary;
    const serviceArea = useServiceArea();
    // Counted from the real lists, so the strip always matches "Mes publications"
    const publications = useMyPublications();
    const activeOffersCount = publications.offers.filter(isOfferLive).length;

    const fullName = `${mockUser.firstName} ${mockUser.lastName}`;
    const memberSince = mockUser.createdAt.toLocaleDateString(Strings.locale, {
        month: 'long',
        year: 'numeric',
    });

    // Navigation handlers
    const goToEditProfile = () => navigation.navigate('EditProfile');
    const goToChangePassword = () => navigation.navigate('ChangePassword');
    const goToPublicProfile = () =>
        navigation.navigate('ProfessionalDetail', { professionalId: pro.professionalId });

    // Identity card buttons: the professional also gets "Profil public"
    const identityActions: ProfileIdentityAction[] = isPro
        ? [
              { label: Strings.profile.menu.editProfile, onPress: goToEditProfile },
              { label: Strings.profile.menu.publicProfile, onPress: goToPublicProfile, icon: 'eye-outline' },
          ]
        : [{ label: Strings.profile.menu.editProfile, onPress: goToEditProfile }];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Large left-aligned title */}
                <Text style={styles.title} accessibilityRole="header">
                    {Strings.tabs.profile}
                </Text>

                {/* Identity card: pro props are passed only for a professional */}
                <ProfileIdentityCard
                    name={fullName}
                    avatarUrl={mockUser.avatar}
                    subtitle={
                        isPro
                            ? `${getProfessionLabel(serviceArea.tradeIds)} · ${pro.city}`
                            : `${Strings.profile.memberSince} ${memberSince}`
                    }
                    ratingText={isPro ? formatRating(pro.rating) : undefined}
                    reviewsText={isPro ? Strings.profile.reviewsCount(pro.reviewsCount) : undefined}
                    actions={identityActions}
                >
                    {isPro ? (
                        <ProfileStatsStrip
                            stats={[
                                { value: String(publications.annonces.length), label: Strings.profile.stats.annonces },
                                { value: String(activeOffersCount), label: Strings.profile.stats.activeOffers },
                                { value: String(pro.reviewsCount), label: Strings.profile.stats.reviews },
                            ]}
                        />
                    ) : null}
                </ProfileIdentityCard>

                {/* Individual only: invitation to become a professional */}
                {!isPro ? (
                    <HighlightCtaCard
                        title={Strings.profile.becomePro.title}
                        description={Strings.profile.becomePro.description}
                        ctaLabel={Strings.profile.becomePro.cta}
                        onPress={noDestinationYet}
                    />
                ) : null}

                {/* Individual only: their published requests */}
                {!isPro ? (
                    <MenuSection title={Strings.profile.sections.activity}>
                        <MenuRow
                            icon="create-outline"
                            label={Strings.profile.menu.myRequests}
                            onPress={() => navigation.navigate('MyRequests')}
                        />
                    </MenuSection>
                ) : null}

                {/* Professional only: activity and subscription */}
                {isPro ? (
                    <>
                        <MenuSection title={Strings.profile.sections.activity}>
                            <MenuRow
                                icon="briefcase-outline"
                                label={Strings.serviceArea.trades}
                                badge={Strings.serviceArea.count(serviceArea.tradeIds.length, Strings.serviceArea.tradeUnit.one, Strings.serviceArea.tradeUnit.many)}
                                onPress={() => navigation.navigate('ServiceTrades')}
                            />
                            <MenuRow
                                icon="map-outline"
                                label={Strings.serviceArea.zones}
                                badge={Strings.serviceArea.count(serviceArea.zones.length, Strings.serviceArea.zoneUnit.one, Strings.serviceArea.zoneUnit.many)}
                                onPress={() => navigation.navigate('ServiceZones')}
                            />
                            <MenuRow
                                icon="megaphone-outline"
                                label={Strings.profile.menu.myAnnonces}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'MyPublications', params: { segment: 'annonce' } })}
                            />
                            <MenuRow
                                icon="pricetag-outline"
                                label={Strings.profile.menu.myOffers}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'MyPublications', params: { segment: 'offer' } })}
                            />
                            <MenuRow icon="star-outline" label={Strings.profile.menu.receivedReviews} onPress={noDestinationYet} />
                        </MenuSection>

                        <MenuSection title={Strings.profile.sections.subscription}>
                            <MenuRow
                                icon="card-outline"
                                label={Strings.profile.menu.mySubscription}
                                badge={PLAN_LABELS[pro.plan]}
                                badgeVariant="primary"
                                onPress={noDestinationYet}
                            />
                        </MenuSection>
                    </>
                ) : null}

                {/* Shared sections */}
                <MenuSection title={Strings.profile.sections.account}>
                    <MenuRow icon="person-outline" label={Strings.profile.menu.personalInfo} onPress={goToEditProfile} />
                    <MenuRow icon="lock-closed-outline" label={Strings.profile.menu.passwordSecurity} onPress={goToChangePassword} />
                    <MenuRow icon="notifications-outline" label={Strings.profile.menu.notifications} onPress={noDestinationYet} />
                </MenuSection>

                <MenuSection title={Strings.profile.sections.preferences}>
                    <MenuRow icon="globe-outline" label={Strings.profile.menu.language} value={Strings.profile.values.languageFrench} onPress={noDestinationYet} />
                    <MenuRow icon="moon-outline" label={Strings.profile.menu.theme} value={Strings.profile.values.themeSystem} onPress={noDestinationYet} />
                </MenuSection>

                <MenuSection title={Strings.profile.sections.support}>
                    <MenuRow icon="help-circle-outline" label={Strings.profile.menu.helpCenter} onPress={noDestinationYet} />
                    <MenuRow icon="mail-outline" label={Strings.profile.menu.contact} onPress={noDestinationYet} />
                    <MenuRow icon="document-text-outline" label={Strings.profile.menu.terms} onPress={noDestinationYet} />
                    <MenuRow icon="shield-checkmark-outline" label={Strings.profile.menu.privacy} onPress={noDestinationYet} />
                </MenuSection>

                {/* Development only: __DEV__ is false in store builds, so this
                    section and its switch are stripped from production */}
                {__DEV__ ? (
                    <MenuSection title={Strings.dev.section}>
                        <MenuSwitchRow
                            icon="construct-outline"
                            label={Strings.dev.professionalAccount}
                            hint={Strings.dev.professionalAccountHint}
                            value={isPro}
                            onValueChange={(on) => setAccountType(on ? 'professional' : 'user')}
                        />
                    </MenuSection>
                ) : null}

                {/* Footer: logout (wired with auth later) + app version */}
                <View style={styles.footer}>
                    <Pressable
                        onPress={noDestinationYet}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="log-out-outline" size={20} color={Colors.primary.main} />
                        <Text style={styles.logoutText}>{Strings.profile.menu.logout}</Text>
                    </Pressable>

                    <Text style={styles.version}>
                        {Strings.profile.version} {Constants.expoConfig?.version ?? '1.0.0'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingHorizontal: Spacing.md + Spacing.xs, // 20px, as in the design
        paddingBottom: Spacing.xl,
    },
    // h2 (24px) like a native large title: h1 (32px) crowded the screen
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md + Spacing.xs,
    },
    footer: {
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    pressed: {
        opacity: 0.6,
    },
    logoutText: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    version: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },
});
