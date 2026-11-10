// ============================================
// MOCK REVIEWS
// ============================================

import { Review } from "@/features/profile/types";

export const mockReviews: Review[] = [
    // Reviews for Jean Dupont (pro-1)
    {
       id: 'review-1',
        userId: 'user-1',
        userName: 'Alice Moreau',
        userAvatar: null,
        professionalId: 'pro-1',
        professionalName: 'Jean Dupont',
        professionalAvatar: null,
        rating: 5,
        comment: 'Excellent plombier, intervention rapide et travail soigné. Je recommande !',
        createdAt: new Date('2025-01-15'),
        updatedAt: null,
    },
    {
        id: 'review-2',
        userId: 'user-2',
        userName: 'Thomas Petit',
        userAvatar: null,
        professionalId: 'pro-1',
        professionalName: 'Jean Dupont',
        professionalAvatar: null,
        rating: 4,
        comment: 'Bon travail, ponctuel. Le prix est correct pour la qualité.',
        createdAt: new Date('2025-01-20'),
        updatedAt: null,
    },

    // Reviews for Marie Martin (pro-2)
    {
        id: 'review-3',
        userId: 'user-3',
        userName: 'Camille Leroy',
        userAvatar: null,
        professionalId: 'pro-2',
        professionalName: 'Marie Martin',
        professionalAvatar: null,
        rating: 5,
        comment: 'Marie est incroyable ! Ma coiffure de mariage était parfaite.',
        createdAt: new Date('2025-02-01'),
        updatedAt: null,
    },
    {
        id: 'review-4',
        userId: 'user-4',
        userName: 'Julie Roux',
        userAvatar: null,
        professionalId: 'pro-2',
        professionalName: 'Marie Martin',
        professionalAvatar: null,
        rating: 5,
        comment: 'Très professionnelle et à l\'écoute. Résultat au top !',
        createdAt: new Date('2025-02-05'),
        updatedAt: null,
    },

    // Reviews for Paul Leblanc (pro-3)
    {
        id: 'review-5',
        userId: 'user-5',
        userName: 'Marc Dubois',
        userAvatar: null,
        professionalId: 'pro-3',
        professionalName: 'Paul Leblanc',
        professionalAvatar: null,
        rating: 4,
        comment: 'Bon avocat, conseils clairs et pertinents sur mon dossier immobilier.',
        createdAt: new Date('2024-12-10'),
        updatedAt: null,
    },

    // Reviews for Sophie Durand (pro-4)
    {
        id: 'review-6',
        userId: 'user-6',
        userName: 'Nicolas Garcia',
        userAvatar: null,
        professionalId: 'pro-4',
        professionalName: 'Sophie Durand',
        professionalAvatar: null,
        rating: 5,
        comment: 'Sophie m\'a motivé comme jamais. J\'ai perdu 8kg en 2 mois !',
        createdAt: new Date('2025-01-28'),
        updatedAt: null,
    },
    {
        id: 'review-7',
        userId: 'user-7',
        userName: 'Emma Laurent',
        userAvatar: null,
        professionalId: 'pro-4',
        professionalName: 'Sophie Durand',
        professionalAvatar: null,
        rating: 4,
        comment: 'Bons exercices, bien adapté à mon niveau. Je continue !',
        createdAt: new Date('2025-02-08'),
        updatedAt: null,
    },
]