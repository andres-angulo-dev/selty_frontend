import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Alert, View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Annonce, Review } from '@/shared/types';

// Components
import { HeroSection } from '../components/HeroSection';
import { ActionButtons } from '../components/ActionButtons';
import { StatsRow } from '../components/StatsRow';
import { AboutSection } from '../components/AboutSection';
import { ServiceZonesSection } from '../components/ServiceZonesSection';
import { TabSelector, TabName } from '../components/TabSelector'
import { ReviewSummary } from '../components/ReviewSummary';
import { ReviewCard } from '../components/ReviewCard';
import { AnnonceListCard } from '../components/AnnonceListCard';

// Constants
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { useFavorite } from '@/shared/hooks/useFavorite';
import { useAccountType } from '@/app/providers/AccountTypeProvider';
import { snapshotFromProfessional } from '@/shared/utils/favoriteSnapshot';
import { getProfessionLabel } from '@/shared/utils/professionLabel';
import { getProfessionalMapData } from '@/shared/utils/professionalMap';
import { describeZonesCaption } from '@/shared/utils/zoneLabels';
import { useProfessionalServiceArea } from '@/shared/hooks/useProfessionalServiceArea';
import { useAnnonces } from '@/shared/hooks/usePublications';

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
    // Fetch professional data (simulates API call). Memoized: this call builds a new object each
    // time, which would make every useMemo depending on it useless.
    const professional = useMemo(() => getProfessionalDetail(professionalId), [professionalId]);
    // Copy kept with the favorite (shown greyed if the profile disappears). Memoized: a new
    // object at each render would recreate the toggle callback for nothing.
    const favoriteSnapshot = useMemo(
        () => (professional ? snapshotFromProfessional(professional) : undefined),
        [professional],
    );
    const favorite = useFavorite('professional', professionalId, favoriteSnapshot); // Saved state, shared with the Favorites tab
    // Favorites are for individuals: a professional does not save other people's content
    const { isProfessional } = useAccountType();
    // Real trades and zones; the signed-in pro's own page follows "Mes zones" at once
    const serviceArea = useProfessionalServiceArea(professional);
    // Their annonces, published ones first: the count on the page always matches the list
    const allAnnonces = useAnnonces();
    const annonces = useMemo(
        () => allAnnonces.filter((annonce) => annonce.professionalId === professionalId),
        [allAnnonces, professionalId],
    );

    // Reset pagination and scroll to tabSelector when tab changes
    useEffect(() => {
        setDisplayedCount(10);
        flatListRef.current?.scrollToOffset({ offset: tableSelectorY.current, animated: true });
    }, [activeTab])

    // Render each item based on active tab
    // useCallback: stable reference prevents FlatList from re-rendering all items on every state change
    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (activeTab === 'annonces') {
            return (
                <AnnonceListCard
                    annonce={item as Annonce}
                    onPress={(annonce) => navigation.navigate('AnnonceDetail', { annonceId: annonce.id })}
                />
            );
        }
        return (
            <View style={styles.reviewItem}>
                <ReviewCard review={item as Review} />
            </View>
        );
    }, [activeTab, navigation]);

    // Header content above the list. A plain function called below at each render: React updates
    // what changed without rebuilding it, and it can never show an outdated favorite state.
    // Guard inside: professional may be undefined before the early return check below
    const renderHeader = () => {
        if (!professional) return null;
        const mapData = getProfessionalMapData(professional, serviceArea.zones);
        return (
            <>
                {/* Hero: avatar, name, profession, location */}
                <HeroSection
                    avatar={professional.avatar}
                    firstName={professional.firstName}
                    lastName={professional.lastName}
                    profession={getProfessionLabel(serviceArea.tradeIds)}
                    city={professional.city}
                    department={professional.department}
                    isAvailable={professional.isAvailable}
                />

                {/* Stats: rating, annonce count, member since — overlaps hero bottom */}
                <StatsRow
                    rating={professional.rating}
                    reviewsCount={professional.reviewsCount}
                    annoncesCount={annonces.length}
                    createdAt={professional.createdAt}
                />

                {/* Actions buttons: call, message, favorite, share */}
                <ActionButtons
                    phone={professional.phone}
                    firstName={professional.firstName}
                    lastName={professional.lastName}
                    profession={getProfessionLabel(serviceArea.tradeIds)}
                    isFavorite={favorite.isFavorite}
                    onMessagePress={() => Alert.alert(Strings.messaging.comingSoonTitle, Strings.messaging.comingSoonMessage)}
                    onFavoritePress={isProfessional ? undefined : favorite.toggle}
                />

                {/* About (description + services) */}
                <AboutSection
                    description={professional.description}
                    services={professional.services}
                />

                {/* Where they work: the caption names the zones, never the city of the profile
                    (a pro living in Melun may work only in Romainville) */}
                <ServiceZonesSection
                    title={Strings.professional.zones.title}
                    zones={serviceArea.zones}
                    caption={describeZonesCaption(serviceArea.zones, professional.city)}
                    mapData={mapData}
                    onMapPress={() => {
                        if (!mapData) return;
                        navigation.navigate('LocationMap', {
                            title: `${professional.firstName} ${professional.lastName}`,
                            caption: describeZonesCaption(serviceArea.zones, professional.city),
                            markers: mapData.markers,
                            zones: mapData.zones,
                            areas: mapData.areas,
                        });
                    }}
                />

                {/* Tab selector (Annonces | Avis) */}
                <View onLayout={(event) => { tableSelectorY.current = event.nativeEvent.layout.y; }}>
                    <TabSelector
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        annoncesCount={annonces.length}
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
    };

    // Handle case where professional is not found
    if (!professional) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.professional.notFound}</Text>
            </View>
        );
    }

    // Slice data based on current tab and displayed count
    const currentData: ListItem[] = activeTab === 'annonces' ? annonces.slice(0, displayedCount) : professional.reviews.slice(0, displayedCount);

    // Total items for the current tab
    const totalItems = activeTab === 'annonces' ? annonces.length : professional.reviews.length;

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
                // An element, not the function: a function changing at each render counts as a new
                // component, so React would rebuild the header (and reload the map) on every tab change
                ListHeaderComponent={renderHeader() ?? undefined}
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
      backgroundColor: Colors.neutral.surface,   // Gray-cream page background
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