// ============================================
// MOCK CATEGORIES
// Id and name come from @sialty/domain (CATEGORIES, shared with the server).
// Display data (icon, color, counter) belongs to the app: CATEGORY_DISPLAY.
// ============================================

import { CATEGORIES } from '@sialty/domain';
import { Category } from "@/shared/types";

type CategoryDisplay = Pick<Category, 'icon' | 'color' | 'professionalsCount'>;

/** Display data per category id */
const CATEGORY_DISPLAY: Record<string, CategoryDisplay> = {
    'cat-1': { icon: 'hammer-outline', color: '#FF6B6B', professionalsCount: 45 },
    'cat-2': { icon: 'cut-outline', color: '#F8A5C2', professionalsCount: 32 },
    'cat-3': { icon: 'briefcase-outline', color: '#778BEB', professionalsCount: 18 },
    'cat-4': { icon: 'home-outline', color: '#63CDDA', professionalsCount: 27 },
    'cat-5': { icon: 'medkit-outline', color: '#E77F67', professionalsCount: 21 },
    'cat-6': { icon: 'school-outline', color: '#F3A683', professionalsCount: 15 },
    'cat-7': { icon: 'laptop-outline', color: '#596275', professionalsCount: 12 },
    'cat-8': { icon: 'calendar-outline', color: '#BEE3DB', professionalsCount: 9 },
};

/**
 * "Toutes" (no filter): an app-only entry, NOT a category of the catalogue.
 * It is never stored nor served by the API, so it is added here. Kept last,
 * where it already was: the mocks pick categories by index (mockCategories[0]
 * = Artisans), putting it first would shift them all.
 */
const ALL_CATEGORIES_ENTRY: Category = {
    id: 'cat-all',
    name: 'Toutes',
    icon: 'apps-outline',
    color: '#022448',
    professionalsCount: 0,
};

export const mockCategories: Category[] = [
    ...CATEGORIES.map((category) => ({
        id: category.id,
        name: category.name,
        ...CATEGORY_DISPLAY[category.id],
    })),
    ALL_CATEGORIES_ENTRY,
];
