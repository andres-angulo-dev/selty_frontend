import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { EmptyState } from '@/shared/components/EmptyState';

// ============================================
// MY PUBLICATIONS (professionals) — TEMPORARY
// Takes the Favorites slot for a pro: professionals do not save other people's
// content, they manage their own annonces and offers (view, edit, disable).
// The real screen comes with the "Mes publications" feature.
// ============================================

const texts = Strings.publication.placeholder;

export const MyPublicationsScreen: React.FC = () => (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Text style={styles.title} accessibilityRole="header">{texts.title}</Text>
        <EmptyState icon="albums-outline" title={texts.comingSoon} message={texts.message} />
    </SafeAreaView>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    // Same large title as the other tabs
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
});
