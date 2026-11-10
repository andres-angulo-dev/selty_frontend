import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// STEP SLIDER
// A scale with fixed stops: tap a stop or drag along the line. The stops are
// evenly spaced whatever their values (0, 1, 3, 5, 10, 20...), which a standard
// slider with a regular step cannot do. No package needed.
// Screen readers: "adjustable" role, swipe up/down changes the stop.
// Controlled: the parent owns `value`. `formatValue` gives the text read aloud.
// ============================================

interface StepSliderProps {
    steps: readonly number[];
    value: number;
    onChange: (value: number) => void;
    formatValue: (value: number) => string;
    accessibilityLabel: string;
}

const THUMB_SIZE = 28;
const STOP_SIZE = 8;
const LABEL_WIDTH = 34;

export const StepSlider: React.FC<StepSliderProps> = ({ steps, value, onChange, formatValue, accessibilityLabel }) => {
    const [width, setWidth] = useState(0);
    const currentIndex = Math.max(0, steps.indexOf(value));

    // Room on both sides so the thumb and the labels stay inside the component
    const padding = Math.max(THUMB_SIZE, LABEL_WIDTH) / 2;
    const spacing = width > 0 ? (width - padding * 2) / (steps.length - 1) : 0;
    const positionOf = (index: number) => padding + index * spacing;

    // The responder is created once: it reads the latest values through this ref
    const latest = useRef({ steps, spacing, padding, onChange, value });
    latest.current = { steps, spacing, padding, onChange, value };
    const startX = useRef(0);

    /** Goes to the stop nearest to a horizontal position, only if it changed */
    const moveTo = (x: number) => {
        const current = latest.current;
        if (current.spacing === 0) {
            return;
        }
        const index = Math.round((x - current.padding) / current.spacing);
        const next = current.steps[Math.min(current.steps.length - 1, Math.max(0, index))];
        if (next !== current.value) {
            current.onChange(next);
        }
    };

    const responder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            // The form's ScrollView must not take over while dragging
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: (event) => {
                startX.current = event.nativeEvent.locationX;
                moveTo(startX.current);
            },
            onPanResponderMove: (_event, gesture) => moveTo(startX.current + gesture.dx),
        }),
    ).current;

    const shift = (delta: number) => {
        const next = steps[currentIndex + delta];
        if (next !== undefined) {
            onChange(next);
        }
    };

    return (
        <View
            {...responder.panHandlers}
            // Touches always land on this view, so locationX is measured from its left edge
            pointerEvents="box-only"
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
            style={styles.container}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={accessibilityLabel}
            accessibilityValue={{ text: formatValue(value) }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(event) => shift(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
            {width > 0 ? (
                <>
                    <View style={[styles.track, { left: padding, right: padding }]} />
                    <View style={[styles.trackActive, { left: padding, width: currentIndex * spacing }]} />
                    {steps.map((step, index) => (
                        <View
                            key={step}
                            style={[
                                styles.stop,
                                index <= currentIndex && styles.stopActive,
                                { left: positionOf(index) - STOP_SIZE / 2 },
                            ]}
                        />
                    ))}
                    <View style={[styles.thumb, { left: positionOf(currentIndex) - THUMB_SIZE / 2 }]} />
                    {steps.map((step, index) => (
                        <Text
                            key={step}
                            // 9 numbers on one line: enlarged text is capped so they do not collide
                            maxFontSizeMultiplier={1.1}
                            numberOfLines={1}
                            style={[
                                styles.label,
                                index === currentIndex && styles.labelActive,
                                { left: positionOf(index) - LABEL_WIDTH / 2 },
                            ]}
                        >
                            {step}
                        </Text>
                    ))}
                </>
            ) : null}
        </View>
    );
};

const TRACK_Y = THUMB_SIZE / 2;

const styles = StyleSheet.create({
    container: {
        height: THUMB_SIZE + Spacing.lg,
        marginVertical: Spacing.sm,
    },
    track: {
        position: 'absolute',
        top: TRACK_Y - 2,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.neutral.border,
    },
    trackActive: {
        position: 'absolute',
        top: TRACK_Y - 2,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary.main,
    },
    stop: {
        position: 'absolute',
        top: TRACK_Y - STOP_SIZE / 2,
        width: STOP_SIZE,
        height: STOP_SIZE,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.border,
    },
    stopActive: {
        backgroundColor: Colors.primary.main,
    },
    thumb: {
        position: 'absolute',
        top: 0,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: Colors.primary.main,
        borderWidth: 3,
        borderColor: Colors.neutral.white,
        ...Colors.shadow.card,
    },
    label: {
        ...Typography.caption,
        position: 'absolute',
        top: THUMB_SIZE + 2,
        width: LABEL_WIDTH,
        textAlign: 'center',
        color: Colors.text.secondary,
    },
    labelActive: {
        color: Colors.primary.main,
        fontWeight: '700',
    },
});
