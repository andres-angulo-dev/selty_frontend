import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import { EmptyState } from '@/shared/components/EmptyState';

// ============================================
// NEW REQUEST (individuals) — tab fallback
// Pressing the central "Publier" tab opens the RequestForm directly (tabPress
// listener in TabNavigator), so this screen is only seen when the tab gets
// focused another way (e.g. role switch while on it). It offers the same entry.
// A REQUEST is not an ANNONCE (a pro's post).
// ============================================

const texts = Strings.request.placeholder;

export const NewRequestScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Text style={styles.title} accessibilityRole="header">{texts.title}</Text>
            <EmptyState
                icon="create-outline"
                title={texts.title}
                message={texts.message}
                actionLabel={Strings.request.form.submitStart}
                onAction={() => navigation.navigate('RequestForm')}
            />
        </SafeAreaView>
    );
};

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
