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
import { ProfessionalCard } from '@/shared/components/ProfessionalCard';
import { OfferCard } from '@/shared/components/OfferCard';
import { AnnonceGridCard } from '@/shared/components/AnnonceGridCard';
import { useUserLocation } from '@/shared/hooks/useUserLocation';
import { calculateDistance, formatDistance } from '@/shared/utils/geolocation';

// Mock data
import { mockCategories } from '../data/mockCategories';
import { mockBanners } from '../data/mockBanners';
import { mockProfessionals } from '@/features/professional/data/mockProfessionals';
import { mockOffers } from '@/features/offer/data/mockOffers';
import { mockAnnonces } from '@/features/annonce/data/mockAnnonces';

// Maps categoryId → display name for the grid card badge.
// Kept local because this mapping is view-only logic, not business logic.
const CATEGORY_NAMES: Record<string, string> = mockCategories.reduce(
    (acc, cat) => ({ ...acc, [cat.id]: cat.name }),
    {} as Record<string, string>,
);

// Types
import { Professional, Annonce } from '@/shared/types';

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
            pro.profession.toLowerCase().includes(searchText.toLowerCase())
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
            {/* Promo banner carousel — shown first (Stitch AI order) */}
            <PromoBanner banners={mockBanners} onBannerPress={(Banner) => console.log('Banner', Banner.title)} />

            {/* Categories */}
            <SectionHeader title={Strings.home.categories} containerStyle={{ marginTop: 0 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: Spacing.md }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} onPress={(cat) => console.log('Pressed:', cat.name)} variant="circle" />
                ))}
            </ScrollView> 
        
            {/* Popular professionals - Horizontal scroll */}
            <SectionHeader title={Strings.home.popularProfessionals} onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, marginBottom: 15, }}>
                {professionalsWithDistance.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} onPress={(pro) => navigation.navigate('ProfessionalDetail', { professionalId: pro.id })} />
                ))}
            </ScrollView>

            {/* Current offers - Horizontal scroll */}
            <SectionHeader title={Strings.home.currentOffers} onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={styles.horizontalListContent}>
                {mockOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onPress={(offer) => navigation.navigate('OfferDetail', { offerId: offer.id })} />
                ))}
            </ScrollView>

            {/* Feed section title */}
            <SectionHeader title={Strings.home.nearYou} />
        </View>
    ), [professionalsWithDistance, navigation]);

    // ============================================
    // FEED ITEM (Instagram-style grid card)
    // ============================================
    const renderAnnonce = useCallback(({ item }: { item: Annonce }) => (
        <AnnonceGridCard
            annonce={item}
            categoryName={CATEGORY_NAMES[item.categoryId]}
            onPress={(annonce) => navigation.navigate('AnnonceDetail', { annonceId: annonce.id })}
        />
    ), [navigation]);

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
                        data={mockAnnonces}
                        renderItem={renderAnnonce}
                        keyExtractor={(item) => item.id}
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


