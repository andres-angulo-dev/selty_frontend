import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';
import type { OfferCondition } from '@/shared/types';

import { FormHeader } from '@/shared/components/FormHeader';
import { MenuSection } from '@/shared/components/MenuSection';
import { FormInput } from '@/shared/components/FormInput';
import { PhotoPicker } from '@/shared/components/PhotoPicker';
import { ChipSelector, ChipOption } from '@/shared/components/ChipSelector';
import { DateField } from '@/shared/components/DateField';
import { Button } from '@/shared/components/button';
import { FormErrorSummary } from '@/shared/components/FormErrorSummary';
import { getInvalidFieldLabels } from '@/shared/utils/formErrors';

import {
    offerSchema,
    OFFER_LIMITS,
    OFFER_CONDITIONS,
    OfferFormInput,
    OfferFormOutput,
    startOfDay,
} from '../schemas/offerSchema';
import { TradeField, getInitialTradeId } from '../components/TradeField';
import { buildPublishedOffer } from '../utils/buildPublication';
import { usePublicationActions } from '@/shared/hooks/usePublications';
import { usePublishFlow } from '@/shared/hooks/usePublishFlow';
import { useServiceArea } from '@/shared/hooks/useServiceArea';
import { getTradeById, getTradeOptions } from '@/__mocks__/mockTrades';

// ============================================
// OFFER FORM SCREEN (professionals only)
// "Nouvelle offre": optional image, offer details, validity dates,
// up to 3 conditions. Same mechanics as the annonce form:
// React Hook Form + Zod (offerSchema), errors once a field is left,
// discard confirmation and closing handled by usePublishFlow.
// Dates are stacked (not side by side) so they stay aligned at any text size.
// ============================================

const texts = Strings.add.offerForm;

// Same wording as on the offer detail screen, so the pro sees what customers see
const CONDITION_OPTIONS: ChipOption<OfferCondition>[] = OFFER_CONDITIONS.map((value) => ({
    value,
    label: Strings.offer.conditionLabels[value],
}));

// Field name → label, in the order of the form (error message above the button)
const FIELD_LABELS: Record<string, string> = {
    image: texts.sections.image,
    title: texts.fields.title,
    discount: texts.fields.discount,
    tradeId: Strings.add.annonceForm.fields.trade,
    description: texts.fields.description,
    startsAt: texts.fields.startsAt,
    expiresAt: texts.fields.expiresAt,
    conditions: texts.sections.conditions,
};

const DEFAULT_VALUES: OfferFormInput = {
    image: [],
    title: '',
    discount: '',
    tradeId: '',
    description: '',
    startsAt: null,
    expiresAt: null,
    conditions: [],
};

export const OfferFormScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    // A professional publishes only in their own trades
    const tradeOptions = getTradeOptions(useServiceArea().tradeIds);

    const {
        control,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isDirty, isSubmitted },
    } = useForm({
        resolver: zodResolver(offerSchema),
        defaultValues: { ...DEFAULT_VALUES, tradeId: getInitialTradeId(tradeOptions) },
        mode: 'onTouched',
    });

    const { publish } = usePublishFlow(isDirty, texts.discard);
    const { publishOffer } = usePublicationActions();

    // The end date picker cannot go before the chosen start (or today)
    const today = startOfDay(new Date());
    const startsAt = watch('startsAt');
    const conditionsCount = watch('conditions').length;

    // The two dates are checked against each other, but a change only re-checks its own
    // field: after a refused submit, re-check both so a fixed error does not stay on screen.
    // Not before: nothing should turn red while the form is being filled for the first time.
    const recheckDates = () => {
        if (isSubmitted) trigger(['startsAt', 'expiresAt']);
    };

    /**
     * Called only with valid data. The offer is kept in memory, then the form
     * is replaced by the confirmation.
     * TODO(backend): send the offer before showing the confirmation.
     */
    const onPublish = (data: OfferFormOutput) => {

        const trade = getTradeById(data.tradeId)?.label ?? '';

        publish(() => {
            publishOffer(buildPublishedOffer(data, new Date()));
            navigation.replace('PublishSuccess', {
                kind: 'offer',
                title: data.title,
                subtitle: trade,
                tag: data.discount ?? undefined,   // No discount: the tag is simply not shown
                coverUri: data.image[0],
            });
        });
    };

    return (
        <View style={styles.screen}>
            <FormHeader title={texts.title} leftLabel={Strings.buttons.cancel} onLeftPress={navigation.goBack} />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}
            >
                {/* IMAGE (optional): one wide slot */}
                <MenuSection title={texts.sections.image} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="image"
                        render={({ field }) => (
                            <PhotoPicker
                                photos={field.value}
                                onChange={field.onChange}
                                max={OFFER_LIMITS.imageMax}
                                layout="banner"
                                addLabel={texts.addImage}
                                labels={{ ...Strings.media, cancel: Strings.buttons.cancel }}
                            />
                        )}
                    />
                </MenuSection>

                {/* L'OFFRE */}
                <MenuSection title={texts.sections.offer} cardStyle={styles.card}>
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
                                maxLength={OFFER_LIMITS.titleMax}
                                showCounter
                                error={errors.title?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="discount"
                        render={({ field }) => (
                            <FormInput
                                label={texts.fields.discount}
                                placeholder={texts.fields.discountPlaceholder}
                                value={field.value}
                                onChangeText={field.onChange}
                                onBlur={field.onBlur}
                                maxLength={OFFER_LIMITS.discountMax}
                                hint={texts.fields.discountHint}
                                error={errors.discount?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="tradeId"
                        render={({ field }) => (
                            <TradeField
                                options={tradeOptions}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                error={errors.tradeId?.message}
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
                                maxLength={OFFER_LIMITS.descriptionMax}
                                showCounter
                                error={errors.description?.message}
                            />
                        )}
                    />
                </MenuSection>

                {/* VALIDITÉ: start then end, stacked */}
                <MenuSection title={texts.sections.validity} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="startsAt"
                        render={({ field }) => (
                            <DateField
                                label={texts.fields.startsAt}
                                value={field.value}
                                onChange={(date) => {
                                    field.onChange(date);
                                    recheckDates();
                                }}
                                placeholder={texts.fields.startsAtPlaceholder}
                                minimumDate={today}
                                clearable
                                error={errors.startsAt?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="expiresAt"
                        render={({ field }) => (
                            <DateField
                                label={texts.fields.expiresAt}
                                value={field.value}
                                onChange={(date) => {
                                    field.onChange(date);
                                    recheckDates();
                                }}
                                placeholder={texts.fields.expiresAtPlaceholder}
                                minimumDate={startsAt ?? today}
                                clearable
                                error={errors.expiresAt?.message}
                            />
                        )}
                    />
                    <Text style={styles.hint}>{texts.validityHint}</Text>
                </MenuSection>

                {/* CONDITIONS: counter in the section title */}
                <MenuSection
                    title={`${texts.sections.conditions} · ${texts.conditionsCounter(conditionsCount, OFFER_LIMITS.conditionsMax)}`}
                    cardStyle={styles.card}
                >
                    <Controller
                        control={control}
                        name="conditions"
                        render={({ field }) => (
                            <ChipSelector
                                options={CONDITION_OPTIONS}
                                selected={field.value}
                                onChange={field.onChange}
                                multiple
                                max={OFFER_LIMITS.conditionsMax}
                                error={errors.conditions?.message}
                            />
                        )}
                    />
                    <Text style={styles.hint}>{texts.conditionsHint}</Text>
                </MenuSection>
            </ScrollView>

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
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    card: {
        padding: Spacing.md,
    },
    hint: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: Spacing.sm,
    },
    bottomBar: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
    },
});
