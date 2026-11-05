import type { Trade } from '@/shared/types';
import type { SelectOption } from '@/shared/components/SelectField';

// Trades an individual can target in a request ("Métier recherché").
// Each trade belongs to a broad category (mockCategories) so the feed can
// filter by category and pros by trade. TEMPORARY: will come from the API.
export const mockTrades: Trade[] = [
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
    // cat-6 Cours
    { id: 'trade-tutor', label: 'Professeur particulier', categoryId: 'cat-6', isRemoteCapable: true },
    // cat-7 Tech
    { id: 'trade-it-support', label: 'Dépannage informatique', categoryId: 'cat-7', isRemoteCapable: true },
    // cat-8 Événements
    { id: 'trade-photographer', label: 'Photographe', categoryId: 'cat-8' },
    { id: 'trade-caterer', label: 'Traiteur', categoryId: 'cat-8' },
];

/** Used by the "Toute la France" zone: only a trade that can be done at a distance */
export const isTradeRemoteCapable = (id: string): boolean => getTradeById(id)?.isRemoteCapable === true;

/** Same list for the searchable SelectField */
export const TRADE_OPTIONS: SelectOption[] = mockTrades.map((trade) => ({
    value: trade.id,
    label: trade.label,
}));

/** Lookup by ID (undefined for an unknown trade) */
export const getTradeById = (id: string): Trade | undefined =>
    mockTrades.find((trade) => trade.id === id);
