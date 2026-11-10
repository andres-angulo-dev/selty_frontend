import type { MediaRowBadgeTone } from '@/shared/components/MediaRowCard';
// Direct file import: these pure functions stay runnable outside React Native
import { Strings } from '@/shared/constants/strings';
import type { Annonce, Offer } from '@/shared/types';
import { getOfferAvailability, isOfferUpcoming } from '@/shared/utils/availability';
import { formatEuros } from '@/shared/utils/formatPrice';
import { getProfessionLabel } from '@/shared/utils/professionLabel';

// ============================================
// What a row of "Mes publications" shows. Pure functions, so the rules can be
// checked without a screen.
// ============================================

interface PublicationRow {
    subtitle: string;
    badge?: { label: string; tone: MediaRowBadgeTone };
}

const priceTypes = Strings.add.annonceForm.priceTypes;

/** The price as the customer reads it, or undefined for an annonce without one */
const getAnnoncePriceLabel = (annonce: Annonce): string | undefined => {
    if (annonce.isFree) return priceTypes.free;
    if (annonce.priceType === 'quote') return priceTypes.quote;
    if (annonce.priceType !== 'fixed') return undefined;
    return annonce.price !== undefined
        ? `${priceTypes.fixed} · ${formatEuros(annonce.price)}`
        : priceTypes.fixed;
};

/**
 * @param annonce An annonce of the professional
 * @returns Its subtitle ("Plombier · Melun (77)") and its price badge
 */
export const getAnnonceRow = (annonce: Annonce): PublicationRow => {
    const price = getAnnoncePriceLabel(annonce);
    return {
        subtitle: `${getProfessionLabel([annonce.tradeId])} · ${annonce.city} (${annonce.department})`,
        badge: price ? { label: price, tone: 'neutral' } : undefined,
    };
};

/**
 * @param offer An offer of the professional
 * @returns Its subtitle (the trade) and its badge: "Terminée" or "À venir" first, as
 *   they matter most to the professional, otherwise the discount when there is one
 */
export const getOfferRow = (offer: Offer): PublicationRow => {
    const subtitle = getProfessionLabel([offer.tradeId]);

    if (getOfferAvailability(offer) !== 'available') {
        return { subtitle, badge: { label: Strings.publication.ended, tone: 'neutral' } };
    }
    if (isOfferUpcoming(offer)) {
        return { subtitle, badge: { label: Strings.publication.upcoming, tone: 'primary' } };
    }
    return {
        subtitle,
        badge: offer.discount ? { label: offer.discount, tone: 'danger' } : undefined,
    };
};
