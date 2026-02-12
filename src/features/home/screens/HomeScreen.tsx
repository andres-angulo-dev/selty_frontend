import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

// Components
import { SearchBar } from '@/shared/components/SearchBar';
import { CategoryCard } from '@/shared/components/CategoryCard';
import { mockCategories } from '../data/mockCategories';
import { ProfessionalCard } from '@/shared/components/ProfessionalCard';
import { mockProfessionals } from '@/features/professional/data/mockProfessionals';
import { OfferCard } from '@/shared/components/OfferCard';
import { mockOffers } from '@/features/offer/data/mockOffers';

export const HomeScreen: React.FC = () => {
    // Temporary state to test SearchBar
    const [ searchText, setSearchText ] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sialty</Text>
            
            {/* Test SearchBar */}
            <SearchBar placeholder='Rechercher un professionnel...' value={searchText} onChangeText={setSearchText} onClear={() => setSearchText('')} onBackPress={() => setSearchText('')} /> 

            {/* Test CategoryCards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} onPress={(cat) => console.log('Pressed:', cat.name)} />
                ))}
            </ScrollView>

            {/* Test ProfessionalCards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockProfessionals.map((pro) => (
                    <ProfessionalCard key={pro.id} professional={pro} onPress={(pro) => console.log('Pressed:', pro.firstName)} />
                ))}
            </ScrollView>
        
            {/* Test OfferCard */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0}} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}>
                {mockOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onPress={(offer) => console.log('Pressed:', offer.title)} />
                ))}
            </ScrollView>

            <Text style={styles.subtitle}>Feed des professionels</Text>
        </View>
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

    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.sm,
    }
})


