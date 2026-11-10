import React from 'react';
import { Strings } from '@/shared/constants';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField, SelectOption } from '@/shared/components/SelectField';

// ============================================
// TRADE FIELD — "Métier" of a publication (annonce, offer)
// A plumber cannot publish for a painter: the field only offers the
// professional's own trades. With a single trade there is nothing to choose,
// so it is shown frozen; the form starts with it (see getInitialTradeId).
// ============================================

const texts = Strings.add.annonceForm.fields;

interface TradeFieldProps {
    options: SelectOption[];             // The professional's trades
    value: string;
    onChange: (tradeId: string) => void;
    onBlur: () => void;
    error?: string;
}

/**
 * Initial value of the field. Being a default value, it does not make the form
 * "dirty": leaving an untouched form asks for no confirmation.
 *
 * @param options The professional's trades
 * @returns The trade when there is only one, otherwise an empty choice
 */
export const getInitialTradeId = (options: SelectOption[]): string =>
    options.length === 1 ? options[0].value : '';

export const TradeField: React.FC<TradeFieldProps> = ({ options, value, onChange, onBlur, error }) => {
    if (options.length === 1) {
        return <FormInput label={texts.trade} value={options[0].label} editable={false} error={error} />;
    }

    return (
        <SelectField
            label={texts.trade}
            options={options}
            value={value}
            onChange={onChange}
            onClose={onBlur}
            placeholder={texts.tradePlaceholder}
            searchPlaceholder={texts.tradeSearch}
            emptyText={texts.tradeEmpty}
            closeLabel={Strings.selectField.close}
            error={error}
        />
    );
};
