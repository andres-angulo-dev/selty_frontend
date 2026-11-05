import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// ============================================
// TAB SCALE ANIMATION
// Spring "press" animation shared by the tab bar buttons:
// - pressing down shrinks the button
// - releasing springs it to its resting size (bigger when the tab is active)
// - switching tabs animates between the active and inactive sizes
// Transform only, so it runs on the native thread (useNativeDriver: true).
// ============================================

interface TabScaleOptions {
    activeScale?: number;    // Size of the selected tab (default 1.15)
    inactiveScale?: number;  // Size of an unselected tab (default 1)
    pressedScale?: number;   // Size while the finger is down (default 0.85)
}

// Same spring feel for every movement
const SPRING = { useNativeDriver: true, friction: 6, tension: 120 } as const;

/**
 * @param focused true when the tab is the selected one
 * @param options optional scale values, to tune a button that must stay calmer
 * @returns the Animated value to put in a transform, and the two press handlers
 */
export const useTabScaleAnimation = (focused: boolean, options: TabScaleOptions = {}) => {
    const { activeScale = 1.15, inactiveScale = 1, pressedScale = 0.85 } = options;
    const restingScale = focused ? activeScale : inactiveScale;

    // Starts at the resting size so a tab mounted as active does not "jump"
    const scale = useRef(new Animated.Value(restingScale)).current;

    const springTo = (toValue: number) => Animated.spring(scale, { toValue, ...SPRING }).start();

    // Tab switched (by a tap or by code): animate to the new resting size
    useEffect(() => {
        springTo(restingScale);
        // springTo is left out of the deps: it only uses `scale`, which never changes
    }, [restingScale]);

    return {
        scale,
        onPressIn: () => springTo(pressedScale),
        // Released (or finger slid away): back to the resting size. If the tap
        // selects the tab, the effect above then grows it to the active size.
        onPressOut: () => springTo(restingScale),
    };
};
