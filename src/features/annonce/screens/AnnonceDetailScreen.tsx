import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Colors, Typography, Spacing, Strings, BorderRadius } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { getAnnonceById } from '../data/mockAnnonces';
import { formatRelativeDate } from '@/shared/utils/formatDate';
import { ProfessionalCard } from '@/shared/components/ProfessionalCard';

type Props = NativeStackScreenProps<RootStackParamList, 'AnnonceDetail'>;

export const AnnonceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { annonceId } = route.params;
    const annonce = getAnnonceById(annonceId);

    // Guard: annonce not found
    if (!annonce) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{Strings.annonce.notFound}</Text>
            </View>
        );
    };

    // Navigate to the professional's detail screen
    const handleProfessionalPress = () => {
        if (annonce.professional) {
            navigation.navigate('ProfessionalDetail', { professionalId: annonce.professional.id });
        };
    };

    // Open the native phone dialer
    const handleCallPress = () => {
        if (annonce.professional?.phone) {
            Linking.openURL(`tèl:${annonce.professional.phone}`)
        };
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.title}>{annonce.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{annonce.description}</Text>

            {/* Location */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{Strings.annonce.location}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name='location-outline' size={16} color={Colors.text.tertiary} />
                    <Text>{annonce.city} • Dép. {annonce.department}</Text>
                </View>
            </View>

            {/* Published at */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{Strings.annonce.publishedAt}</Text>
                <View style={styles.infoRow}>
                    <Ionicons name='time-outline' size={16} color={Colors.text.tertiary} />
                    <Text style={styles.infoText}>{formatRelativeDate(annonce.createdAt, 'seconds')}</Text>
                </View>
            </View>

            {/* Interactions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{Strings.annonce.interactions}</Text>
                <View style={styles.interactionsRow}>
                    {/* Like */}
                    <View style={styles.interactionItem}>
                        <Ionicons name={annonce.isLiked ? 'heart' : 'heart-outline'} size={20} color={annonce.isLiked ? Colors.semantic.error : Colors.text.tertiary} /> 
                        <Text style={styles.interactionText}>{Strings.annonce.likes(annonce.likesCount)}</Text>
                    </View>

                    {/* Comments */}
                    <View style={styles.interactionItem}>
                        <Ionicons name='chatbubbles-outline' size={18} color={Colors.text.tertiary} />
                        <Text style={styles.interactionText}>{Strings.annonce.comments(annonce.commentsCount)}</Text>
                    </View>
                </View>
            </View>

            {/* Professional section */}
            {annonce.professional && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{Strings.annonce.professional}</Text>
                    <Pressable onPress={handleProfessionalPress} style={({ pressed }) => [styles.professionalCard, pressed && styles.pressed]}>
                        {/* Avatar placeholder */}
                        <View style={styles.avatar}>
                            <Ionicons name='person' size={20} color={Colors.text.tertiary} />
                        </View>

                        {/* Name + profession */}
                        <View style={styles.professionalInfo}>
                            <Text style={styles.professionalName}>{annonce.professional.firstName} {annonce.professional.lastName}</Text>
                            <Text style={styles.profession}>{annonce.professional.profession}</Text>
                        </View>

                        {/* Arrow */}
                        <Ionicons name='chevron-forward' size={18} color={Colors.text.tertiary} />
                    </Pressable>
                </View>
            )}

            {/* Call button */}
            {annonce.professional?.phone && (
                <Pressable onPress={handleCallPress} style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
                    <Ionicons name='call-outline' size={18} color={Colors.neutral.white}/>
                    <Text style={styles.callButtonText}>{Strings.annonce.call}</Text>
                </Pressable>
            )}
        </ScrollView>
    )
};


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

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    infoText: {
        ...Typography.body,
        color: Colors.text.secondary,
    },

    interactionsRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },

    interactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },

    interactionText: {
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
        marginRight: Spacing.sm
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
        color: Colors.text.secondary,
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

    CallButtonPressed: {
        opacity: 0.8,
    },

    callButtonText: {
        ...Typography.label,
        color: Colors.neutral.white,
        fontWeight: '600',
    },
})