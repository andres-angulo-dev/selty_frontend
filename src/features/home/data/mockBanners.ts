// ============================================
// MOCK BANNERS (paid ad space)
// ============================================

import { Banner } from '../types';

export const mockBanners: Banner[] = [
    {
        id: 'banner-1',
        title: 'Votre expert à portée de main',
        subtitle: 'Pros certifiés • Avis vérifiés • Devis gratuit',
        backgroundColor: '#1e3a5f',
        gradientColors: ['#1e3a5f', '#4A90D9'],
        ctaLabel: 'Explorer',
        professionalId: null,
    },
    {
        id: 'banner-2',
        title: 'Marie Martin - Coiffeuse',
        subtitle: 'Spécial mariage : essai coiffure offert !',
        backgroundColor: '#E88D9E',
        imageUrl: 'https://picsum.photos/seed/coiffure-salon/800/360',
        ctaLabel: 'Réserver',
        professionalId: 'pro-2',
    },
    {
        id: 'banner-3',
        title: 'Espace publicitaire',
        subtitle: 'Contactez-nous pour apparaître ici',
        backgroundColor: '#A0A0A0',
        imageUrl: 'https://picsum.photos/seed/renovation-pro/800/360',
        ctaLabel: 'En savoir plus',
        professionalId: null,
    },
]