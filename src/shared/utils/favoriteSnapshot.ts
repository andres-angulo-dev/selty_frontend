import { Annonce, FavoriteSnapshot, Offer, Professional } from '@/shared/types';

// ============================================
// Favorite snapshots — the small copy stored with a favorite at save time.
// Only what a greyed "no longer available" card needs: title, subtitle, image.
// One builder per kind so every screen stores the same shape.
// ============================================

/** "Plombier · Melun (77)" */
export const snapshotFromProfessional = (professional: Professional): FavoriteSnapshot => ({
    title: `${professional.firstName} ${professional.lastName}`,
    subtitle: `${professional.profession} · ${professional.city} (${professional.department})`,
    imageUrl: professional.avatar ?? undefined,
});

/** "Melun (77)" */
export const snapshotFromAnnonce = (annonce: Annonce): FavoriteSnapshot => ({
    title: annonce.title,
    subtitle: `${annonce.city} (${annonce.department})`,
    imageUrl: annonce.images[0],
});

/** "-15% · Maître Dupont" */
export const snapshotFromOffer = (offer: Offer): FavoriteSnapshot => ({
    title: offer.title,
    subtitle: offer.professional
        ? `${offer.discount} · ${offer.professional.firstName} ${offer.professional.lastName}`
        : offer.discount,
    imageUrl: offer.image ?? undefined,
});
