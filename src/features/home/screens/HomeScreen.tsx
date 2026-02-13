import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Colors, Spacing } from '@/shared/constants';

// Home components
import { HomeHeader } from '../components/HomeHeader';
import { PromoBanner } from '../components/PromoBanner';
import { SectionHeader } from '../components/SectionHeader';

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
    // Temporary state to test SearchBar
    const [ searchText, setSearchText ] = useState('');

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
            {/* Header - Logo + Notifications */}
            <HomeHeader onNotificationPress={() => console.log('Notification')} notificationCount={1}/>
            
            {/* Search bar */}
            <SearchBar placeholder='Rechercher un professionnel...' value={searchText} onChangeText={setSearchText} onClear={() => setSearchText('')} onBackPress={() => setSearchText('')} /> 

            {/* Scrollable content */}
            <FlatList 
                data={mockAnnonces} 
                renderItem={renderAnnonce} 
                keyExtractor={(item) => item.id} 
                ListHeaderComponent={renderHeader} 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.flatListContent} 
            />
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


