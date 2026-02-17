import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Layout, Strings } from '@/shared/constants';

// Props type - receives only what it needs to display
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
    return (
        <View style={styles.container}>
            {/* Availability status */}
            <Text style={[styles.availabilityText, { color: isAvailable ? Colors.semantic.success : Colors.neutral.disabled }]}>{isAvailable ? Strings.professional.available : Strings.professional.unavailable }</Text>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarInitials}>{firstName[0]} {lastName[0]}</Text>
                    </View>
                )}
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
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },

    availabilityText: {
        position: 'absolute',
        right: 0,
        zIndex: 10,
        paddingHorizontal: Spacing.md,
        ...Typography.captionBis,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },

    avatarContainer: {
        position: 'relative',
        marginBottom: Spacing.md,
    },

    avatar: {
        width: Layout.avatarSizeLarge,
        height: Layout.avatarSizeLarge,
        borderRadius: BorderRadius.full,
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
        marginLeft: Spacing.xs
    },

    profession: {
        ...Typography.body,
        color: Colors.text.secondaryBis,
        fontWeight: 600,
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
})