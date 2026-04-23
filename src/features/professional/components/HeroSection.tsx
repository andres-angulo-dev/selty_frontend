import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Layout, Strings } from '@/shared/constants';

type HeroSectionProps = {
    avatar: string | null;
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    department: string;
    isCertified: boolean;
    isAvailable: boolean;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
    avatar,
    firstName,
    lastName,
    profession,
    city,
    department,
    isCertified,
    isAvailable,
}) => {
    const statusColor = isAvailable ? Colors.semantic.success : Colors.neutral.disabled;
    const statusBg = isAvailable ? 'rgba(39,174,96,0.12)' : 'rgba(0,0,0,0.06)';

    return (
        <View style={styles.container}>
            {/* Top row: avatar (left) + availability pill (right) */}
            <View style={styles.topRow}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitials}>{firstName[0]} {lastName[0]}</Text>
                    </View>
                )}

                <View style={{ flex: 1 }} />

                <View style={[styles.availabilityBadge, { backgroundColor: statusBg }]}>
                    <View style={[styles.availabilityDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.availabilityText, { color: statusColor }]}>
                        {isAvailable ? Strings.professional.available : Strings.professional.unavailable}
                    </Text>
                </View>
            </View>

            {/* Name + Certified badge */}
            <View style={styles.nameRow}>
                <Text style={styles.name}>{firstName} {lastName}</Text>
                {isCertified && (
                    <Ionicons name='checkmark-circle' size={20} color={Colors.secondary.main} style={styles.certifiedIcon} />
                )}
            </View>

            {/* Profession */}
            <Text style={styles.profession}>{profession}</Text>

            {/* Location */}
            <View style={styles.locationRow}>
                <Ionicons name='location-outline' size={16} color={Colors.text.tertiary} />
                <Text style={styles.locationText}>{city}, {department}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,   // Extra space so StatsRow overlap doesn't hide content
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.neutral.white,
        borderBottomLeftRadius: 24,  // rounded-b-3xl from Stitch — hero floats over gray bg
        borderBottomRightRadius: 24,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },

    avatar: {
        width: Layout.avatarSizeLarge,
        height: Layout.avatarSizeLarge,
        borderRadius: BorderRadius.xl,   // Rounded square — replaces the old circle
    },

    avatarPlaceholder: {
        backgroundColor: Colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarInitials: {
        ...Typography.h2,
        color: Colors.text.inverse,
    },

    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
    },

    availabilityDot: {
        width: 7,
        height: 7,
        borderRadius: BorderRadius.full,
    },

    availabilityText: {
        ...Typography.captionBis,
        fontWeight: '600',
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },

    name: {
        ...Typography.h2,
        color: Colors.text.primary,
    },

    certifiedIcon: {
        marginLeft: Spacing.xs,
    },

    profession: {
        ...Typography.body,
        color: Colors.secondary.dark,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    locationText: {
        ...Typography.bodySmall,
        color: Colors.text.tertiary,
        marginLeft: Spacing.xs,
    },
});
