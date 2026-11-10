import { getTradeById } from '@/__mocks__/mockTrades';
// Direct file import: this pure function stays runnable outside React Native
import { Strings } from '@/shared/constants/strings';

/**
 * Public profession of a professional, derived from their trades so the label
 * can never disagree with what they are allowed to answer or publish.
 *
 * @param tradeIds Trades of the professional; the first known one is the main one
 * @returns The label of the main trade, or a neutral label when none is usable
 */
export const getProfessionLabel = (tradeIds: string[]): string => {
    // Scan in order: an unknown ID (removed trade) must not hide the next one
    for (const id of tradeIds) {
        const trade = getTradeById(id);
        if (trade) return trade.label;
    }
    return Strings.serviceArea.defaultProfession;
};
