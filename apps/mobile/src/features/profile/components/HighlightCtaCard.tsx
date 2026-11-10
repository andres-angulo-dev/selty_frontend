import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/shared/constants';

// ============================================
// HIGHLIGHT CTA CARD
// Navy gradient card that invites the user to an action ("Vous êtes
// professionnel ? Créer mon espace pro"). The whole card is one tap target.
// Generic naming and caller-provided texts so another screen or project can
// reuse it for any upsell (subscription, boost, referral...).
// ============================================

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface HighlightCtaCardProps {
    title: string;
    description: string;
    ctaLabel: string;                   // Link-style text at the bottom
    onPress: () => void;
    icon?: IoniconName;                 // Round badge on the right, default 'briefcase-outline'
}

// Brand gradient, dark to main navy at 135° (top-left to bottom-right)
const GRADIENT_COLORS = [Colors.primary.dark, Colors.primary.main] as const;

export const HighlightCtaCard: React.FC<HighlightCtaCardProps> = ({
    title,
    description,
    ctaLabel,
    onPress,
    icon = 'briefcase-outline',
}) => {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${title} ${ctaLabel}`}
            style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
        >
            <LinearGradient
                colors={GRADIENT_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Texts on the left */}
                <View style={styles.texts}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                    <View style={styles.ctaRow}>
                        <Text style={styles.ctaLabel}>{ctaLabel}</Text>
                        <Ionicons name="arrow-forward" size={16} color={Colors.text.inverse} />
                    </View>
                </View>

                {/* Round translucent badge with the icon */}
                <View style={styles.iconBadge}>
                    <Ionicons name={icon} size={24} color={Colors.text.inverse} />
                </View>
            </LinearGradient>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    // Shadow lives on the wrapper: overflow hidden on the card would clip it
    wrapper: {
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        ...Colors.shadow.card,
    },
    pressed: {
        opacity: 0.9,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Spacing.md,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md + Spacing.xs,   // 20px
        overflow: 'hidden',
    },
    texts: {
        flex: 1,
        gap: Spacing.xs,
    },
    title: {
        ...Typography.bodyBold,
        color: Colors.text.inverse,
    },
    description: {
        ...Typography.bodySmall,
        color: Colors.overlay.whiteMuted,
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs + 2,
        marginTop: Spacing.sm,
    },
    ctaLabel: {
        ...Typography.buttonSmall,
        color: Colors.text.inverse,
    },
    iconBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.overlay.whiteSubtle,
        borderWidth: 1,
        borderColor: Colors.overlay.whiteBorder,
    },
});
