import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PublicationSegment, RootStackParamList, RootTabParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import type { Annonce, Offer } from '@/shared/types';
import { SegmentedControl, Segment } from '@/shared/components/SegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { MediaRowCard } from '@/shared/components/MediaRowCard';
import { useMyPublications } from '@/shared/hooks/usePublications';
import { getAnnonceRow, getOfferRow } from '../utils/publicationRows';

// ============================================
// MY PUBLICATIONS (professionals)
// Takes the Favorites slot for a pro: the annonces and offers they published,
// most recent first, each opening its detail page. Editing and disabling come
// later. Kept in memory until the backend exists.
// ============================================

type PublicationsNavigation = CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList, 'MyPublications'>,
    NativeStackNavigationProp<RootStackParamList>
>;

const texts = Strings.publication;
const PAGE_PADDING = Spacing.md;

export const MyPublicationsScreen: React.FC = () => {
    const navigation = useNavigation<PublicationsNavigation>();
    const { params } = useRoute<RouteProp<RootTabParamList, 'MyPublications'>>();
    const { annonces, offers } = useMyPublications();
    const [segment, setSegment] = useState<PublicationSegment>('annonce');

    // Opened on a given segment ("Mes offres", confirmation). The param is then
    // cleared: the same request later would otherwise change nothing, so it would not fire.
    const requestedSegment = params?.segment;
    useEffect(() => {
        if (!requestedSegment) return;
        setSegment(requestedSegment);
        navigation.setParams({ segment: undefined });
    }, [requestedSegment, navigation]);

    const renderAnnonce = useCallback(({ item }: { item: Annonce }) => {
        const row = getAnnonceRow(item);
        return (
            <MediaRowCard
                title={item.title}
                subtitle={row.subtitle}
                imageUrl={item.images[0]}
                placeholderIcon="megaphone-outline"
                badge={row.badge}
                onPress={() => navigation.navigate('AnnonceDetail', { annonceId: item.id })}
            />
        );
    }, [navigation]);

    const renderOffer = useCallback(({ item }: { item: Offer }) => {
        const row = getOfferRow(item);
        return (
            <MediaRowCard
                title={item.title}
                subtitle={row.subtitle}
                imageUrl={item.image}
                placeholderIcon="pricetag-outline"
                badge={row.badge}
                onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
            />
        );
    }, [navigation]);

    const segments: Segment<PublicationSegment>[] = [
        { key: 'annonce', label: texts.segments.annonce, count: annonces.length },
        { key: 'offer', label: texts.segments.offer, count: offers.length },
    ];

    const renderContent = () => {
        const isEmpty = segment === 'annonce' ? annonces.length === 0 : offers.length === 0;
        if (isEmpty) {
            return (
                <EmptyState
                    icon={segment === 'annonce' ? 'megaphone-outline' : 'pricetag-outline'}
                    title={texts.empty[segment].title}
                    message={texts.empty[segment].message}
                />
            );
        }

        // Same list settings for the 2 segments; `key` resets the scroll on segment change
        const listProps = {
            keyExtractor: (item: { id: string }) => item.id,
            contentContainerStyle: styles.listContent,
            ItemSeparatorComponent: RowSeparator,
            showsVerticalScrollIndicator: false,
        };

        return segment === 'annonce'
            ? <FlatList key="annonce" data={annonces} renderItem={renderAnnonce} {...listProps} />
            : <FlatList key="offer" data={offers} renderItem={renderOffer} {...listProps} />;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Text style={styles.title} accessibilityRole="header">{texts.title}</Text>

            <SegmentedControl
                segments={segments}
                value={segment}
                onChange={setSegment}
                style={styles.segmented}
            />

            {/* flex: 1 wrapper so the lists scroll and the empty state centers */}
            <View style={styles.content}>{renderContent()}</View>
        </SafeAreaView>
    );
};

/** Vertical space between two rows */
const RowSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    // Same large title as the Favorites and Profile tabs
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
        paddingHorizontal: PAGE_PADDING,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
    },
    segmented: {
        marginHorizontal: PAGE_PADDING,
        marginBottom: Spacing.md,
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: PAGE_PADDING,
        paddingBottom: Spacing.xl,
    },
    separator: {
        height: Spacing.sm + Spacing.xs,
    },
});
