import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Annonce } from '@/features/annonce/types';
import { Review } from '@/features/profile/types';

// Components
import { HeroSection } from '../components/HeroSection';
import { ActionButtons } from '../components/ActionButtons';
import { StatsRow } from '../components/StatsRow';
import { AboutSection } from '../components/AboutSection';
import { TabSelector, TabName } from '../components/TabSelector'
import { ReviewSummary } from '../components/ReviewSummary';
import { ReviewCard } from '../components/ReviewCard';
import { AnnonceCard } from '@/shared/components/AnnonceCard';

// Constants
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

// Mocks
import { getProfessionalDetail } from '../data/mockProfessionalDetails';

// Union type for FlatList items (either Annonce or Review)
type ListItem = Annonce | Review;

// Type for the route props of this screen
type Props = NativeStackScreenProps<RootStackParamList, 'ProfessionalDetail'>;

export const ProfessionalDetailScreen: React.FC<Props> = ({ route, navigation })=> {
    // Active tab state - controls which content is shown
    const [activeTab, setActiveTab] = useState<TabName>('annonces');
    const [displayedCount, setDisplayedCount] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableSelectorY = useRef(0);

    const flatListRef = useRef<FlatList>(null); // Ref to access FlatList methods (scroll to top on tab change)
    const { professionalId } = route.params; // Get the professionalId from navigation params
    const professional = getProfessionalDetail(professionalId); // Fetch professional data (simulates API call)

    // Reset pagination and scroll to tabSelector when tab changes
    useEffect(() => {
        setDisplayedCount(10);
        flatListRef.current?.scrollToOffset({ offset: tableSelectorY.current, animated: true });
    }, [activeTab])

    // Handle case where professional is not found
    if (!professional) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.professional.notFound}</Text>
            </View>
        );
    }

    // Slice data based on current tab and displayed count
    const currentData: ListItem[] = activeTab === 'annonces' ? professional.annonces.slice(0, displayedCount) : professional.reviews.slice(0, displayedCount);

    // Total items for the current tab
    const totalItems = activeTab === 'annonces' ? professional.annonces.length : professional.reviews.length;

    // Load more items when reaching the end of the list
    const handleLoadMore = () => {
        if (isLoadingMore || displayedCount >= totalItems) return;

        setIsLoadingMore(true);
        // Simulate API delay
        setTimeout(() => {
            setDisplayedCount(prev => prev + 10);
            setIsLoadingMore(false);
        }, 500);
    };

    // Render each item based on active tab
    const renderItem = ({ item }: { item: ListItem }) => {
        if (activeTab === 'annonces') {
            return (
                <AnnonceCard 
                    annonce={item as Annonce}  // "item as Annonce" → type casting: we tell TypeScript, required because item is typed as ListItem (Annonce | Review)
                    onPress={(annonce) => navigation.navigate('AnnonceDetail', { annonceId: annonce.id})}
                    onLikePress={() => console.log('Like')}
                    onFavoritePress={() => console.log('Favorite')}
                    onCommentPress={(annonce) => navigation.navigate('CommentsModal', { annonceId: annonce.id})} 
                />
            );
        };
        return (
            <View style={styles.reviewItem}>
                <ReviewCard review={item as Review} />
            </View>
        );
    };

    // Static header content (rendered once above the list)
    const renderHeader = () => (
        <>
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
            <View onLayout={(event) => { tableSelectorY.current = event.nativeEvent.layout.y; }}>
                <TabSelector
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    annoncesCount={professional.annoncesCount}
                    reviewsCount={professional.reviewsCount}
                />
            </View>
             
            {/* Show review summary only on Avis tab */}
            {activeTab === 'avis' && (
                <>
                    {/* Global rating summary */}
                    <ReviewSummary reviews={professional.reviews} averageRating={professional.rating} />
            
                    {/* Title + separator before the review cards */}
                    {professional.reviewsCount !== 0 &&  (
                        <>
                            <Text style={styles.reviewTitle}>{Strings.professional.tabs.reviewsTitle}</Text>
                            <View style={styles.separator} />
                        </>
                    )}
                </>
            )}
        </>
    );

    // Show loading indicator at the bottom while fetching more
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <ActivityIndicator style={styles.loader} color={Colors.primary.main} />
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef} // Reference to control scroll programmatically
                data={currentData} // Data to display (annonces OR reviews)
                keyExtractor={(item) => item.id}
                renderItem={renderItem}  // Function called for each item in data
                ListHeaderComponent={renderHeader}  // Rendered ONCE above the list, displayed before renderItem
                ListFooterComponent={renderFooter} // Rendered ONCE below the list, displayed after renderItem
                onEndReached={handleLoadMore} // At xx% of the end, triggers the display of 10 additional items
                onEndReachedThreshold={0.5} // xx% to trigger display of 10 additional items
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    )
}

const styles = StyleSheet.create({
     container: {
      flex: 1,
      backgroundColor: Colors.neutral.background,
    },
    
    contentContainer: {
        paddingBottom: Spacing.xl,
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

    reviewItem: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
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

    loader: {
        paddingVertical: Spacing.lg,
    },
})