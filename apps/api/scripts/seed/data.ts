import type { SeedData } from '../../src/features/seed/seedContent';

// ============================================
// SEED DATA — transcribed from the app's sample data (apps/mobile/src/__mocks__).
// Left out on purpose: rating, reviewsCount, isCertified, distance, likesCount,
// commentsCount (the API has no such field), email, availability.
// Places are { city, department }: the seed finds the commune in the database.
// Dates are offsets from the day the seed runs.
// ============================================

const MELUN = { city: 'Melun', department: '77' };
const PONTAULT = { city: 'Pontault-Combault', department: '77' };
const TORCY = { city: 'Torcy', department: '77' };
const CHELLES = { city: 'Chelles', department: '77' };
const LAGNY = { city: 'Lagny-sur-Marne', department: '77' };

export const seedData: SeedData = {
    professionals: [
        {
            ref: 'pro-1',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@sialty.test',
            description: 'Plombier expérimenté depuis 15 ans. Intervention rapide et devis gratuit.',
            services: ['Plomberie', 'Chauffage', 'Sanitaire'],
            place: MELUN,
            locationType: 'mobile',
            phone: '06 12 34 56 78',
            startingPrice: 60,
            tradeIds: ['trade-plumber'],
            zones: [
                { kind: 'city', place: MELUN, radiusKm: 20 },
                { kind: 'department', code: '77' },
                { kind: 'department', code: '75' },
            ],
            coverImage: 'https://picsum.photos/seed/plombier-jean/400/240',
            memberSinceDaysAgo: 1336,
        },
        {
            ref: 'pro-2',
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@sialty.test',
            description: 'Coiffeuse à domicile. Spécialiste coloration et coiffure événementielle.',
            services: ['Coupe', 'Coloration', 'Coiffure mariage'],
            place: PONTAULT,
            locationType: 'both',
            phone: '06 98 76 54 32',
            startingPrice: 35,
            tradeIds: ['trade-hairdresser'],
            zones: [{ kind: 'city', place: PONTAULT, radiusKm: 10 }],
            coverImage: 'https://picsum.photos/seed/coiffure-marie/400/240',
            memberSinceDaysAgo: 1239,
        },
        {
            ref: 'pro-3',
            firstName: 'Paul',
            lastName: 'Leblanc',
            email: 'paul.leblanc@sialty.test',
            description: 'Avocat spécialisé en droit immobilier et droit des affaires.',
            services: ['Droit immobilier', 'Droit des affaires', 'Conseil juridique'],
            place: TORCY,
            locationType: 'fixed',
            phone: '01 64 12 34 56',
            startingPrice: 150,
            tradeIds: ['trade-lawyer'],
            zones: [{ kind: 'country' }],
            coverImage: 'https://picsum.photos/seed/avocat-paul/400/240',
            memberSinceDaysAgo: 1461,
        },
        {
            ref: 'pro-4',
            firstName: 'Sophie',
            lastName: 'Durand',
            email: 'sophie.durand@sialty.test',
            description: 'Coach sportif. Remise en forme, perte de poids, préparation physique.',
            services: ['Coaching individuel', 'Cours collectifs', 'Programme nutrition'],
            place: CHELLES,
            locationType: 'mobile',
            phone: '06 55 44 33 22',
            startingPrice: 45,
            tradeIds: ['trade-coach'],
            zones: [{ kind: 'city', place: CHELLES, radiusKm: 15 }],
            coverImage: 'https://picsum.photos/seed/coach-sophie/400/240',
            memberSinceDaysAgo: 1040,
        },
        {
            ref: 'pro-5',
            firstName: 'Lucas',
            lastName: 'Bernard',
            email: 'lucas.bernard@sialty.test',
            description: 'Électricien qualifié. Installation, dépannage et mise aux normes.',
            services: ['Installation électrique', 'Dépannage', 'Mise aux normes'],
            place: LAGNY,
            locationType: 'mobile',
            phone: '06 11 22 33 44',
            startingPrice: 55,
            tradeIds: ['trade-electrician'],
            zones: [
                { kind: 'city', place: LAGNY, radiusKm: 25 },
                { kind: 'department', code: '93' },
            ],
            coverImage: 'https://picsum.photos/seed/electro-lucas/400/240',
            memberSinceDaysAgo: 967,
        },
    ],

    // Ordered newest first, like the feed: 5, 1, 2, 3, 4, then 6 (the oldest)
    annonces: [
        {
            professionalRef: 'pro-1',
            title: 'Intervention plomberie dans le 77',
            description:
                'Disponible 7j/7 pour tous vos travaux de plomberie dans le département 77. Fuite, débouchage, installation... Devis gratuit, déplacement rapide.',
            images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=500&fit=crop&q=80'],
            place: MELUN,
            tradeId: 'trade-plumber',
            priceType: 'quote',
            createdDaysAgo: 2,
        },
        {
            professionalRef: 'pro-1',
            title: 'Remplacement chauffe-eau et installation sanitaire',
            description:
                'Spécialiste en remplacement de chauffe-eau, baignoire, douche et WC. Travail soigné, matériel de qualité. Devis gratuit sous 24h. Zone 77 et alentours.',
            images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=500&fit=crop&q=80'],
            place: MELUN,
            tradeId: 'trade-plumber',
            // The mock has no price type: quote is the safe default
            priceType: 'quote',
            createdDaysAgo: 27,
        },
        {
            professionalRef: 'pro-2',
            title: 'Coiffure à domicile - Spécial mariage',
            description:
                "Vous vous mariez bientôt ? Je me déplace chez vous pour la coiffure de la mariée et des demoiselles d'honneur. Essai offert!",
            images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop&q=80'],
            place: PONTAULT,
            tradeId: 'trade-hairdresser',
            priceType: 'quote',
            createdDaysAgo: 4,
        },
        {
            professionalRef: 'pro-3',
            title: 'Nouvelle loi immobilier 2025 - Ce que vous devez savoir',
            description:
                "La loi sur l'encadrement des loyers évolue en 2025. Je vous explique les changements et comment protéger vos droits en tant que propriétaire ou locataire.",
            images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=500&fit=crop&q=80'],
            place: TORCY,
            tradeId: 'trade-lawyer',
            priceType: 'quote',
            createdDaysAgo: 6,
        },
        {
            professionalRef: 'pro-4',
            title: 'Défi sportif : 30 jours pour se remettre en forme',
            description:
                'Je lance un défi gratuit de 30 jours ! Programme complet avec exercices quotidiens adaptés à votre niveau. Rejoignez le groupe !',
            images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=500&fit=crop&q=80'],
            place: CHELLES,
            tradeId: 'trade-coach',
            priceType: 'free',
            createdDaysAgo: 8,
        },
        {
            professionalRef: 'pro-5',
            title: 'Dépannage électrique urgent ce week-end',
            description:
                'Disponible ce samedi et dimanche pour tout dépannage électrique urgent. Panne de courant, court-circuit, tableau électrique. Intervention en 1h.',
            images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=500&fit=crop&q=80'],
            place: LAGNY,
            tradeId: 'trade-electrician',
            priceType: 'fixed',
            // The mock says "fixed" without an amount, the database requires one
            price: 90,
            createdDaysAgo: 1,
        },
    ],

    offers: [
        {
            professionalRef: 'pro-1',
            title: '-30% sur la plomberie',
            description:
                'Profitez de 30% de réduction sur toute intervention de plomberie. Devis gratuit et intervention sous 24h.',
            discount: '-30%',
            image: 'https://picsum.photos/seed/plomberie-offer/400/200',
            tradeId: 'trade-plumber',
            startsInDays: null,
            // Mock: 2027-06-30
            expiresInDays: 230,
            conditions: ['free_quote', 'fast_response', 'no_commitment'],
            createdDaysAgo: 9,
        },
        {
            professionalRef: 'pro-5',
            title: 'Devis gratuit',
            description: 'Devis gratuit pour toute installation électrique. Sans engagement.',
            discount: 'Gratuit',
            image: 'https://picsum.photos/seed/electricien-offer/400/200',
            tradeId: 'trade-electrician',
            startsInDays: null,
            expiresInDays: null,
            conditions: ['free_quote', 'no_commitment'],
            createdDaysAgo: 26,
        },
        {
            professionalRef: 'pro-2',
            title: '1ère coupe offerte',
            description: 'Votre première coupe est offerte ! Venez découvrir notre salon à domicile.',
            discount: 'Offert',
            image: 'https://picsum.photos/seed/coiffure-offer/400/200',
            tradeId: 'trade-hairdresser',
            startsInDays: null,
            // Mock: 2027-08-31
            expiresInDays: 294,
            conditions: ['first_session_free'],
            createdDaysAgo: 21,
        },
        {
            // The mock keeps this one ended on purpose (test case "Offre expirée")
            professionalRef: 'pro-3',
            title: '-15% consultation juridique',
            description: 'Réduction de 15% sur votre première consultation en droit immobilier.',
            discount: '-15%',
            image: 'https://picsum.photos/seed/avocat-offer/400/200',
            tradeId: 'trade-lawyer',
            startsInDays: -100,
            expiresInDays: -40,
            conditions: ['free_quote'],
            createdDaysAgo: 130,
        },
        {
            // No discount: no badge
            professionalRef: 'pro-4',
            title: 'Séance découverte offerte',
            description: 'Séance de coaching sportif découverte gratuite. Programme personnalisé inclus.',
            discount: null,
            image: 'https://picsum.photos/seed/coaching-offer/400/200',
            tradeId: 'trade-coach',
            startsInDays: null,
            expiresInDays: null,
            conditions: ['first_session_free', 'no_commitment'],
            createdDaysAgo: 6,
        },
    ],

    // An individual account with no content, to test the individual mode
    individuals: [{ firstName: 'Camille', email: 'particulier@sialty.test', memberSinceDaysAgo: 120 }],

    requests: [
        {
            author: { firstName: 'Sophie', lastName: 'M', email: 'sophie.m@sialty.test', memberSinceDaysAgo: 610 },
            tradeId: 'trade-painter',
            title: "Peinture d'un salon de 20 m²",
            description:
                'Bonjour, je cherche un artisan peintre pour repeindre les murs et boiseries de mon salon (environ 20 m²). Préparation des surfaces et finitions soignées souhaitées. Peinture satinée fournie ou à convenir ensemble.',
            urgency: 'this_week',
            photos: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop&q=80'],
            place: MELUN,
            status: 'open',
            createdHoursAgo: 2,
            expiresInDays: 29.9,
        },
        {
            author: { firstName: 'Karim', lastName: 'B', email: 'karim.b@sialty.test', memberSinceDaysAgo: 526 },
            tradeId: 'trade-plumber',
            title: "Fuite sous l'évier de la cuisine",
            description:
                "Le siphon sous l'évier fuit depuis ce matin, j'ai coupé l'eau. Besoin d'une intervention rapide pour remplacer la pièce.",
            urgency: 'urgent',
            photos: [],
            place: { city: 'Savigny-le-Temple', department: '77' },
            status: 'open',
            createdHoursAgo: 1,
            expiresInDays: 29.95,
        },
        {
            // Current mock user: shows "J'ai trouvé un pro" on this request
            author: { firstName: 'Alex', lastName: 'M', email: 'alex.m@sialty.test', memberSinceDaysAgo: 664 },
            tradeId: 'trade-tutor',
            title: 'Soutien scolaire en maths (niveau 3e)',
            description:
                'Je cherche un professeur pour mon fils en 3e, deux séances par semaine pour préparer le brevet.',
            urgency: 'this_month',
            photos: [],
            place: PONTAULT,
            status: 'open',
            createdHoursAgo: 72,
            expiresInDays: 27,
        },
        {
            // Test case: the author found a pro
            author: { firstName: 'Alex', lastName: 'M', email: 'alex.m@sialty.test', memberSinceDaysAgo: 664 },
            tradeId: 'trade-electrician',
            title: 'Installation de 3 prises dans un garage',
            description: "Ajout de trois prises et d'un éclairage dans un garage attenant à la maison.",
            urgency: 'flexible',
            photos: [],
            place: MELUN,
            status: 'fulfilled',
            createdHoursAgo: 12 * 24,
            expiresInDays: 18,
        },
        {
            // Test case: expired (30 days passed without being fulfilled)
            author: { firstName: 'Alex', lastName: 'M', email: 'alex.m@sialty.test', memberSinceDaysAgo: 664 },
            tradeId: 'trade-gardener',
            title: 'Taille de haies (30 mètres)',
            description: 'Taille de haies de thuyas, environ 30 mètres linéaires, évacuation des déchets comprise.',
            urgency: 'flexible',
            photos: [],
            place: { city: 'Dammarie-les-Lys', department: '77' },
            status: 'open',
            createdHoursAgo: 35 * 24,
            expiresInDays: -5,
        },
        {
            // Test case: right trade for the plumber, but far outside their zone
            author: { firstName: 'Inès', lastName: 'T', email: 'ines.t@sialty.test', memberSinceDaysAgo: 547 },
            tradeId: 'trade-plumber',
            title: "Remplacement d'un chauffe-eau",
            description: 'Chauffe-eau de 200 litres à remplacer dans un appartement, ancien appareil à évacuer.',
            urgency: 'this_month',
            photos: [],
            place: { city: 'Lyon', department: '69' },
            status: 'open',
            createdHoursAgo: 5,
            expiresInDays: 29.8,
        },
    ],
};
