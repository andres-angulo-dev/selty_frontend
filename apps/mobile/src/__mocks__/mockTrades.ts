import { TRADES } from '@sialty/domain';
import type { Trade } from '@/shared/types';
import type { SelectOption } from '@/shared/components/SelectField';

// Trades an individual can target in a request ("Métier recherché").
// The list itself lives in @sialty/domain (TRADES), shared with the server;
// only the helpers below belong to the app.
export const mockTrades: Trade[] = [...TRADES];

/** Used by the "Toute la France" zone: only a trade that can be done at a distance */
export const isTradeRemoteCapable = (id: string): boolean => getTradeById(id)?.isRemoteCapable === true;

/** Same list for the searchable SelectField */
export const TRADE_OPTIONS: SelectOption[] = mockTrades.map((trade) => ({
    value: trade.id,
    label: trade.label,
}));

/**
 * Options of a form limited to some trades (a professional publishes only in their own).
 *
 * @param tradeIds Trades to offer, in this order; unknown IDs are skipped
 * @returns Options for SelectField
 */
export const getTradeOptions = (tradeIds: string[]): SelectOption[] =>
    TRADE_OPTIONS.filter((option) => tradeIds.includes(option.value))
        .sort((a, b) => tradeIds.indexOf(a.value) - tradeIds.indexOf(b.value));

/** Lookup by ID (undefined for an unknown trade) */
export const getTradeById = (id: string): Trade | undefined =>
    mockTrades.find((trade) => trade.id === id);
