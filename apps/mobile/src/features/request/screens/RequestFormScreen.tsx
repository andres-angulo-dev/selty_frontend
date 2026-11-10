import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Strings } from '@/shared/constants';
import type { ServiceRequest, RequestUrgency } from '@/shared/types';

import { MenuSection } from '@/shared/components/MenuSection';
import { FormHeader } from '@/shared/components/FormHeader';
import { FormInput } from '@/shared/components/FormInput';
import { PhotoPicker } from '@/shared/components/PhotoPicker';
import { ChipSelector, ChipOption } from '@/shared/components/ChipSelector';
import { SelectField } from '@/shared/components/SelectField';
import { LocationFields } from '@/shared/components/LocationFields';
import { EMPTY_LOCATION } from '@/shared/utils/locationSchema';
import { Button } from '@/shared/components/button';
import { FormErrorSummary } from '@/shared/components/FormErrorSummary';
import { getInvalidFieldLabels } from '@/shared/utils/formErrors';
import { usePublishFlow } from '@/shared/hooks/usePublishFlow';
import { useRequestActions } from '@/shared/hooks/useRequests';
import { computeRequestExpiry } from '@/shared/utils/requestStatus';
import { TRADE_OPTIONS, getTradeById } from '@/__mocks__/mockTrades';
import { CURRENT_USER_AUTHOR } from '@/__mocks__/mockSession';

import {
    requestSchema,
    REQUEST_LIMITS,
    REQUEST_URGENCIES,
    RequestFormInput,
    RequestFormOutput,
} from '../schemas/requestSchema';

// ============================================
// REQUEST FORM SCREEN (individuals)
// "Publier une demande": need (trade, title, description), urgency, city,
// optional photos. Same building blocks as the annonce form:
// - React Hook Form keeps the values, Zod (requestSchema) validates;
// - leaving a partly filled form asks "Abandonner ?" (usePublishFlow);
// - on publish, the request is added to the store (it appears in the feed)
//   and the form is REPLACED by the confirmation.
// Privacy: the form asks for a city only and warns not to write an address,
// a phone number or availabilities (the feed is public).
// ============================================

const texts = Strings.request.form;

// Urgency chips built once from the strings; the union type checks every value
const URGENCY_OPTIONS: ChipOption<RequestUrgency>[] = REQUEST_URGENCIES.map((value) => ({
    value,
    label: Strings.request.urgency[value],
}));

// Field name → label, in the order of the form (error message above the button)
const FIELD_LABELS: Record<string, string> = {
    tradeId: texts.fields.trade,
    title: texts.fields.title,
    description: texts.fields.description,
    urgency: texts.sections.urgency,
    location: Strings.locationFields.summaryLabel,
    photos: texts.sections.photos,
};

const DEFAULT_VALUES: RequestFormInput = {
    tradeId: '',
    title: '',
    description: '',
    urgency: [],
    location: EMPTY_LOCATION,
    photos: [],
};

export const RequestFormScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { publish: addToFeed } = useRequestActions();

    const {
        control,
        handleSubmit,
        formState: { errors, isDirty, isSubmitted },
    } = useForm({
        resolver: zodResolver(requestSchema),
        defaultValues: DEFAULT_VALUES,
        mode: 'onTouched',
    });

    // Discard confirmation + closing after publication (shared with the pro forms)
    const { publish } = usePublishFlow(isDirty, texts.discard);

    /**
     * Called only with valid data (trimmed, department upper-cased by Zod).
     * The request goes into the Redux store, so it shows up in the feed.
     * TODO(backend): POST the request (photos upload, server validation,
     * moderation), handle errors.
     */
    const onPublish = (data: RequestFormOutput) => {
        const trade = getTradeById(data.tradeId);
        const now = new Date();

        const request: ServiceRequest = {
            id: `request-${now.getTime()}`,
            tradeId: data.tradeId,
            categoryId: trade?.categoryId ?? '',
            title: data.title,
            description: data.description,
            urgency: data.urgency[0],
            photos: data.photos,
            // City level only: the postal code is not kept in a public request
            // (in Paris it would reveal the district). Coordinates = commune center.
            city: data.location.city,
            department: data.location.department,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            author: CURRENT_USER_AUTHOR,
            status: 'open',
            createdAt: now.toISOString(),
            expiresAt: computeRequestExpiry(now),
        };

        publish(() => {
            addToFeed(request);
            navigation.replace('PublishSuccess', {
                kind: 'request',
                title: data.title,
                subtitle: `${trade?.label ?? ''} · ${data.location.city} (${data.location.department})`,
                tag: Strings.request.urgency[request.urgency],
                coverUri: data.photos[0],
            });
        });
    };

    return (
        <View style={styles.screen}>
            {/* "Annuler" goes back; usePublishFlow intercepts it when the form is filled */}
            <FormHeader title={texts.title} leftLabel={Strings.buttons.cancel} onLeftPress={navigation.goBack} />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                // iOS: scrolls the focused field above the keyboard
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}
            >
                {/* VOTRE BESOIN */}
                <MenuSection title={texts.sections.need} cardStyle={styles.card}>
                    {/* Searchable list: the trade list will grow */}
                    <Controller
                        control={control}
                        name="tradeId"
                        render={({ field }) => (
                            <SelectField
                                label={texts.fields.trade}
                                options={TRADE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                onClose={field.onBlur}
                                placeholder={texts.fields.tradePlaceholder}
                                searchPlaceholder={texts.fields.tradeSearch}
                                emptyText={texts.fields.tradeEmpty}
                                closeLabel={Strings.selectField.close}
                                error={errors.tradeId?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <FormInput
                                label={texts.fields.title}
                                placeholder={texts.fields.titlePlaceholder}
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                maxLength={REQUEST_LIMITS.titleMax}
                                showCounter
                                error={errors.title?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormInput
                                label={texts.fields.description}
                                placeholder={texts.fields.descriptionPlaceholder}
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                multiline
                                maxLength={REQUEST_LIMITS.descriptionMax}
                                showCounter
                                error={errors.description?.message}
                            />
                        )}
                    />

                    {/* Privacy warning: the feed is visible to everyone */}
                    <View style={styles.notice}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.primary.main} />
                        <Text style={styles.noticeText}>{texts.privacyNotice}</Text>
                    </View>
                </MenuSection>

                {/* DÉLAI */}
                <MenuSection title={texts.sections.urgency} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="urgency"
                        render={({ field }) => (
                            <ChipSelector
                                options={URGENCY_OPTIONS}
                                selected={field.value}
                                onChange={field.onChange}
                                error={errors.urgency?.message}
                            />
                        )}
                    />
                </MenuSection>

                {/* LIEU: postal code and city fill each other */}
                <MenuSection title={texts.sections.location} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="location"
                        render={({ field }) => (
                            <LocationFields
                                value={field.value}
                                onChange={field.onChange}
                                labels={Strings.locationFields}
                                postalCodeError={errors.location?.postalCode?.message}
                                cityError={errors.location?.city?.message ?? errors.location?.department?.message}
                            />
                        )}
                    />
                    <View style={styles.hintRow}>
                        <Ionicons name="lock-closed-outline" size={14} color={Colors.text.secondary} />
                        <Text style={styles.hint}>{texts.locationHint}</Text>
                    </View>
                </MenuSection>

                {/* PHOTOS (FACULTATIF) */}
                <MenuSection title={texts.sections.photos} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="photos"
                        render={({ field }) => (
                            <PhotoPicker
                                photos={field.value}
                                onChange={field.onChange}
                                max={REQUEST_LIMITS.photosMax}
                                layout="tiles"
                                labels={{ ...Strings.media, cancel: Strings.buttons.cancel }}
                                error={errors.photos?.message}
                            />
                        )}
                    />
                    <Text style={[styles.hint, styles.photosHint]}>{texts.photosHint}</Text>
                </MenuSection>
            </ScrollView>

            {/* Sticky bottom bar, above the home indicator */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
                {/* After a refused attempt: says which fields to fix (they can be off-screen) */}
                {isSubmitted ? (
                    <FormErrorSummary
                        message={Strings.formErrors.message}
                        fieldLabels={getInvalidFieldLabels(errors, FIELD_LABELS)}
                    />
                ) : null}
                <Button label={texts.submit} onPress={handleSubmit(onPublish)} fullWidth size="large" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.neutral.surface,
    },
    content: {
        paddingHorizontal: Spacing.md + Spacing.xs,  // 20px, like the pro forms
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    // Forms need more room inside the white card than menu rows
    card: {
        padding: Spacing.md,
    },
    // Light blue box, same tint as the info pills
    notice: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.sm + Spacing.xs,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primary.subtle,
    },
    noticeText: {
        ...Typography.caption,
        color: Colors.text.primary,
        flex: 1,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    hint: {
        ...Typography.caption,
        color: Colors.text.secondary,
        flexShrink: 1,
    },
    photosHint: {
        marginTop: Spacing.sm,
    },
    bottomBar: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
    },
});
