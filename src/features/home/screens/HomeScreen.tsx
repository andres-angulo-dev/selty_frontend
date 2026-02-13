import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing } from '@/shared/constants';

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
import { AnnonceCard } from '@/shared/components/AnnonceCard';

// Mock data
import { mockCategories } from '../data/mockCategories';
import { mockBanners } from '../data/mockBanners';
import { mockProfessionals } from '@/features/professional/data/mockProfessionals';
import { mockOffers } from '@/features/offer/data/mockOffers';
import { mockAnnonces } from '@/features/annonce/data/mockAnnonces';

// Types
import { Annonce } from '@/features/annonce/types';

export const HomeScreen: React.FC = () => {
    // Temporary state 
    const [searchText, setSearchText] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([
        'Plombier',
        'Coiffeur',
        'Avocat',
    ]);
    // ============================================
    // HEADER ANIMATION
    // ============================================
    // Animated value: 1 = header visible, 0 = header hidden
    const headerAnimation = useRef(new Animated.Value(1)).current;

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
    const filteredCategories = mockCategories.filter((cat) => 
        cat.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    const filteredProfessionals = mockProfessionals.filter((pro) =>
        pro.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        pro.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        pro.profession.toLowerCase().includes(searchText.toLowerCase()) 
    );
    
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
    const renderHeader = () => (
        <View>
            {/* Categories - Horizontal scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 15, }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} onPress={(cat) => console.log('Pressed:', cat.name)} />
                ))}
            </ScrollView>

            {/* Promo banner carousel */}
            <PromoBanner banners={mockBanners} onBannerPress={(Banner) => console.log('Banner', Banner.title)} /> 
        
            {/* Popular professionals - Horizontal scroll */}
            <SectionHeader title='Professionnels populaires' onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, marginBottom: 15, }}>
                {mockProfessionals.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} onPress={(pro) => console.log('Pressed:', pro.firstName)} />
                ))}
            </ScrollView>

            {/* Current offers - Horizontal scroll */}
            <SectionHeader title='Les offres du moment' onSeeAllPress={() => console.log('SeeAll')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList} contentContainerStyle={styles.horizontalListContent}>
                {mockOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onPress={(offer) => console.log('Pressed:', offer.title)} />
                ))}
            </ScrollView>

            {/* Feed section title */}
            <SectionHeader title='Près de chez vous' />
        </View>
    )

    // ============================================
    // FEED ITEM (each annonce card)
    // ============================================    
    const renderAnnonce = ({ item }: { item: Annonce }) => (
        <AnnonceCard 
            annonce={item} 
            onPress={(annonce) => console.log('Annonce:', annonce.title)} 
            onLikePress={(annonce) => console.log('Liked:', annonce.title)} 
            onCommentPress={(annonce) => console.log('Comments:', annonce.title)} 
            onFavoritePress={(annonce) => console.log('Favorited:', annonce.title)} 
        />
    )

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
                placeholder='Rechercher un professionnel...' 
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
                        onProfessionalPress={(pro) => console.log('Pro:', pro.firstName)}
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
    },

    horizontalList: {
        flexGrow: 0,
    },

    horizontalListContent: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm
    }
})


