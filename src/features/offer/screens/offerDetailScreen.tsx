import React  from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { getOfferById } from '../data/mockOffers';
import { formatAbsoluteDate } from '@/shared/utils/formatDate';

// Screen props: gives access to route.params.offerId and navigation
type Props = NativeStackScreenProps<RootStackParamList, 'OfferDetail'>;

export const OfferDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { offerId } = route.params;
    const offer = getOfferById(offerId);

    // Guard: offer not found
    if (!offer) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.offer.notFound}</Text>
            </View>
        );
    };

    // Navigate to the professional's detail screen
    const handleProfessionalPress = () => {
        if (offer.professional) {
            navigation.navigate('ProfessionalDetail', { professionalId: offer.professional.id });
        };
    };

    // Open the native phone dialer 
    const handleCallPress = () => {
        if (offer.professional?.phone) {
            Linking.openURL(`tel:${offer.professional.phone}`);
        };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Discount badge */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{offer.discount}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{offer.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{offer.description}</Text>

            {/* Validity dates */}
            {(offer.startsAt || offer.expiresAt) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{Strings.offer.validity}</Text>
                    {offer.startsAt && (
                        <View style={styles.dateRow}>
                            <Ionicons name='calendar-outline' size={16} color={Colors.text.tertiary} />
                            <Text style={styles.dateText}>{Strings.offer.startsAt} {formatAbsoluteDate(offer.startsAt)}</Text> 
                        </View>
                    )}
                    {offer.expiresAt && (
                        <View style={styles.dateRow}>
                            <Ionicons name='time-outline' size={16} color={Colors.text.tertiary} />
                            <Text style={styles.dateText}>{Strings.offer.expiresAt} {formatAbsoluteDate(offer.expiresAt)}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Professional section */}
            {offer.professional && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{Strings.offer.professional}</Text>
                    <Pressable onPress={handleProfessionalPress} style={({ pressed }) => [styles.professionalCard, pressed && styles.pressed]}>
                        {/* Avatar placeholder */}
                        <View style={styles.avatar}>
                            <Ionicons name='person' size={20} color={Colors.text.tertiary} />
                        </View>

                        {/* Name + profession */}
                        <View style={styles.professionalInfo}>
                            <Text style={styles.professionalName}>{offer.professional.firstName} {offer.professional.lastName}</Text>
                            <Text style={styles.profession}>{offer.professional.profession}</Text>
                        </View>

                        {/* Arrow */}
                        <Ionicons name='chevron-forward' size={18} color={Colors.text.tertiary} />
                    </Pressable>
                </View>
            )}

            {/* Call button */}
            {offer.professional?.phone && (
                <Pressable onPress={handleCallPress} style={({ pressed }) => [styles.callButton, pressed && styles.callButtonPressed]}>
                    <Ionicons name='call-outline' size={18} color={Colors.neutral.white} />
                    <Text style={styles.callButtonText}>{Strings.offer.call}</Text>
                </Pressable>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
    },

    contentContainer: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    errorContainer: {
        flex: 1,
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorText: {
        ...Typography.caption,
        color: Colors.semantic.error,
    },

    badge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.semantic.error,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm, 
        marginBottom: Spacing.md,
    },
    
    badgeText: {
        ...Typography.h2,
        color: Colors.neutral.white, 
        fontWeight: '700',
    },

    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    }, 

    description: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },

    section: {
        marginBottom: Spacing.lg,
    },

    sectionTitle: {
        ...Typography.label,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },

    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: 4,
    },

    dateText: {
        ...Typography.body,
        color: Colors.text.secondary,
    },

    professionalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md, 
        borderWidth: 1, 
        borderColor: Colors.neutral.border, 
    },

    pressed: {
        opacity: 0.7,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.neutral.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm, 
    },

    professionalInfo: {
        flex: 1,
    },

    professionalName: {
        ...Typography.label,
        color: Colors.text.primary,
        fontWeight: '600',
    },

    profession: {
        ...Typography.caption,
        color: Colors.text.secondary
    },

    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.primary.main,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md, 
        marginTop: Spacing.sm,
    },

    callButtonPressed: {
        opacity: 0.8,
    },
    
    callButtonText: {
        ...Typography.label,
        color: Colors.neutral.white, 
        fontWeight: '600',
    }

})