import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/shared/constants';

interface ProfileSectionProps {
    title: string;
    paddingIsActive?: boolean,
    children: React.ReactNode;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
    title,
    paddingIsActive= true,
    children
}) => {
    return (
        <View style={styles.container}>
            {/* Section title */}
            <Text style={styles.title}>{title}</Text>

            {/* Section content */}
            <View style={[styles.content, !paddingIsActive && {paddingLeft: 0}]}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.xxl,
    },
    title: {
        ...Typography.label,
        color: Colors.primary.dark,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
        marginLeft: Spacing.md
    },
    content: {
        paddingLeft: Spacing.md,
        backgroundColor: Colors.neutral.white,
        borderRadius: 12,
        overflow: 'hidden',
    }
})