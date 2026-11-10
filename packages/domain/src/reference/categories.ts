/** A broad category of trades. Display (icon, color, counters) stays in the app. */
export interface CategoryRef {
    id: string;
    name: string;
}

/**
 * Categories of the catalogue, IDs stable. `cat-all` is the "no filter"
 * entry the app shows first; it owns no trade.
 */
export const CATEGORIES: readonly CategoryRef[] = [
    { id: 'cat-1', name: 'Artisans' },
    { id: 'cat-2', name: 'Beauté' },
    { id: 'cat-3', name: 'Juridique' },
    { id: 'cat-4', name: 'Maison' },
    { id: 'cat-5', name: 'Santé' },
    { id: 'cat-6', name: 'Cours' },
    { id: 'cat-7', name: 'Tech' },
    { id: 'cat-8', name: 'Événements' },
    { id: 'cat-all', name: 'Toutes' },
];
