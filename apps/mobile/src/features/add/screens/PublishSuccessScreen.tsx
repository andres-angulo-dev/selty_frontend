import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';
import { Button } from '@/shared/components/button';
import { RootStackParamList } from '@/app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============================================
// PUBLISH SUCCESS SCREEN
// Shown after an annonce / offer (pro) or a request (individual) is published:
// check mark, title, message, preview card of the publication, then an action
// ("Voir mes publications" for a pro, "Voir le feed" for a request).
// The form was replaced by this screen, so going back lands on the tabs
// (the "Publier" choice), never on the filled form.
// ============================================

type SuccessRoute = RouteProp<RootStackParamList, 'PublishSuccess'>;

const CHECK_CIRCLE_SIZE = 80;
const THUMB_SIZE = 64;

export const PublishSuccessScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { kind, title, subtitle, tag, coverUri } = useRoute<SuccessRoute>().params;

    const texts = Strings.add.success;
    const isRequest = kind === 'request';

    // Texts and placeholder icon of each kind of publication
    const heading = { annonce: texts.annonceTitle, offer: texts.offerTitle, request: texts.requestTitle }[kind];
    const message = { annonce: texts.annonceMessage, offer: texts.offerMessage, request: texts.requestMessage }[kind](title);
    const placeholderIcon = ({ annonce: 'megaphone-outline', offer: 'pricetag-outline', request: 'create-outline' } as const)[kind];

    /**
     * Pro: to "Mes publications", on the segment of what was just published.
     * Request: to the Home feed, where the new request now appears first.
     * popTo closes this screen: since React Navigation 7, `navigate` would stack a second
     * MainTabs on top, and going back would land on this confirmation again.
     */
    const handleAction = () => {
        if (kind === 'request') {
            navigation.popTo('MainTabs', { screen: 'Home' });
            return;
        }
        navigation.popTo('MainTabs', { screen: 'MyPublications', params: { segment: kind } });
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
            {/* Centered content */}
            <View style={styles.body}>
                <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={40} color={Colors.primary.main} />
                </View>

                <Text style={styles.title} accessibilityRole="header">
                    {heading}
                </Text>
                <Text style={styles.message}>
                    {message}
                </Text>

                {/* Preview of the publication */}
                <View style={styles.preview}>
                    <View style={styles.thumb}>
                        {coverUri ? (
                            <Image source={{ uri: coverUri }} style={styles.thumbImage} />
                        ) : (
                            <Ionicons name={placeholderIcon} size={24} color={Colors.primary.main} />
                        )}
                    </View>
                    <View style={styles.previewTexts}>
                        <Text style={styles.previewTitle} numberOfLines={2}>
                            {title}
                        </Text>
                        <Text style={styles.previewSubtitle}>{subtitle}</Text>
                        {tag ? (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>

            <Button
                label={isRequest ? texts.backToFeed : texts.seePublications}
                onPress={handleAction}
                fullWidth
                size="large"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
        paddingHorizontal: Spacing.lg,
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircle: {
        width: CHECK_CIRCLE_SIZE,
        height: CHECK_CIRCLE_SIZE,
        borderRadius: CHECK_CIRCLE_SIZE / 2,
        backgroundColor: Colors.primary.subtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.h2,
        color: Colors.primary.main,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    message: {
        ...Typography.bodySmall,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    // Stacked texts beside the thumbnail: wraps at any text size
    preview: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.neutral.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md - Spacing.xs,
        ...Colors.shadow.card,
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        backgroundColor: Colors.neutral.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    previewTexts: {
        flex: 1,
        gap: 2,
    },
    previewTitle: {
        ...Typography.bodyBold,
        color: Colors.primary.main,
    },
    previewSubtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    tag: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.primary.subtle,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm + 2,
        paddingVertical: 2,
        marginTop: Spacing.xs,
    },
    tagText: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.primary.main,
    },
});
