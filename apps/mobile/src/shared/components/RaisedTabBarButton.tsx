import React from 'react';
import { Pressable, Animated, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Colors, FontSize } from '@/shared/constants';
import { useTabScaleAnimation } from '@/shared/hooks/useTabScaleAnimation';

// ============================================
// RAISED TAB BAR BUTTON
// Central tab drawn as a round button that sticks out above the tab bar
// (e.g. "Publier"). It ignores the icon and label drawn by the navigator
// and renders its own: icon in a filled circle, label underneath.
// Icon, label and colors come from the caller, so any app can reuse it.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface RaisedTabBarButtonProps extends BottomTabBarButtonProps {
    icon: IoniconName;
    label: string;
    circleColor?: string;    // Default brand navy
    iconColor?: string;      // Default white
    ringColor?: string;      // Optional ring around the circle; no ring when omitted
    activeLabelColor?: string;
    inactiveLabelColor?: string;
}

const CIRCLE_SIZE = 56;
const RAISE = 22;            // How far the circle rises above the bar
const RING_WIDTH = 4;        // Visible only when the caller passes ringColor
const RING_SIZE = CIRCLE_SIZE + RING_WIDTH * 2;

export const RaisedTabBarButton: React.FC<RaisedTabBarButtonProps> = ({
    onPress,
    'aria-selected': isSelected,
    icon,
    label,
    circleColor = Colors.primary.main,
    iconColor = Colors.text.inverse,
    ringColor,
    activeLabelColor = Colors.primary.main,
    inactiveLabelColor = Colors.text.tertiary,
}) => {
    const focused = isSelected ?? false;

    // Calmer than the other tabs: the circle is already big, it must not grow
    const { scale, onPressIn, onPressOut } = useTabScaleAnimation(focused, {
        activeScale: 1,
        pressedScale: 0.9,
    });

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            // The custom drawing hides the navigator's own label, so the
            // accessibility info is set here: "Publier, onglet, sélectionné"
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            style={styles.pressable}
        >
            {/* Ring = a bigger disc behind the circle, not a border: on iOS a
                rounded border lets the inner color bleed at its outer edge,
                which draws a thin dark outline around the ring */}
            <Animated.View
                style={[
                    styles.ring,
                    { backgroundColor: ringColor ?? 'transparent', transform: [{ scale }] },
                ]}
            >
                <View style={[styles.circle, { backgroundColor: circleColor }]}>
                    <Ionicons name={icon} size={30} color={iconColor} />
                </View>
            </Animated.View>

            <Text
                style={[styles.label, { color: focused ? activeLabelColor : inactiveLabelColor }]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    // Fills its tab slot; content starts at the top so the circle can rise
    pressable: {
        flex: 1,
        alignItems: 'center',
    },

    // Outer disc (ring color, or transparent). The negative margin pulls it
    // above the bar; the tab bar does not clip its children (overflow visible).
    ring: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        marginTop: -RAISE - RING_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },

    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        // No shadow on purpose: it outlines the ring in grey and detaches it
        // from the bar. Without it, a ring in the bar color melts into the bar.
    },

    // Same size and weight as the navigator's default tab labels
    // (bottom-tabs: fontSize 10, theme "medium" font). No top margin: with it,
    // the label sat ~2pt lower than its neighbours on device.
    label: {
        fontSize: FontSize.xxs,
        fontWeight: '500',
    },
});
