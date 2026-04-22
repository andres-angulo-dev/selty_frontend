import React, { useRef, useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ImageBackground, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Banner } from '../types';

const BANNER_HEIGHT = 180;

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
    // Dynamic screen width — recalculates on orientation change or window resize
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const BANNER_WIDTH = SCREEN_WIDTH - Spacing.md * 2; // Subtract horizontal margins from both sides

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
    const handleScroll = (event: any) => {  // Calculates which banner is currently visible based on scroll position
        const offsetX = event.nativeEvent.contentOffset.x; // contentOffset.x = how many pixels the user has scrolled horizontally
        const index = Math.round(offsetX / BANNER_WIDTH); //  Math.round handles cases where the user is between two banners - vDivide by banner width to get the index (0, 1, 2...)
        setCurrentIndex(index);
    };

    // Shared inner content (same layout for gradient and solid banners)
    const renderBannerContent = (item: Banner) => (
        <>
            {/* Decorative circle — top-right corner, semi-transparent */}
            <View style={styles.decorativeCircle} />

            {/* Text block */}
            <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
            </View>

            {/* CTA button — only shown when ctaLabel is provided */}
            {item.ctaLabel && (
                <View style={styles.ctaButton}>
                    <Text style={styles.ctaText}>{item.ctaLabel}</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary.main} />
                </View>
            )}
        </>
    );

    // Render a single banner — priority: imageUrl > gradientColors > backgroundColor
    const renderBanner = ({ item }: { item: Banner }) => (
        <Pressable onPress={() => onBannerPress(item)} style={({ pressed }) => [pressed && styles.pressed]}>
            {item.imageUrl ? (
                // Photo background (advertisers / pros with real images)
                <ImageBackground
                    source={{ uri: item.imageUrl }}
                    style={[styles.banner, { width: BANNER_WIDTH }]}
                    imageStyle={{ borderRadius: 16 }}
                >
                    {/* Dark overlay so text stays readable on any photo */}
                    <View style={styles.imageOverlay} />
                    {renderBannerContent(item)}
                </ImageBackground>
            ) : item.gradientColors ? (
                // Gradient background (Sialty promo banners)
                <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.banner, { width: BANNER_WIDTH }]}
                >
                    {renderBannerContent(item)}
                </LinearGradient>
            ) : (
                // Solid color fallback
                <View style={[styles.banner, { width: BANNER_WIDTH, backgroundColor: item.backgroundColor }]}>
                    {renderBannerContent(item)}
                </View>
            )}
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {/* Banner carousel */}
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderBanner}
                keyExtractor={(item) => item.id}
                horizontal
                style={{ flexGrow: 0 }}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                    length: BANNER_WIDTH,   // No internal margin — outer container padding handles spacing
                    offset: BANNER_WIDTH * index,
                    index,
                })}
            />

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
        marginTop: Spacing.sm,
    },

    banner: {
        height: BANNER_HEIGHT,
        borderRadius: 16,
        padding: Spacing.lg,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },

    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.40)',
        borderRadius: 16,
    },

    decorativeCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.10)',
        top: -40,
        right: -40,
    },

    bannerContent: {
        maxWidth: 220,
    },

    bannerTitle: {
        ...Typography.h3,
        color: Colors.neutral.white,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },

    bannerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.80)',
        fontWeight: '500',
    },

    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.neutral.white,
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: 9999,
    },

    ctaText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary.main,
    },

    pressed: {
        opacity: 0.8,
    },

    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xs,
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