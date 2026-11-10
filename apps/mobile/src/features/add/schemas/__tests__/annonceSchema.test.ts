import { ANNONCE_LIMITS, createAnnonceSchema, parsePriceInput } from '@/features/add/schemas/annonceSchema';
import { Strings } from '@/shared/constants/strings';

const messages = Strings.add.annonceForm.errors;
const schema = createAnnonceSchema(messages);

// A valid form: each case changes what it tests
const form = (over: object = {}) => ({
    photos: ['file:///cover.jpg'],
    title: 'Peinture de salon',
    tradeId: 'trade-painter',
    description: 'Une description assez longue pour passer.',
    location: {
        postalCode: '77000',
        city: 'Melun',
        department: '77',
        latitude: 48.54,
        longitude: 2.65,
        communeCode: '77288',
        surfaceHectares: 800,
    },
    priceType: ['quote'],
    price: '',
    ...over,
});

const errorOn = (field: string, over: object) =>
    schema.safeParse(form(over)).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe('parsePriceInput', () => {
    it.each([
        ['80', 80],
        ['49,90', 49.9],
        ['49.9', 49.9],
        [' 80 ', 80],
    ])('reads %s', (text, amount) => {
        expect(parsePriceInput(text)).toBe(amount);
    });

    it.each(['', 'abc', '12,345', '1234567', '-5'])('refuses "%s"', (text) => {
        expect(parsePriceInput(text)).toBeNull();
    });
});

describe('annonce form', () => {
    it('accepts a valid form', () => {
        expect(schema.safeParse(form()).success).toBe(true);
    });

    it('trims the title', () => {
        expect(schema.parse(form({ title: '  Peinture de salon  ' })).title).toBe('Peinture de salon');
    });

    it('requires a title and a description of the right length', () => {
        expect(errorOn('title', { title: 'abc' })).toBe(messages.titleMin);
        expect(errorOn('title', { title: 'x'.repeat(ANNONCE_LIMITS.titleMax + 1) })).toBe(messages.titleMax);
        expect(errorOn('description', { description: 'court' })).toBe(messages.descriptionMin);
    });

    it('requires a price type', () => {
        expect(errorOn('priceType', { priceType: [] })).toBe(messages.priceType);
    });

    it('ignores the amount unless the price is fixed', () => {
        expect(schema.safeParse(form({ priceType: ['free'], price: 'abc' })).success).toBe(true);
    });

    it('checks the amount of a fixed price', () => {
        const fixed = (price: string) => ({ priceType: ['fixed'], price });
        expect(errorOn('price', fixed(''))).toBe(messages.priceRequired);
        expect(errorOn('price', fixed('abc'))).toBe(messages.priceInvalid);
        expect(errorOn('price', fixed('0'))).toBe(messages.priceRange);
        expect(errorOn('price', fixed(String(ANNONCE_LIMITS.priceMax + 1)))).toBe(messages.priceRange);
        expect(schema.safeParse(form(fixed('80'))).success).toBe(true);
    });

    it('refuses a city typed without being picked from the list', () => {
        const location = { ...form().location, department: '' };
        expect(schema.safeParse(form({ location })).success).toBe(false);
    });
});
