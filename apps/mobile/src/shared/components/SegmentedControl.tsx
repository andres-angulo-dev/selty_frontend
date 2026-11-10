import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// SEGMENTED CONTROL
// Equal-width segments, one selected (navy pill), optional count badge.
// Generic on the key type: the caller passes its own union ('pro' | 'annonce'...)
// and every label, so the component works in any app.
// Label on top, count below, in EVERY segment: with enlarged text a label
// that wraps on its own would misalign the counts between segments (seen on
// the dev's iPhone), so the layout never depends on the text width.
// ============================================

export interface Segment<T extends string> {
    key: T;
    label: string;
    count?: number;          // Shown as a small badge after the label
}

interface SegmentedControlProps<T extends string> {
    segments: Segment<T>[];
    value: T;                            // Selected key
    onChange: (key: T) => void;
    style?: StyleProp<ViewStyle>;
}

export const SegmentedControl = <T extends string>({
    segments,
    value,
    onChange,
    style,
}: SegmentedControlProps<T>) => {
    return (
        <View style={[styles.container, style]} accessibilityRole="tablist">
            {segments.map((segment) => {
                const isSelected = segment.key === value;
                return (
                    <Pressable
                        key={segment.key}
                        onPress={() => onChange(segment.key)}
                        style={({ pressed }) => [
                            styles.segment,
                            isSelected ? styles.segmentSelected : styles.segmentIdle,
                            pressed && !isSelected && styles.pressed,
                        ]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        // "Annonces, 3" read as one item by VoiceOver
                        accessibilityLabel={
                            segment.count !== undefined ? `${segment.label}, ${segment.count}` : segment.label
                        }
                    >
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>
                            {segment.label}
                        </Text>
                        {segment.count !== undefined && (
                            <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                                <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                                    {segment.count}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    // Light track behind the segments
    container: {
        flexDirection: 'row',
        gap: Spacing.xs,
        padding: Spacing.xs,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.neutral.border,
    },

    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',         // all segments stretch to the tallest one, content stays centered
        gap: Spacing.xs,
        minHeight: 40,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        borderRadius: BorderRadius.md,
    },

    segmentIdle: {
        backgroundColor: Colors.neutral.white,
    },

    segmentSelected: {
        backgroundColor: Colors.primary.main,
    },

    pressed: {
        opacity: 0.7,
    },

    label: {
        ...Typography.label,
        color: Colors.text.secondary,
        textAlign: 'center',
    },

    labelSelected: {
        color: Colors.text.inverse,
    },

    badge: {
        minWidth: 20,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.inputBg,
        alignItems: 'center',
    },

    badgeSelected: {
        backgroundColor: Colors.overlay.whiteSubtle,
    },

    badgeText: {
        ...Typography.caption,
        color: Colors.text.secondary,
        fontWeight: '600',
    },

    badgeTextSelected: {
        color: Colors.text.inverse,
    },
});
