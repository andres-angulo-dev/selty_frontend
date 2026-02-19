import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';

// Components
import { HeroSection } from '../components/HeroSection';
import { ActionButtons } from '../components/ActionButtons';
import { StatsRow } from '../components/StatsRow';
import { AboutSection } from '../components/AboutSection';
import { TabSelector, TabName } from '../components/TabSelector'
import { ReviewSummary } from '../components/ReviewSummary';
import { ReviewCard } from '../components/ReviewCard';

// Constants
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

// Mocks
import { getProfessionalDetail } from '../data/mockProfessionalDetails';

// Type for the route props of this screen
type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalDetail'>;

export const ProfessionalDetailScreen: React.FC<Props> = ({ route })=> {
    // Active tab state - controls which content is shown
    const [activeTab, setActiveTab] = useState<TabName>('annonces');
    
    const { professionalId } = route.params; // Get the professionalId from navigation params
    const professional = getProfessionalDetail(professionalId); // Fetch professional data (simulates API call)

    // Handle case where professional is not found
    if (!professional) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.professional.notFound}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero: avatar, name, profession, badge, location */}
            <HeroSection
                avatar={professional.avatar}
                firstName={professional.firstName}
                lastName={professional.lastName}
                profession={professional.profession}
                city={professional.city}
                department={professional.department}
                isCertified={professional.isCertified}
                isAvailable={professional.isAvailable} 
            />

            {/* Actions buttons: call, message, favorite, share */}
            <ActionButtons
                phone={professional.phone}
                firstName={professional.firstName}
                lastName={professional.lastName}
                profession={professional.profession}
                isFavorite={false}
                onMessagePress={() => console.log('Message')}
                onFavoriteToggle={(newValue) => console.log('Favorite:', newValue)}
            />

            {/* Stats: rating, annonce count, member since */}
            <StatsRow 
                rating={professional.rating}
                reviewsCount={professional.reviewsCount}
                annoncesCount={professional.annoncesCount}
                createdAt={professional.createdAt}
            />

            {/* About (description + services) */}
            <AboutSection
                description={professional.description}
                services={professional.services}
            />

            {/* Tab selector (Annonces | Avis) */}
            <TabSelector
                activeTab={activeTab}
                onTabChange={setActiveTab}
                annoncesCount={professional.annoncesCount}
                reviewsCount={professional.reviewsCount}
            />

            {/* Tab content */}
            {activeTab === 'annonces' ? (
                <Text style={styles.placeholder}>Liste des annonces à venir...</Text>
            ) : (
                <View style={styles.reviewContainer}>
                    {/* Global rating summary */}
                    <ReviewSummary reviews={professional.reviews} averageRating={professional.rating} />

                    <Text style={styles.reviewTitle}>{Strings.professional.tabs.reviewsTitle}</Text>
                    <View style={styles.separator} />
                    {/* Individual review cards */}
                    <View style={styles.reviewList}>
                        {professional.reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
    },

    errorContainer: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center'
    },

    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
    },

    placeholder: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        textAlign: 'center',
        paddingVertical: Spacing.xl,
    },

    reviewContainer: {
        paddingTop: Spacing.md,
    },

    reviewTitle: {
        ...Typography.label,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
    },    
    
    separator: {
        height: 1,
        backgroundColor: Colors.neutral.border,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },

    reviewList: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
        gap: Spacing.sm,
    },
})