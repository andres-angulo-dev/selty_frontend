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
import { SelectField } from '@/shared/components/SelectField';
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
import { usePublishFlow } from '@/shared/hooks/usePublishFlow';
import { CATEGORY_OPTIONS } from '@/__mocks__/mockCategoryOptions';

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
    categoryId: Strings.add.annonceForm.fields.category,
    description: texts.fields.description,
    startsAt: texts.fields.startsAt,
    expiresAt: texts.fields.expiresAt,
    conditions: texts.sections.conditions,
};

const DEFAULT_VALUES: OfferFormInput = {
    image: [],
    title: '',
    discount: '',
    categoryId: '',
    description: '',
    startsAt: null,
    expiresAt: null,
    conditions: [],
};

export const OfferFormScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isDirty, isSubmitted },
    } = useForm({
        resolver: zodResolver(offerSchema),
        defaultValues: DEFAULT_VALUES,
        mode: 'onTouched',
    });

    const { publish } = usePublishFlow(isDirty, texts.discard);

    // The end date picker cannot go before the chosen start (or today)
    const today = startOfDay(new Date());
    const startsAt = watch('startsAt');
    const conditionsCount = watch('conditions').length;

    /**
     * Called only with valid data. No backend yet: the offer is not stored;
     * the form is replaced by the confirmation.
     * TODO(backend): send the offer before showing the confirmation.
     */
    const onPublish = (data: OfferFormOutput) => {
        const category = CATEGORY_OPTIONS.find((option) => option.value === data.categoryId)?.label ?? '';

        publish(() =>
            navigation.replace('PublishSuccess', {
                kind: 'offer',
                title: data.title,
                subtitle: category,
                tag: data.discount,
                coverUri: data.image[0],
            }),
        );
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
                        name="categoryId"
                        render={({ field }) => (
                            <SelectField
                                label={Strings.add.annonceForm.fields.category}
                                options={CATEGORY_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                onClose={field.onBlur}
                                placeholder={Strings.add.annonceForm.fields.categoryPlaceholder}
                                searchPlaceholder={Strings.add.annonceForm.fields.categorySearch}
                                emptyText={Strings.add.annonceForm.fields.categoryEmpty}
                                closeLabel={Strings.selectField.close}
                                error={errors.categoryId?.message}
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
                                onChange={field.onChange}
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
                                onChange={field.onChange}
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
