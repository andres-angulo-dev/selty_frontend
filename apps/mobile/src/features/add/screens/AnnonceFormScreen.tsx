import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/navigation/types';
import { Colors, Typography, Spacing, Strings } from '@/shared/constants';

import { MenuSection } from '@/shared/components/MenuSection';
import { FormHeader } from '@/shared/components/FormHeader';
import { FormInput } from '@/shared/components/FormInput';
import { PhotoPicker } from '@/shared/components/PhotoPicker';
import { ChipSelector, ChipOption } from '@/shared/components/ChipSelector';
import { LocationFields } from '@/shared/components/LocationFields';
import { EMPTY_LOCATION } from '@/shared/utils/locationSchema';
import { Button } from '@/shared/components/button';
import { FormErrorSummary } from '@/shared/components/FormErrorSummary';
import { getInvalidFieldLabels } from '@/shared/utils/formErrors';

import {
    annonceSchema,
    ANNONCE_LIMITS,
    ANNONCE_PRICE_TYPES,
    AnnonceFormInput,
    AnnonceFormOutput,
    parsePriceInput,
} from '../schemas/annonceSchema';
import type { AnnoncePriceType } from '../types';
import { TradeField, getInitialTradeId } from '../components/TradeField';
import { buildPublishedAnnonce } from '../utils/buildPublication';
import { usePublicationActions } from '@/shared/hooks/usePublications';
import { formatEuros } from '@/shared/utils/formatPrice';
import { usePublishFlow } from '@/shared/hooks/usePublishFlow';
import { useServiceArea } from '@/shared/hooks/useServiceArea';
import { getTradeById, getTradeOptions } from '@/__mocks__/mockTrades';

// ============================================
// ANNONCE FORM SCREEN (professionals only)
// "Nouvelle annonce": photos, information, location, price type.
// - React Hook Form keeps the field values; Zod (annonceSchema) validates.
// - Errors appear once a field has been left (mode 'onTouched'), and on
//   every field at once when "Publier" is pressed.
// - Leaving a partly filled form ("Annuler" or the iOS swipe back) asks for
//   confirmation first (usePreventRemove).
// ============================================

const texts = Strings.add.annonceForm;

// Chip options built once from the strings; the union type checks every value
const PRICE_OPTIONS: ChipOption<AnnoncePriceType>[] = ANNONCE_PRICE_TYPES.map((value) => ({
    value,
    label: texts.priceTypes[value],
}));

// Field name → label, in the order of the form (error message above the button)
const FIELD_LABELS: Record<string, string> = {
    photos: texts.sections.photos,
    title: texts.fields.title,
    tradeId: texts.fields.trade,
    description: texts.fields.description,
    location: Strings.locationFields.summaryLabel,
    priceType: texts.sections.price,
    price: texts.fields.price,
};

const DEFAULT_VALUES: AnnonceFormInput = {
    photos: [],
    title: '',
    tradeId: '',
    description: '',
    location: EMPTY_LOCATION,
    priceType: [],
    price: '',
};

export const AnnonceFormScreen: React.FC = () => {
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
        resolver: zodResolver(annonceSchema),
        defaultValues: { ...DEFAULT_VALUES, tradeId: getInitialTradeId(tradeOptions) },
        mode: 'onTouched',
    });

    // The amount field only exists for a fixed price
    const isFixedPrice = watch('priceType')[0] === 'fixed';

    // Discard confirmation + closing after publication (shared with the offer form)
    const { publish } = usePublishFlow(isDirty, texts.discard);
    const { publishAnnonce } = usePublicationActions();

    /**
     * Called only with valid data (already trimmed by Zod). The annonce is kept
     * in memory, then the form is replaced by the confirmation.
     * TODO(backend): send the annonce (photos upload, server-side validation)
     * before showing the confirmation, and handle the error case.
     */
    const onPublish = (data: AnnonceFormOutput) => {

        const priceType = data.priceType[0];
        const amount = priceType === 'fixed' ? parsePriceInput(data.price) : null;
        const trade = getTradeById(data.tradeId)?.label ?? '';

        publish(() => {
            publishAnnonce(buildPublishedAnnonce(data, new Date()));
            navigation.replace('PublishSuccess', {
                kind: 'annonce',
                title: data.title,
                subtitle: `${trade} · ${data.location.city} (${data.location.department})`,
                // "80,00 €" for a fixed price, otherwise the chip label
                tag: amount !== null ? formatEuros(amount) : texts.priceTypes[priceType],
                coverUri: data.photos[0],
            });
        });
    };

    return (
        <View style={styles.screen}>
            {/* "Annuler" goes back; usePreventRemove above intercepts it when needed */}
            <FormHeader title={texts.title} leftLabel={Strings.buttons.cancel} onLeftPress={navigation.goBack} />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                // iOS: scrolls the focused field above the keyboard
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}
            >
                {/* PHOTOS */}
                <MenuSection title={texts.sections.photos} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="photos"
                        render={({ field }) => (
                            <PhotoPicker
                                photos={field.value}
                                onChange={field.onChange}
                                max={ANNONCE_LIMITS.photosMax}
                                labels={{ ...Strings.media, cancel: Strings.buttons.cancel }}
                                error={errors.photos?.message}
                            />
                        )}
                    />
                    <Text style={styles.hint}>{texts.photosHint}</Text>
                </MenuSection>

                {/* INFORMATIONS */}
                <MenuSection title={texts.sections.informations} cardStyle={styles.card}>
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
                                maxLength={ANNONCE_LIMITS.titleMax}
                                showCounter
                                error={errors.title?.message}
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
                                maxLength={ANNONCE_LIMITS.descriptionMax}
                                showCounter
                                error={errors.description?.message}
                            />
                        )}
                    />
                </MenuSection>

                {/* LOCALISATION: postal code and city fill each other */}
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
                </MenuSection>

                {/* PRIX */}
                <MenuSection title={texts.sections.price} cardStyle={styles.card}>
                    <Controller
                        control={control}
                        name="priceType"
                        render={({ field }) => (
                            <ChipSelector
                                options={PRICE_OPTIONS}
                                selected={field.value}
                                onChange={(value) => {
                                    field.onChange(value);
                                    // The amount depends on this choice, but a change only re-checks its
                                    // own field: after a refused submit, moving to "Devis" must also clear
                                    // the error of the amount, now hidden. Not before the first submit:
                                    // "Prix fixe" must not turn the empty amount red straight away.
                                    if (isSubmitted) trigger('price');
                                }}
                                error={errors.priceType?.message}
                            />
                        )}
                    />

                    {/* Amount, shown only for "Prix fixe" */}
                    {isFixedPrice ? (
                        <View style={styles.priceField}>
                            <Controller
                                control={control}
                                name="price"
                                render={({ field }) => (
                                    <FormInput
                                        label={texts.fields.price}
                                        placeholder={texts.fields.pricePlaceholder}
                                        value={field.value}
                                        onChangeText={field.onChange}
                                        onBlur={field.onBlur}
                                        keyboardType="decimal-pad"
                                        maxLength={ANNONCE_LIMITS.priceInputMax}
                                        hint={texts.fields.priceHint}
                                        error={errors.price?.message}
                                    />
                                )}
                            />
                        </View>
                    ) : null}
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
        paddingHorizontal: Spacing.md + Spacing.xs,  // 20px
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xl,
    },
    // Forms need more room inside the white card than menu rows
    card: {
        padding: Spacing.md,
    },
    hint: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: Spacing.sm,
    },
    priceField: {
        marginTop: Spacing.md,
    },
    bottomBar: {
        paddingHorizontal: Spacing.md + Spacing.xs,
        paddingTop: Spacing.sm,
        backgroundColor: Colors.neutral.surface,
    },
});
