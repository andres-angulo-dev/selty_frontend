import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// PROFILE STATS STRIP
// Row of key figures ("12 Annonces · 4 Offres actives · 127 Avis") on a cream
// band. Values and labels come from the caller; any number of tiles works,
// each one takes an equal share of the width.
// ============================================

export interface ProfileStat {
    value: string;                      // Already formatted ("127", "1,2k")
    label: string;
}

interface ProfileStatsStripProps {
    stats: ProfileStat[];
}

export const ProfileStatsStrip: React.FC<ProfileStatsStripProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                    {/* Thin vertical separator between tiles (not before the first) */}
                    {index > 0 ? <View style={styles.separator} /> : null}

                    {/* One tile: read "12 Annonces" as a single phrase */}
                    <View
                        style={styles.tile}
                        accessible
                        accessibilityLabel={`${stat.value} ${stat.label}`}
                    >
                        <Text style={styles.value}>{stat.value}</Text>
                        <Text style={styles.label} numberOfLines={1}>
                            {stat.label}
                        </Text>
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.surface,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md - Spacing.xs,  // 12px
    },
    tile: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    separator: {
        width: 1,
        height: 24,
        backgroundColor: Colors.neutral.border,
    },
    value: {
        ...Typography.h3,
        color: Colors.primary.main,
    },
    label: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
});
