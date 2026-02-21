import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/shared/constants';
import { Annonce } from '@/features/annonce/types';
import { formatRelativeDate } from '@/shared/utils/formatDate';

interface AnnonceCardProps {
    annonce: Annonce;
    onPress: (annonce: Annonce) => void;
    onLikePress: (annonce: Annonce) => void;
    onCommentPress: (annonce: Annonce) => void;
    onFavoritePress: (annonce: Annonce) => void; 
}

export const AnnonceCard: React.FC<AnnonceCardProps> = ({
    annonce,
    onPress,
    onLikePress,
    onCommentPress,
    onFavoritePress,
}) => {
    return (
        <View style={styles.container}>
            {/* Pressable content area (opens annonce detail) */}
            <Pressable onPress={() => onPress(annonce)} style={({ pressed }) => [pressed && styles.pressed]}>
                {/* Header - Professional info */}
                {annonce.professional && (
                    <View style={styles.header}>
                        {/* Avatar placeholder */}
                        <View style={styles.avatar}>
                            <Ionicons name='person' size={18} color={Colors.text.tertiary} />
                        </View>

                        {/* Name + profession */}
                        <View style={styles.headerInfo}>
                            <Text style={styles.professionalName} numberOfLines={1}>
                                {annonce.professional.firstName} {annonce.professional.lastName}
                            </Text>
                            <Text style={styles.profession} numberOfLines={1}>
                                {annonce.professional.profession}
                            </Text>
                        </View>

                        {/* Location */}
                        <View style={styles.locationRow}>
                            <Ionicons name='location-outline' size={14} color={Colors.text.tertiary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {annonce.city}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Content - Title + Description */}
                <Text style={styles.title} numberOfLines={2}>
                    {annonce.title}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                    {annonce.description}
                </Text>
            </Pressable>

            {/* Footer - Interactions */}
            <View style={styles.footer}>
                {/* Like Button */}
                <Pressable onPress={() => onLikePress(annonce)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
                    <Ionicons name={annonce.isLiked ? 'heart' : 'heart-outline'} size={20} color={annonce.isLiked ? Colors.semantic.error : Colors.text.tertiary}/> 
                    <Text style={styles.actionText}>
                        {annonce.likesCount}
                    </Text>
                </Pressable>

                {/* Comment Button */}
                <Pressable onPress={() => onCommentPress(annonce)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
                    <Ionicons name='chatbubble-outline' size={18} color={Colors.text.tertiary}/>
                    <Text style={styles.actionText}>
                        {annonce.commentsCount > 0 ? annonce.commentsCount : null}
                    </Text>
                </Pressable>

                {/* Favorite button */}
                <Pressable onPress={() => onFavoritePress(annonce)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
                    <Ionicons name={annonce.isFavorite ? 'bookmark' : 'bookmark-outline'} size={20} color={annonce.isFavorite ? Colors.primary.main : Colors.text.tertiary} />
                </Pressable>

                {/* Date */}
                <Text style={styles.date}>{formatRelativeDate(annonce.createdAt, 'seconds')}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.neutral.white,
        borderRadius: 12,
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.neutral.border,
    },

    pressed: {
        opacity: 0.7,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 36,
        backgroundColor: Colors.neutral.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },

    headerInfo: {
        flex: 1,
    },

    professionalName: {
        ...Typography.label,
        color: Colors.text.primary,
    },

    profession: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },

    locationRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'flex-end',
        width: 80,
    },

    locationText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft: 2,
    },

    title: {
        ...Typography.label,
        color: Colors.text.primary,
        marginBottom: 4,
    },

    description: {
        ...Typography.caption,
        color: Colors.text.secondary,
        lineHeight: 18,
        marginBottom: Spacing.sm,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.border,
        paddingTop: Spacing.sm,
    }, 

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.md,
    },

    actionPressed: {
        opacity: 0.5, 
    },

    actionText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft: 4,
    },

    date: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginLeft: 'auto',
    }
})