/** The fields of an offer that decide whether it is running */
export interface OfferLiveness {
    isActive: boolean;
    startsAt: Date | string | null;
    expiresAt: Date | string | null;
}

/** Midnight (local time) of the day of `now` */
const startOfDay = (now: Date): Date => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    return day;
};

/** Accepts a Date or an ISO string (what the API sends) */
const toDate = (value: Date | string): Date => (value instanceof Date ? value : new Date(value));

/**
 * Offer whose start date is after today. An offer starting later today has
 * started (the whole day counts), same as the app always did.
 * @param offer Offer dates
 * @param now Clock, injectable for tests
 */
export const isOfferUpcoming = (offer: Pick<OfferLiveness, 'startsAt'>, now: Date = new Date()): boolean => {
    if (!offer.startsAt) {
        return false;
    }
    const tomorrow = startOfDay(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return toDate(offer.startsAt) >= tomorrow;
};

/**
 * Offer running right now: active, started, and not ended. An offer ending
 * today is still live all day.
 * @param offer Offer state and dates
 * @param now Clock, injectable for tests
 * @returns true when customers should see it
 */
export const isOfferLive = (offer: OfferLiveness, now: Date = new Date()): boolean => {
    if (!offer.isActive) {
        return false;
    }
    if (offer.expiresAt !== null && toDate(offer.expiresAt) < startOfDay(now)) {
        return false;
    }
    return !isOfferUpcoming(offer, now);
};
