import { getProfessionLabel } from '@/shared/utils/professionLabel';
import { getTradeById } from '@/__mocks__/mockTrades';
import { mockProfessionals } from '@/__mocks__/mockProfessionals';

describe('getProfessionLabel', () => {
    it('uses the first trade as the main profession', () => {
        expect(getProfessionLabel(['trade-plumber', 'trade-heating'])).toBe('Plombier');
    });

    it('skips an unknown trade', () => {
        expect(getProfessionLabel(['unknown', 'trade-plumber'])).toBe('Plombier');
    });

    it('falls back on a neutral label when no trade is usable', () => {
        expect(getProfessionLabel([])).toBe('Professionnel');
        expect(getProfessionLabel(['unknown'])).toBe('Professionnel');
    });
});

describe('mock professionals', () => {
    it.each(mockProfessionals.map((pro) => [pro.id, pro] as const))('%s has known trades and a zone', (_id, pro) => {
        expect(pro.tradeIds.length).toBeGreaterThan(0);
        pro.tradeIds.forEach((id) => expect(getTradeById(id)).toBeDefined());
        expect(pro.zones.length).toBeGreaterThan(0);
    });
});
