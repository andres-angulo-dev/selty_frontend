import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// CHOICE CARD
// Large tappable white card used to pick one path among a few
// (e.g. "Publier une annonce" / "Créer une offre"): icon tile, title,
// description, chevron. Every text comes from the caller.
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ChoiceCardProps {
    icon: IoniconName;
    title: string;
    description: string;
    onPress: () => void;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({ icon, title, description, onPress }) => {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            // One sentence for screen readers: "Publier une annonce, Présentez un service…"
            accessibilityLabel={`${title}, ${description}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.iconTile}>
                <Ionicons name={icon} size={24} color={Colors.primary.main} />
            </View>

            {/* flex: 1 so a long description wraps instead of pushing the chevron out */}
            <View style={styles.texts}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md + Spacing.xs,   // 20px, as in the design
        marginBottom: Spacing.md,
        ...Colors.shadow.card,
    },
    pressed: {
        opacity: 0.85,
    },
    iconTile: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flex: 1,
        gap: Spacing.xs,
    },
    title: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    description: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
    },
});
