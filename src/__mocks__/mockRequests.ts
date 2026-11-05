import type { ServiceRequest } from '@/shared/types';
import { CURRENT_USER_AUTHOR } from './mockSession';

// Requests already published (other individuals + one by the current mock
// user 'user_001'), loaded into the Redux store at start. Covers every
// status: open, urgent, fulfilled and expired (expiresAt in the past).
// TEMPORARY: replaced by the API.

/** ISO date `days` days before now (negative = in the future) */
const daysAgo = (days: number): string =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/** ISO date `hours` hours before now */
const hoursAgo = (hours: number): string =>
    new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const mockRequests: ServiceRequest[] = [
    {
        id: 'request-1',
        tradeId: 'trade-painter',
        categoryId: 'cat-1',
        title: "Peinture d'un salon de 20 m²",
        description:
            'Bonjour, je cherche un artisan peintre pour repeindre les murs et boiseries de mon salon (environ 20 m²). Préparation des surfaces et finitions soignées souhaitées. Peinture satinée fournie ou à convenir ensemble.',
        urgency: 'this_week',
        photos: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop&q=80'],
        city: 'Melun',
        department: '77',
        latitude: 48.5421,
        longitude: 2.6554,
        author: { id: 'user_101', firstName: 'Sophie', lastNameInitial: 'M', memberSince: '2025-03-10T00:00:00.000Z' },
        status: 'open',
        createdAt: hoursAgo(2),
        expiresAt: daysAgo(-29.9),
    },
    {
        id: 'request-2',
        tradeId: 'trade-plumber',
        categoryId: 'cat-1',
        title: "Fuite sous l'évier de la cuisine",
        description:
            "Le siphon sous l'évier fuit depuis ce matin, j'ai coupé l'eau. Besoin d'une intervention rapide pour remplacer la pièce.",
        urgency: 'urgent',
        photos: [],
        city: 'Savigny-le-Temple',
        department: '77',
        latitude: 48.5741,
        longitude: 2.5826,
        author: { id: 'user_102', firstName: 'Karim', lastNameInitial: 'B', memberSince: '2025-06-02T00:00:00.000Z' },
        status: 'open',
        createdAt: hoursAgo(1),
        expiresAt: daysAgo(-29.95),
    },
    {
        id: 'request-3',
        tradeId: 'trade-tutor',
        categoryId: 'cat-6',
        title: 'Soutien scolaire en maths (niveau 3e)',
        description:
            'Je cherche un professeur pour mon fils en 3e, deux séances par semaine pour préparer le brevet.',
        urgency: 'this_month',
        photos: [],
        city: 'Pontault-Combault',
        department: '77',
        latitude: 48.8013,
        longitude: 2.6075,
        // Current mock user: shows "J'ai trouvé un pro" on this request
        author: CURRENT_USER_AUTHOR,
        status: 'open',
        createdAt: daysAgo(3),
        expiresAt: daysAgo(-27),
    },
    {
        id: 'request-4',
        tradeId: 'trade-electrician',
        categoryId: 'cat-1',
        title: 'Installation de 3 prises dans un garage',
        description: "Ajout de trois prises et d'un éclairage dans un garage attenant à la maison.",
        urgency: 'flexible',
        photos: [],
        city: 'Melun',
        department: '77',
        latitude: 48.5421,
        longitude: 2.6554,
        author: CURRENT_USER_AUTHOR,   // Shows "Pro trouvé" in "Mes demandes"
        // Test case: the author found a pro
        status: 'fulfilled',
        createdAt: daysAgo(12),
        expiresAt: daysAgo(-18),
    },
    {
        id: 'request-5',
        tradeId: 'trade-gardener',
        categoryId: 'cat-4',
        title: 'Taille de haies (30 mètres)',
        description: 'Taille de haies de thuyas, environ 30 mètres linéaires, évacuation des déchets comprise.',
        urgency: 'flexible',
        photos: [],
        city: 'Dammarie-les-Lys',
        department: '77',
        latitude: 48.5167,
        longitude: 2.6406,
        author: CURRENT_USER_AUTHOR,   // Shows "Expirée" in "Mes demandes"
        status: 'open',
        // Test case: expired (30 days passed without being fulfilled)
        createdAt: daysAgo(35),
        expiresAt: daysAgo(5),
    },
];
