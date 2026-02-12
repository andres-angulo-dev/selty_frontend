import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

// Components
import { HomeHeader } from '../components/HomeHeader';
import { SearchBar } from '@/shared/components/SearchBar';
import { CategoryCard } from '@/shared/components/CategoryCard';
import { mockCategories } from '../data/mockCategories';
import { ProfessionalCard } from '@/shared/components/ProfessionalCard';
import { mockProfessionals } from '@/features/professional/data/mockProfessionals';
import { OfferCard } from '@/shared/components/OfferCard';
import { mockOffers } from '@/features/offer/data/mockOffers';
import { AnnonceCard } from '@/shared/components/AnnonceCard';
import { mockAnnonces } from '@/features/annonce/data/mockAnnonces';

export const HomeScreen: React.FC = () => {
    // Temporary state to test SearchBar
    const [ searchText, setSearchText ] = useState('');

    return (
        <ScrollView>
        <View style={styles.container}>
            <HomeHeader onNotificationPress={() => console.log('Notification')} notificationCount={1}/>
            {/* <Text style={styles.title}>Sialty</Text> */}
            
            {/* Test SearchBar */}
            <SearchBar placeholder='Rechercher un professionnel...' value={searchText} onChangeText={setSearchText} onClear={() => setSearchText('')} onBackPress={() => setSearchText('')} /> 

            {/* Test CategoryCards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 15, }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} onPress={(cat) => console.log('Pressed:', cat.name)} />
                ))}
            </ScrollView>

            <Text style={styles.titleSection}>Professionels populaires</Text>
            {/* Test ProfessionalCards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, marginBottom: 15, }}>
                {mockProfessionals.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} onPress={(pro) => console.log('Pressed:', pro.firstName)} />
                ))}
            </ScrollView>
        
            <Text style={styles.titleSection}>Les offres du moment</Text>
            {/* Test OfferCards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0}} contentContainerStyle={{ paddingHorizontal: Spacing.md, marginBottom: 15, }}>
                {mockOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onPress={(offer) => console.log('Pressed:', offer.title)} />
                ))}
            </ScrollView>

            <Text style={styles.titleSection}>Près de chez vous</Text>
            {/* Test AnnoncesCard */}
            {mockAnnonces.map((annonce) => (
                <AnnonceCard key={annonce.id} onCommentPress={(annonce) => console.log('Comments.', annonce.title)} annonce={annonce} onPress={(annonce) => console.log('Pressed:', annonce.title)} onLikePress={(annonce) => console.log('Liked:', annonce.title)} onFavoritePress={(annonce) => console.log('Favorited:', annonce.title)} />
            ))}
        </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.xxxl,
        alignItems: 'center',
        backgroundColor: Colors.neutral.background,
    },

    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm
    },

    titleSection: {
        ...Typography.body,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
        paddingLeft: Spacing.md,
        fontWeight: '600',
        alignSelf: 'flex-start',
    }
})


