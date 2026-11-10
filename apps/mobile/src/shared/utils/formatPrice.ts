// Direct file import: this pure function stays runnable outside React Native
import { Strings } from '@/shared/constants/strings';

/**
 * Formats an amount in the app language.
 *
 * @param amount Amount in euros
 * @returns e.g. 80 → "80,00 €"
 */
export const formatEuros = (amount: number): string =>
    amount.toLocaleString(Strings.locale, { style: 'currency', currency: 'EUR' });
