import { CURRENT_PROFESSIONAL_ID } from '@/__mocks__/mockSession';
import { getTradeById } from '@/__mocks__/mockTrades';
import type { PublishedAnnonce, PublishedOffer } from '@/stores/publications/publicationsSlice';
import { AnnonceFormOutput, parsePriceInput } from '../schemas/annonceSchema';
import type { OfferFormOutput } from '../schemas/offerSchema';

// ============================================
// From a valid form to what the store keeps. Pure functions: `now` is passed
// in so the same input always gives the same result.
// TODO(backend): the server sets the ID, the professional and the date itself.
// ============================================

/**
 * @param data Valid annonce form
 * @param now Publication date
 * @returns The annonce to store, for the signed-in professional
 */
export const buildPublishedAnnonce = (data: AnnonceFormOutput, now: Date): PublishedAnnonce => {
    const priceType = data.priceType[0];
    const amount = priceType === 'fixed' ? parsePriceInput(data.price) : null;

    return {
        id: `annonce-${now.getTime()}`,
        title: data.title,
        description: data.description,
        images: data.photos,
        city: data.location.city,
        department: data.location.department,
        // Commune center from the city list, null when the city was typed by hand
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        professionalId: CURRENT_PROFESSIONAL_ID,
        tradeId: data.tradeId,
        categoryId: getTradeById(data.tradeId)?.categoryId ?? '',
        // The form has one choice; an annonce keeps "free" apart from the price type
        ...(priceType === 'free' ? { isFree: true } : { priceType }),
        ...(amount !== null ? { price: amount } : {}),
        isNew: true,
        isActive: true,
        createdAt: now.toISOString(),
    };
};

/**
 * @param data Valid offer form
 * @param now Publication date
 * @returns The offer to store, for the signed-in professional
 */
export const buildPublishedOffer = (data: OfferFormOutput, now: Date): PublishedOffer => ({
    id: `offer-${now.getTime()}`,
    title: data.title,
    description: data.description,
    discount: data.discount,
    image: data.image[0] ?? null,
    startsAt: data.startsAt?.toISOString() ?? null,
    expiresAt: data.expiresAt?.toISOString() ?? null,
    isActive: true,
    conditions: data.conditions,
    professionalId: CURRENT_PROFESSIONAL_ID,
    tradeId: data.tradeId,
    categoryId: getTradeById(data.tradeId)?.categoryId ?? '',
    createdAt: now.toISOString(),
});
