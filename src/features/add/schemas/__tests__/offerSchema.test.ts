import type { Offer, Professional } from '@/shared/types';
import { createOfferSchema } from '@/features/add/schemas/offerSchema';
import { Strings } from '@/shared/constants/strings';
import { snapshotFromOffer } from '@/shared/utils/favoriteSnapshot';

const messages = Strings.add.offerForm.errors;
const schema = createOfferSchema(messages);

// A valid form: only the discount changes from one case to the next
const form = (discount: string) => ({
    image: [],
    title: 'Diagnostic offert',
    discount,
    tradeId: 'trade-plumber',
    description: 'Une description assez longue pour passer.',
    startsAt: null,
    expiresAt: null,
    conditions: [],
});

const discountError = (discount: string): string | undefined =>
    schema.safeParse(form(discount)).error?.issues.find((issue) => issue.path[0] === 'discount')?.message;

describe('offer discount', () => {
    it('is optional: empty becomes null', () => {
        expect(schema.parse(form('')).discount).toBeNull();
        expect(schema.parse(form('   ')).discount).toBeNull();
    });

    it.each(['-30 %', '1 séance offerte', '10%', '0,5 %'])('keeps a real advantage: %s', (discount) => {
        expect(schema.parse(form(discount)).discount).toBe(discount);
    });

    it.each(['0', '00', '0%', '0 %', '-0 %', '0,00 €', '0.0'])('refuses zero: %s', (zero) => {
        expect(discountError(zero)).toBe(messages.discountZero);
    });

    it('is limited in length', () => {
        expect(discountError('x'.repeat(31))).toBe(messages.discountMax);
    });
});

describe('snapshotFromOffer', () => {
    const pro = { firstName: 'Jean', lastName: 'Dupont' } as Professional;
    const offer = (over: Partial<Offer>) => ({ title: 'Offre', image: null, ...over }) as Offer;

    it('never writes "null" in the saved copy', () => {
        expect(snapshotFromOffer(offer({ discount: '-15%', professional: pro })).subtitle).toBe('-15% · Jean Dupont');
        expect(snapshotFromOffer(offer({ discount: null, professional: pro })).subtitle).toBe('Jean Dupont');
        expect(snapshotFromOffer(offer({ discount: '-15%', professional: null })).subtitle).toBe('-15%');
        expect(snapshotFromOffer(offer({ discount: null, professional: null })).subtitle).toBeUndefined();
    });
});
