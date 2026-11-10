import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { ChoiceCard } from '@/shared/components/ChoiceCard';

// Navigation: this screen is the "Add" tab; the forms live in the root stack
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootTabParamList, RootStackParamList } from '@/app/navigation/types';

// ============================================
// ADD SCREEN (professionals only)
// Target of the central "Publier" tab: the professional picks what to
// publish. Each card opens its form above the tabs (root stack), so the
// tab bar is hidden while filling it in.
// ============================================

type AddNavigation = CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList, 'Add'>,
    NativeStackNavigationProp<RootStackParamList>
>;

export const AddScreen: React.FC = () => {
    const navigation = useNavigation<AddNavigation>();
    const texts = Strings.add.choice;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Large left-aligned title, same as the profile tab */}
                <Text style={styles.title} accessibilityRole="header">
                    {texts.title}
                </Text>
                <Text style={styles.subtitle}>{texts.subtitle}</Text>

                <ChoiceCard
                    icon="megaphone-outline"
                    title={texts.annonceTitle}
                    description={texts.annonceDescription}
                    onPress={() => navigation.navigate('AnnonceForm')}
                />
                <ChoiceCard
                    icon="pricetag-outline"
                    title={texts.offerTitle}
                    description={texts.offerDescription}
                    onPress={() => navigation.navigate('OfferForm')}
                />

                {/* Discreet tip under the cards */}
                <View style={styles.tipRow}>
                    <Ionicons name="information-circle-outline" size={18} color={Colors.text.secondary} />
                    <Text style={styles.tipText}>{texts.tip}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingHorizontal: Spacing.md + Spacing.xs,  // 20px
        paddingBottom: Spacing.xl,
    },
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
        marginTop: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    tipText: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
        flex: 1,
    },
});
