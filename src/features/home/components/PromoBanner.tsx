import React, { useRef, useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native'
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Banner } from '../types';

//Get screen width for full-width banners
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - Spacing.md * 2; // Banner takes full width minus left + right margins
const BANNER_HEIGHT = 150;

interface PromoBannerProps {
    banners: Banner[];
    onBannerPress: (banner: Banner) => void;
    autoScrollInterval?: number;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
    banners,
    onBannerPress,
    autoScrollInterval = 4000, // Time between auto-scrolls in ms
}) => {
    // Track current banner index
    const [currentIndex, setCurrentIndex] = useState(0); // State: which banner is currently visible (0, 1, 2...)
    const flatListRef = useRef<FlatList>(null); // A reference to the FlatList component, this allows us to call methods on it (like scrollToIndex), unlike useState, changing a ref does NOT cause a re-render

    // Auto-scroll effect
    useEffect(() => {
        if (banners.length <= 1 ) return; // If there's only 1 banner (or none), no need to auto-scroll

        const interval = setInterval(() => { // Repeats a function every X milliseconds
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % banners.length; // Calculate next index with modulo (%) to loop back to 0, example with 3 banners: 0 -> 1 -> 2 -> 0 -> 1 -> 2 -> ... (0 + 1) % 3 = 1, (1 + 1) % 3 = 2, (2 + 1) % 3 = 0

                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true }); // Programmatically scroll the FlatList to the next banner
                return nextIndex;
            })
        }, autoScrollInterval);

        return () => clearInterval(interval); // ClearInterval stops the timer to prevent memory leaks, without this, the timer would keep running even after leaving the screen
    }, [banners.length, autoScrollInterval]); // Dependencies array: re-run this effect only if these values change

    // manual-scroll effect - Update current index on manual scroll
    const handleScrooll = (event: any) => {  // Calculates which banner is currently visible based on scroll position
        const offsetX = event.nativeEvent.contentOffset.x; // contentOffset.x = how many pixels the user has scrolled horizontally
        const index = Math.round(offsetX / BANNER_WIDTH); //  Math.round handles cases where the user is between two banners - vDivide by banner width to get the index (0, 1, 2...)
        setCurrentIndex(index);
    };

    // Render a single banner
    const renderBanner = ({ item }: {item: Banner }) => ( // FlatList calls this function for each item in the data array, { item } is destructured from { item, index } provided by FlatList
        <Pressable onPress={() => onBannerPress(item)} style={({ pressed }) => [pressed && styles.pressed]}>
            <View style={[styles.banner, {backgroundColor: item.backgroundColor }]}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Banner carousel */}
            <FlatList ref={flatListRef} data={banners} renderItem={renderBanner} keyExtractor={(item) => item.id} horizontal style={{ flexGrow: 0 }} pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScrooll} scrollEventThrottle={16} />

            {/* Dot indicators */}
            <View style={styles.dotsContainer}>
                {banners.map((_, index) => (
                    <View key={index} style={[ styles.dot, index === currentIndex && styles.dotActive ]} />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.sm,
    },

    banner: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        borderRadius: 12,
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        justifyContent: 'center',
    },

    pressed: {
        opacity: 0.8,
    },

    bannerTitle: {
        ...Typography.h3,
        color: Colors.neutral.white,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },

    bannerSubtitle: {
        ...Typography.body,
        color: Colors.neutral.white,
        opacity: 0.9,
    },

    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.neutral.border,
        marginHorizontal: 4,
    },

    dotActive: {
        backgroundColor: Colors.primary.main,
        width: 20,
    },
})