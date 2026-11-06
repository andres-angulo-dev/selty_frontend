import { Annonce, Offer } from '@/shared/types';

// ============================================
// Availability of a saved item
// - 'available': exists and can be opened
// - 'ended': still exists but no longer active (offer expired / disabled,
//   annonce disabled)
// - 'deleted': no item behind the ID anymore
// ============================================

export type Availability = 'available' | 'ended' | 'deleted';

/** Midnight today: an offer ending today is still valid all day */
const startOfToday = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

/** Offer: disabled by the pro, or its end date is before today */
export const getOfferAvailability = (offer: Offer | undefined | null): Availability => {
    if (!offer) {
        return 'deleted';
    }
    const isExpired = offer.expiresAt !== null && offer.expiresAt < startOfToday();
    return !offer.isActive || isExpired ? 'ended' : 'available';
};

/** Offer whose start date is after today: an offer starting today has started */
export const isOfferUpcoming = (offer: Offer): boolean => {
    if (!offer.startsAt) {
        return false;
    }
    const tomorrow = startOfToday();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return offer.startsAt >= tomorrow;
};

/** Offer running right now: the only ones customers see in a list and that count as active */
export const isOfferLive = (offer: Offer): boolean =>
    getOfferAvailability(offer) === 'available' && !isOfferUpcoming(offer);

/** Annonce: disabled by the pro */
export const getAnnonceAvailability = (annonce: Annonce | undefined | null): Availability => {
    if (!annonce) {
        return 'deleted';
    }
    return annonce.isActive ? 'available' : 'ended';
};

/** Professional: no "inactive" state in the model yet, only a closed account */
export const getProfessionalAvailability = (professional: unknown): Availability =>
    professional ? 'available' : 'deleted';
