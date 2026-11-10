import { describe, expect, it } from 'vitest';
import { CATEGORIES, TRADES } from '../index';

// Reference data shared by the app and the server.
describe('reference data', () => {
    it('has 9 categories', () => {
        expect(CATEGORIES).toHaveLength(9);
    });

    it('links every trade to a known category', () => {
        const categoryIds = new Set(CATEGORIES.map((category) => category.id));
        for (const trade of TRADES) {
            expect(categoryIds.has(trade.categoryId)).toBe(true);
        }
    });

    it('has unique trade ids', () => {
        expect(new Set(TRADES.map((trade) => trade.id)).size).toBe(TRADES.length);
    });

    it('keeps the stable ids', () => {
        expect(TRADES).toHaveLength(20);
        expect(TRADES.find((trade) => trade.id === 'trade-painter')?.categoryId).toBe('cat-1');
    });
});
