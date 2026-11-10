import type { Trade } from '../types';

/**
 * Every trade a professional can practise and an individual can look for.
 * Each trade belongs to a broad category (see CATEGORIES). IDs are stable:
 * they are stored in the database and sent by the API.
 * `isRemoteCapable` = can be done at a distance, the only case where a
 * "whole country" zone applies.
 */
export const TRADES: readonly Trade[] = [
    // cat-1 Artisans
    { id: 'trade-painter', label: 'Peintre', categoryId: 'cat-1' },
    { id: 'trade-plumber', label: 'Plombier', categoryId: 'cat-1' },
    { id: 'trade-heating', label: 'Chauffagiste', categoryId: 'cat-1' },
    { id: 'trade-electrician', label: 'Électricien', categoryId: 'cat-1' },
    { id: 'trade-carpenter', label: 'Menuisier', categoryId: 'cat-1' },
    { id: 'trade-mason', label: 'Maçon', categoryId: 'cat-1' },
    { id: 'trade-tiler', label: 'Carreleur', categoryId: 'cat-1' },
    { id: 'trade-locksmith', label: 'Serrurier', categoryId: 'cat-1' },
    // cat-2 Beauté
    { id: 'trade-hairdresser', label: 'Coiffeur', categoryId: 'cat-2' },
    { id: 'trade-beautician', label: 'Esthéticienne', categoryId: 'cat-2' },
    // cat-3 Juridique
    { id: 'trade-lawyer', label: 'Avocat', categoryId: 'cat-3', isRemoteCapable: true },
    { id: 'trade-notary', label: 'Notaire', categoryId: 'cat-3', isRemoteCapable: true },
    // cat-4 Maison
    { id: 'trade-gardener', label: 'Jardinier', categoryId: 'cat-4' },
    { id: 'trade-cleaner', label: 'Aide ménagère', categoryId: 'cat-4' },
    // cat-5 Santé
    { id: 'trade-physio', label: 'Kinésithérapeute', categoryId: 'cat-5' },
    { id: 'trade-coach', label: 'Coach sportif', categoryId: 'cat-5' },
    // cat-6 Cours
    { id: 'trade-tutor', label: 'Professeur particulier', categoryId: 'cat-6', isRemoteCapable: true },
    // cat-7 Tech
    { id: 'trade-it-support', label: 'Dépannage informatique', categoryId: 'cat-7', isRemoteCapable: true },
    // cat-8 Événements
    { id: 'trade-photographer', label: 'Photographe', categoryId: 'cat-8' },
    { id: 'trade-caterer', label: 'Traiteur', categoryId: 'cat-8' },
];
