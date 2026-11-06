import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { View, StyleSheet, FlatList, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing, Strings } from '@/shared/constants';

// Home components
import { HomeHeader } from '../components/HomeHeader';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';
import { SearchOverlay } from '../components/SearchOverlay';

// Shared components
import { SearchBar } from '@/shared/components/SearchBar';
import { CategoryCard } from '@/shared/components/CategoryCard';
import { ProfessionalCoverCard } from '@/shared/components/ProfessionalCoverCard';
import { OfferCard } from '@/shared/components/OfferCard';
import { AnnonceGridCard } from '@/shared/components/AnnonceGridCard';
import { RequestGridCard } from '@/shared/components/RequestGridCard';
import { useRequests } from '@/shared/hooks/useRequests';
import { useServiceArea } from '@/shared/hooks/useServiceArea';
import { useAccountType } from '@/app/providers/AccountTypeProvider';
import { formatAuthorName, getRequestStatus } from '@/shared/utils/requestStatus';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { getProfessionLabel } from '@/shared/utils/professionLabel';
import { useUserLocation } from '@/shared/hooks/useUserLocation';
import { calculateDistance, formatDistance } from '@/shared/utils/geolocation';

// Mock data
import { mockCategories } from '@/__mocks__/mockCategories';
import { mockBanners } from '../data/mockBanners';
import { mockProfessionals } from '@/__mocks__/mockProfessionals';
import { useAnnonces, useOffers } from '@/shared/hooks/usePublications';
import { isOfferLive } from '@/shared/utils/availability';
import { getTradeById, isTradeRemoteCapable } from '@/__mocks__/mockTrades';
import { getProAnswerEligibility } from '@/shared/utils/requestEligibility';

// Maps categoryId → display name for the grid card badge.
// Kept local because this mapping is view-only logic, not business logic.
const CATEGORY_NAMES: Record<string, string> = mockCategories.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat.name }),
    {} as Record<string, string>,
);

// Types
import { Professional, Annonce, ServiceRequest } from '@/shared/types';

// The feed mixes the pros' annonces and the individuals' requests
type FeedItem =
    | { kind: 'annonce'; id: string; date: number; annonce: Annonce }
    | { kind: 'request'; id: string; date: number; request: ServiceRequest };

export const HomeScreen: React.FC = () => {
    // Temporary state 
    const [searchText, setSearchText] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // ============================================
    // USER LOCATION
    // ============================================
    const { userLocation } = useUserLocation();

    // ============================================
    // FEED: annonces + open requests, most recent first
    // Fulfilled and expired requests leave the feed (they stay in "Mes demandes").
    // ============================================
    const requests = useRequests();
    const annonces = useAnnonces();
    // Customers only see an offer while it runs: not before it starts, not once it ended
    const allOffers = useOffers();
    const offers = useMemo(() => allOffers.filter(isOfferLive), [allOffers]);
    const { isProfessional } = useAccountType();
    const serviceArea = useServiceArea();
    const feedItems = useMemo<FeedItem[]>(() => {
        const annonceItems: FeedItem[] = annonces.map((annonce) => ({
            kind: 'annonce',
            id: annonce.id,
            date: annonce.createdAt.getTime(),
            annonce,
        }));
        const requestItems: FeedItem[] = requests
            .filter((request) => getRequestStatus(request) === 'open')
            .map((request) => ({
                kind: 'request',
                id: request.id,
                date: new Date(request.createdAt).getTime(),
                request,
            }));
        return [...annonceItems, ...requestItems].sort((a, b) => b.date - a.date);
    }, [annonces, requests]);

    // ============================================
    // HEADER ANIMATION
    // ============================================
    // Animated value: 1 = header visible, 0 = header hidden
    const headerAnimation = useRef(new Animated.Value(1)).current;

    // Calculate distances for professionals based on user location
    // useMemo: recomputes only when userLocation changes, not on every keystroke
    const professionalsWithDistance = useMemo<Professional[]>(() =>
        mockProfessionals.map((pro) => {
            if (userLocation && pro.latitude && pro.longitude) {
                const distanceKm = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    pro.latitude,
                    pro.longitude,
                );
                return { ...pro, distance: formatDistance(distanceKm) };
            }
            return { ...pro };
        }),
    [userLocation]);

    //Trigger animation when search focus changes
    useEffect(() => {
        Animated.timing(headerAnimation, {
            toValue: isSearchFocused ? 0 : 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [isSearchFocused]);
    
    // ============================================
    // SEARCH LOGIC
    // ============================================
    // Filter categories and professionals based on search text
    // useMemo: recomputes only when searchText changes
    const filteredCategories = useMemo(() =>
        mockCategories.filter((cat) =>
            cat.name.toLowerCase().includes(searchText.toLowerCase())
        ),
    [searchText]);

    // useMemo: recomputes only when professionalsWithDistance or searchText changes
    const filteredProfessionals = useMemo(() =>
        professionalsWithDistance.filter((pro) =>
            pro.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
            pro.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
            getProfessionLabel(pro.tradeIds).toLowerCase().includes(searchText.toLowerCase())
        ),
    [professionalsWithDistance, searchText]);
    
    // clear search history
    const handleClearHistory = () => {
        setRecentSearches([]);
    };

    // When user taps a recent search
    const handleRecentSearchPress = (search: string) => {
        setSearchText(search);
    };

    // when user taps back arrow - close search
    const handleBackPress = () => {
        setSearchText('');
        setIsSearchFocused(false);
    }

    // ============================================
    // HEADER SECTIONS (above the feed)
    // ============================================    
    // ListHeaderComponent: everything above the vertical feed
    // This is rendered once at the top of the FlatList
    const renderHeader = useCallback(() => (
        <View>
            {/* Promo banner carousel — shown first (design order) */}
            <PromoBanner banners={mockBanners} onBannerPress={(Banner) => console.log('Banner', Banner.title)} />

            {/* Categories */}
            <SectionHeader title={Strings.home.categories} containerStyle={{ marginTop: 0 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: Spacing.md }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} onPress={(cat) => console.log('Pressed:', cat.name)} variant="circle" />
                ))}
            </ScrollView> 
        
            {/* Pour vous — Horizontal scroll of cover cards */}
            <SectionHeader title={Strings.home.forYou} onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.xs }}>
                {professionalsWithDistance.map((pro) => (
                    <ProfessionalCoverCard key={pro.id} professional={pro} onPress={(pro) => navigation.navigate('ProfessionalDetail', { professionalId: pro.id })} />
                ))}
            </ScrollView>

            {/* Offres spéciales - Horizontal scroll */}
            <SectionHeader title={Strings.home.specialOffers} onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={styles.horizontalListContent}>
                {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onPress={(offer) => navigation.navigate('OfferDetail', { offerId: offer.id })} />
                ))}
            </ScrollView>

            {/* Feed section title */}
            <SectionHeader title={Strings.home.nearYou} />
        </View>
    ), [professionalsWithDistance, offers, navigation]);

    // ============================================
    // FEED ITEM (Instagram-style grid card)
    // ============================================
    const renderFeedItem = useCallback(({ item }: { item: FeedItem }) => {
        if (item.kind === 'annonce') {
            return (
                <AnnonceGridCard
                    annonce={item.annonce}
                    categoryName={CATEGORY_NAMES[item.annonce.categoryId]}
                    onPress={(annonce) => navigation.navigate('AnnonceDetail', { annonceId: annonce.id })}
                />
            );
        }

        const { request } = item;
        // City center distance (never an address); no distance without coordinates
        const distance =
            userLocation && request.latitude !== null && request.longitude !== null
                ? formatDistance(calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    request.latitude,
                    request.longitude,
                ))
                : null;
        const place = `${request.city} (${request.department})`;

        return (
            <RequestGridCard
                badgeLabel={Strings.request.badge}
                tradeLabel={getTradeById(request.tradeId)?.label}
                title={request.title}
                description={request.description}
                authorName={formatAuthorName(request.author)}
                authorInitial={request.author.firstName.charAt(0)}
                locationLabel={distance ? `${place} · ${distance}` : place}
                urgencyLabel={Strings.request.urgency[request.urgency]}
                isUrgent={request.urgency === 'urgent'}
                timeLabel={formatRelativeDate(new Date(request.createdAt), 'seconds')}
                // A pro spots at a glance the requests they can answer
                highlightLabel={isProfessional && getProAnswerEligibility(serviceArea, request, isTradeRemoteCapable(request.tradeId)) === 'can_answer' ? Strings.request.tradeMatch : undefined}
                onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
            />
        );
    }, [navigation, userLocation, isProfessional, serviceArea]);

    // ============================================
    // MAIN RENDER
    // ============================================
    return (
        <View style={styles.container}>
            {/* Header (Logo + Notifications) - animated: slides up when search is focused */}
            <Animated.View style={{
                opacity: headerAnimation, 
                maxHeight: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 60],
                }),
                overflow: 'hidden',
            }}>
                <HomeHeader onNotificationPress={() => console.log('Notification')} notificationCount={1}/>
            </Animated.View>
            
            {/* Search bar */}
            <SearchBar 
                placeholder={Strings.home.searchPlaceholder}
                value={searchText} 
                onChangeText={setSearchText} 
                onClear={() => setSearchText('')} 
                onBackPress={handleBackPress}
                onFocus={() => setIsSearchFocused(true)} 
                isActive={isSearchFocused}
            /> 
            
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Search overlay - visible when search is focused */}
                {isSearchFocused ? (
                    <SearchOverlay 
                        searchText={searchText}
                        recentSearches={recentSearches}
                        categoryResults={filteredCategories}
                        professionalResults={filteredProfessionals}
                        onRecentSearchPress={handleRecentSearchPress}
                        onClearHistory={handleClearHistory}
                        onCategoryPress={(cat) => console.log('Category:', cat.name)}
                        onProfessionalPress={(pro) => navigation.navigate('ProfessionalDetail', { professionalId: pro.id })}
                    />
                ) : (
                    // Scrollable content
                    <FlatList
                        data={feedItems}
                        renderItem={renderFeedItem}
                        keyExtractor={(item) => `${item.kind}-${item.id}`}
                        ListHeaderComponent={renderHeader}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        numColumns={2}
                        columnWrapperStyle={styles.gridRow}
                    />
                )}
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.xxxl,
        backgroundColor: Colors.neutral.background,
    },

    flatListContent: {
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },

    // Gap of 3px between the two columns — same as Instagram's tight grid.
    gridRow: {
        gap: 3,
        marginBottom: 3,
    },

    horizontalList: {
        flexGrow: 0,
    },

    horizontalListContent: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm
    }
})


