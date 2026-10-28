import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// MAP PLACEHOLDER
// Static stand-in for a map (no SDK, no API key): grey block with a pin
// in a brand-colored circle, plus an optional caption underneath.
// Replace by a real MapView later without touching the callers: keep the
// same `height` / `caption` contract.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MapPlaceholderProps {
    height?: number;                 // Block height, default 140
    caption?: string;                // e.g. "Paris et alentours"
    captionIcon?: IoniconName;       // Icon before the caption, default 'navigate-outline'
    pinIcon?: IoniconName;           // Icon inside the circle, default 'location'
    style?: StyleProp<ViewStyle>;    // Wrapper override (margins from the parent)
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
    height = 140,
    caption,
    captionIcon = 'navigate-outline',
    pinIcon = 'location',
    style,
}) => {
    return (
        <View style={style}>
            {/* Grey map block with centered pin */}
            <View style={[styles.map, { height }]}>
                <View style={styles.pinCircle}>
                    <Ionicons name={pinIcon} size={20} color={Colors.text.inverse} />
                </View>
            </View>

            {/* Caption row */}
            {caption && (
                <View style={styles.captionRow}>
                    <Ionicons name={captionIcon} size={14} color={Colors.text.tertiary} />
                    <Text style={styles.caption}>{caption}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    map: {
        backgroundColor: Colors.neutral.inputBg,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 40px brand circle: the pin reads on the light grey background
    pinCircle: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        ...Colors.shadow.card,
    },

    captionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },

    caption: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },
});
