import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';

// Components
import { HeroSection } from '../components/HeroSection';
import { ActionButtons } from '../components/ActionButtons';
import { StatsRow } from '../components/StatsRow';

// Constants
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

// Mocks
import { getProfessionalDetail } from '../data/mockProfessionalDetails';

// Type for the route props of this screen
type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalDetail'>;

export const ProfessionalDetailScreen: React.FC<Props> = ({ route })=> {
    // Get the professionalId from navigation params
    const { professionalId } = route.params;

    // Fetch professional data (simulates API call)
    const professional = getProfessionalDetail(professionalId);

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
        ...Typography.body,
        color: Colors.semantic.error,
    }
})