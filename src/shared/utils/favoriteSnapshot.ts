import { Annonce, FavoriteSnapshot, Offer, Professional } from '@/shared/types';
import { getProfessionLabel } from '@/shared/utils/professionLabel';

// ============================================
// Favorite snapshots — the small copy stored with a favorite at save time.
// Only what a greyed "no longer available" card needs: title, subtitle, image.
// One builder per kind so every screen stores the same shape.
// ============================================

/** "Plombier · Melun (77)" */
export const snapshotFromProfessional = (professional: Professional): FavoriteSnapshot => ({
    title: `${professional.firstName} ${professional.lastName}`,
    subtitle: `${getProfessionLabel(professional.tradeIds)} · ${professional.city} (${professional.department})`,
    imageUrl: professional.avatar ?? undefined,
});

/** "Melun (77)" */
export const snapshotFromAnnonce = (annonce: Annonce): FavoriteSnapshot => ({
    title: annonce.title,
    subtitle: `${annonce.city} (${annonce.department})`,
    imageUrl: annonce.images[0],
});

/** "-15% · Maître Dupont", or only one of them when the other is missing */
export const snapshotFromOffer = (offer: Offer): FavoriteSnapshot => {
    const professionalName = offer.professional
        ? `${offer.professional.firstName} ${offer.professional.lastName}`
        : null;
    // filter(Boolean) removes the missing parts, so "null" is never written
    const subtitle = [offer.discount, professionalName].filter(Boolean).join(' · ');

    return {
        title: offer.title,
        subtitle: subtitle || undefined,
        imageUrl: offer.image ?? undefined,
    };
};
