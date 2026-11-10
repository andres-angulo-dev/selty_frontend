import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/shared/constants';

// ============================================
// FORM HEADER
// Header drawn by the app for full-screen forms: a text button on the left
// ("Annuler") and a title centered on the screen width.
// Why not the native header: on iOS the native header decides the title
// position itself and may stick it to the left button (`headerTitleAlign`
// only works on Android).
// Layout: [left button] [title, flex 1] [invisible spacer = button width].
// The spacer mirrors the measured button width, so the title is centered
// AND gets all the remaining room, whatever the text size of the phone.
// ============================================

interface FormHeaderProps {
    title: string;
    leftLabel: string;
    onLeftPress: () => void;
    backgroundColor?: string;       // Default: cream page background
}

const MIN_BAR_HEIGHT = 52;

export const FormHeader: React.FC<FormHeaderProps> = ({
    title,
    leftLabel,
    onLeftPress,
    backgroundColor = Colors.neutral.surface,
}) => {
    const insets = useSafeAreaInsets();

    // Width of the left button, measured once laid out (grows with the text size)
    const [sideWidth, setSideWidth] = useState(0);
    const onLeftLayout = (event: LayoutChangeEvent) => setSideWidth(event.nativeEvent.layout.width);

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
            <View style={styles.bar}>
                <Pressable
                    onPress={onLeftPress}
                    onLayout={onLeftLayout}
                    accessibilityRole="button"
                    hitSlop={Spacing.sm}
                >
                    <Text style={styles.leftText}>{leftLabel}</Text>
                </Pressable>

                <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
                    {title}
                </Text>

                {/* Mirror of the left button: balances the row so the title is centered */}
                <View style={{ width: sideWidth }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md + Spacing.xs,  // 20px, same margin as the form
    },
    bar: {
        minHeight: MIN_BAR_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        ...Typography.bodyBold,
        flex: 1,
        color: Colors.primary.main,
        textAlign: 'center',
    },
    leftText: {
        ...Typography.body,
        color: Colors.text.secondary,
    },
});
