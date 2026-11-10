import { getTradeById, getTradeOptions } from '@/__mocks__/mockTrades';
import { mockAnnonces } from '@/__mocks__/mockAnnonces';
import { mockOffers } from '@/__mocks__/mockOffers';
import { createAnnonceSchema } from '@/features/add/schemas/annonceSchema';
import { createOfferSchema } from '@/features/add/schemas/offerSchema';
import { Strings } from '@/shared/constants/strings';

describe('getTradeOptions', () => {
    it("offers only the given trades, in the professional's order", () => {
        expect(getTradeOptions(['trade-plumber'])).toEqual([{ value: 'trade-plumber', label: 'Plombier' }]);
        expect(getTradeOptions(['trade-painter', 'trade-plumber']).map((option) => option.label)).toEqual([
            'Peintre',
            'Plombier',
        ]);
    });

    it('skips an unknown trade', () => {
        expect(getTradeOptions(['unknown'])).toEqual([]);
    });
});

describe('mock publications', () => {
    it.each([...mockAnnonces, ...mockOffers].map((item) => [item.id, item] as const))(
        '%s belongs to a trade of its professional, and its category follows the trade',
        (_id, item) => {
            expect(item.professional?.tradeIds).toContain(item.tradeId);
            expect(getTradeById(item.tradeId)?.categoryId).toBe(item.categoryId);
        },
    );
});

describe('a form without a trade', () => {
    const tradeError = (result: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
        result.error?.issues.find((issue) => issue.path[0] === 'tradeId')?.message;

    it('is refused for an annonce', () => {
        const errors = Strings.add.annonceForm.errors;
        expect(tradeError(createAnnonceSchema(errors, Strings.locationFields.errors).safeParse({ tradeId: '' }))).toBe('Choisissez un métier.');
    });

    it('is refused for an offer', () => {
        const errors = Strings.add.offerForm.errors;
        expect(tradeError(createOfferSchema(errors).safeParse({ tradeId: '' }))).toBe('Choisissez un métier.');
    });
});
