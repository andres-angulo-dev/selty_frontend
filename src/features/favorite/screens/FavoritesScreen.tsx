import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList, RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { Annonce, FavoriteKind, Offer, Professional } from '@/shared/types';
import { SegmentedControl, Segment } from '@/shared/components/SegmentedControl';
import { EmptyState } from '@/shared/components/EmptyState';
import { ProfessionalRowCard } from '@/shared/components/ProfessionalRowCard';
import { MediaRowCard } from '@/shared/components/MediaRowCard';
import { UnavailableCard } from '@/shared/components/UnavailableCard';
import { useRemoveFavorite } from '@/shared/hooks/useFavorite';
import { useFavoriteItems, FavoriteListItem } from '../hooks/useFavoriteItems';

// ============================================
// FAVORITES TAB (individuals)
// Saved professionals, annonces and offers (favorites store), one segment
// each, all as full-width rows. Tapping a row opens its detail; the bookmark
// on the right removes the favorite right away.
// A favorite that can no longer be opened (deleted, ended offer) stays in
// place as a greyed UnavailableCard with a "Retirer" action.
// ============================================

type FavoritesNavigation = CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList, 'Favorites'>,
    NativeStackNavigationProp<RootStackParamList>
>;

const texts = Strings.favorites;

// Page side padding
const PAGE_PADDING = Spacing.md;

export const FavoritesScreen: React.FC = () => {
    const navigation = useNavigation<FavoritesNavigation>();
    const [segment, setSegment] = useState<FavoriteKind>('professional');

    const { professionals, annonces, offers } = useFavoriteItems();
    const removeFavorite = useRemoveFavorite();

    // Counts come from the store, so they update as soon as an item is (un)saved
    const segments: Segment<FavoriteKind>[] = [
        { key: 'professional', label: texts.segments.professional, count: professionals.length },
        { key: 'annonce', label: texts.segments.annonce, count: annonces.length },
        { key: 'offer', label: texts.segments.offer, count: offers.length },
    ];

    // ── Shared pieces ──────────────────────────────────────────────────────

    /** Filled bookmark on the right of a row: removes the favorite */
    const renderBookmark = useCallback((kind: FavoriteKind, id: string, name: string) => (
        <Pressable
            onPress={() => removeFavorite(kind, id)}
            hitSlop={8}
            style={({ pressed }) => [styles.bookmarkButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={texts.removeNamed(name)}
        >
            <Ionicons name="bookmark" size={22} color={Colors.primary.main} />
        </Pressable>
    ), [removeFavorite]);

    /** Greyed row for a favorite that can no longer be opened */
    const renderUnavailable = useCallback(
        (kind: FavoriteKind, entry: FavoriteListItem<unknown>) => {
            if (entry.status === 'available') {
                return null;
            }
            return (
                <UnavailableCard
                    title={entry.snapshot.title}
                    subtitle={entry.snapshot.subtitle}
                    imageUrl={entry.snapshot.imageUrl}
                    message={texts.unavailable[kind][entry.status]}
                    removeLabel={texts.removeAction}
                    removeAccessibilityLabel={texts.removeNamed(entry.snapshot.title)}
                    onRemove={() => removeFavorite(kind, entry.id)}
                    layout="row"
                    // A person gets a round picture, a content a square one
                    imageShape={kind === 'professional' ? 'circle' : 'square'}
                />
            );
        },
        [removeFavorite],
    );

    // ── Row renderers (stable references for FlatList) ─────────────────────

    const renderProfessional = useCallback(({ item: entry }: { item: FavoriteListItem<Professional> }) => {
        if (entry.status !== 'available') {
            return renderUnavailable('professional', entry);
        }
        const item = entry.item;
        const name = `${item.firstName} ${item.lastName}`;
        return (
            <ProfessionalRowCard
                name={name}
                subtitle={`${item.profession} · ${item.city} (${item.department})`}
                avatarUrl={item.avatar}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                reviewsLabel={texts.reviews}
                isVerified={item.isCertified}
                verifiedLabel={texts.verified}
                onPress={() => navigation.navigate('ProfessionalDetail', { professionalId: item.id })}
                trailing={renderBookmark('professional', item.id, name)}
            />
        );
    }, [navigation, renderBookmark, renderUnavailable]);

    const renderAnnonce = useCallback(({ item: entry }: { item: FavoriteListItem<Annonce> }) => {
        if (entry.status !== 'available') {
            return renderUnavailable('annonce', entry);
        }
        const item = entry.item;
        return (
            <MediaRowCard
                title={item.title}
                subtitle={`${item.city} (${item.department})`}
                imageUrl={item.images[0]}
                badge={item.category ? { label: item.category.name, tone: 'neutral' } : undefined}
                onPress={() => navigation.navigate('AnnonceDetail', { annonceId: item.id })}
                trailing={renderBookmark('annonce', item.id, item.title)}
            />
        );
    }, [navigation, renderBookmark, renderUnavailable]);

    const renderOffer = useCallback(({ item: entry }: { item: FavoriteListItem<Offer> }) => {
        if (entry.status !== 'available') {
            return renderUnavailable('offer', entry);
        }
        const item = entry.item;
        return (
            <MediaRowCard
                title={item.title}
                subtitle={item.professional ? `${item.professional.firstName} ${item.professional.lastName}` : undefined}
                imageUrl={item.image}
                placeholderIcon="pricetag-outline"
                badge={{ label: item.discount, tone: 'danger' }}
                onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
                trailing={renderBookmark('offer', item.id, item.title)}
            />
        );
    }, [navigation, renderBookmark, renderUnavailable]);

    // ── Content of the selected segment ────────────────────────────────────

    const renderContent = () => {
        // Same empty state for the 3 segments, only the texts change
        const isEmpty =
            (segment === 'professional' && professionals.length === 0) ||
            (segment === 'annonce' && annonces.length === 0) ||
            (segment === 'offer' && offers.length === 0);

        if (isEmpty) {
            return (
                <EmptyState
                    icon="bookmark-outline"
                    title={texts.empty[segment]}
                    message={texts.emptyHint[segment]}
                    actionLabel={texts.explore}
                    onAction={() => navigation.navigate('Home')}
                />
            );
        }

        // Same list settings for the 3 segments; `key` resets the scroll on segment change
        const listProps = {
            keyExtractor: (item: { id: string }) => item.id,
            contentContainerStyle: styles.listContent,
            ItemSeparatorComponent: RowSeparator,
            showsVerticalScrollIndicator: false,
        };

        if (segment === 'professional') {
            return <FlatList key="professional" data={professionals} renderItem={renderProfessional} {...listProps} />;
        }
        if (segment === 'annonce') {
            return <FlatList key="annonce" data={annonces} renderItem={renderAnnonce} {...listProps} />;
        }
        return <FlatList key="offer" data={offers} renderItem={renderOffer} {...listProps} />;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header: large title + subtitle */}
            <View style={styles.header}>
                <Text style={styles.title} accessibilityRole="header">{texts.title}</Text>
                <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>

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

    header: {
        paddingHorizontal: PAGE_PADDING,
        marginTop: Spacing.sm,
        marginBottom: Spacing.md,
    },

    // Same large title as the Profile tab (h2, navy)
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
    },

    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
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

    bookmarkButton: {
        padding: Spacing.xs,
    },

    pressed: {
        opacity: 0.6,
    },
});
