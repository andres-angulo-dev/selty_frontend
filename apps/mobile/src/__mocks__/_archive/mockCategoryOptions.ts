import { mockCategories } from '@/__mocks__/mockCategories';
import type { SelectOption } from '@/shared/components/SelectField';

// Category choices of the annonce and offer forms (moved from features/add/data 2026-11-03: shared by several features).
// "Toutes" is a Home filter, not a real category a professional can choose.
// TEMPORARY source: the categories will come from the API.
export const CATEGORY_OPTIONS: SelectOption[] = mockCategories
    .filter((category) => category.id !== 'cat-all')
    .map((category) => ({ value: category.id, label: category.name }));
