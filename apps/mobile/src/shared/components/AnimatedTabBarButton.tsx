// Animation of the icons in the navigation tab bar
import React from 'react';
import { Pressable, Animated } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useTabScaleAnimation } from '@/shared/hooks/useTabScaleAnimation';

// Standard tab button: the icon and label drawn by the navigator (children),
// wrapped in the shared spring animation (press = 0.85, active = 1.15)
export const AnimatedTabBarButton: React.FC<BottomTabBarButtonProps> = ({
    children,
    onPress,
    'aria-selected': isSelected,
}) => {
    const { scale, onPressIn, onPressOut } = useTabScaleAnimation(isSelected ?? false);

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} style={{ flex: 1 }}>
            <Animated.View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale }],
                }}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
};
