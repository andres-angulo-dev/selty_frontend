// ============================================
// MOCK BANNERS (paid ad space)
// ============================================

import { Banner } from '../types';

export const mockBanners: Banner[] = [
    {
        id: 'banner-1',
        title: 'Jean Dupont - Plombier',
        subtitle: 'Intervention rapide 7j/7 dans le 77',
        backgroundColor: '#4A90D9',
        professionalId: 'pro-1',
    },
    {
        id: 'banner-2',
        title: 'Marie Martin - Coiffeuse',
        subtitle: 'Spécial mariage : essai coiffure offert !',
        backgroundColor: '#E88D9E',
        professionalId: 'pro-2',
    },
    {
        id: 'banner-3',
        title: 'Espace publicitaire',
        subtitle: 'Contactez-nous pour apparaitre ici',
        backgroundColor: '#A0A0A0',
        professionalId: null,
    },
]