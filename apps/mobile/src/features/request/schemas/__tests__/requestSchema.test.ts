import { createRequestSchema, REQUEST_LIMITS } from '@/features/request/schemas/requestSchema';
import { Strings } from '@/shared/constants/strings';

const messages = Strings.request.form.errors;
const schema = createRequestSchema(messages);

// A valid form: each case changes what it tests
const form = (over: object = {}) => ({
    tradeId: 'trade-painter',
    title: "Besoin d'un peintre",
    description: 'Une description assez longue pour passer.',
    urgency: ['this_week'],
    location: {
        postalCode: '77000',
        city: 'Melun',
        department: '77',
        latitude: 48.54,
        longitude: 2.65,
        communeCode: '77288',
        surfaceHectares: 800,
    },
    photos: [],
    ...over,
});

const errorOn = (field: string, over: object) =>
    schema.safeParse(form(over)).error?.issues.find((issue) => issue.path[0] === field)?.message;

describe('request form', () => {
    it('accepts a valid form, photos being optional', () => {
        expect(schema.safeParse(form()).success).toBe(true);
    });

    it('requires a trade', () => {
        expect(errorOn('tradeId', { tradeId: '' })).toBe(messages.trade);
    });

    it('checks the length of the title and the description', () => {
        expect(errorOn('title', { title: 'abc' })).toBe(messages.titleMin);
        expect(errorOn('title', { title: 'x'.repeat(REQUEST_LIMITS.titleMax + 1) })).toBe(messages.titleMax);
        expect(errorOn('description', { description: 'court' })).toBe(messages.descriptionMin);
        expect(errorOn('description', { description: 'x'.repeat(REQUEST_LIMITS.descriptionMax + 1) })).toBe(
            messages.descriptionMax,
        );
    });

    it('requires exactly one urgency', () => {
        expect(errorOn('urgency', { urgency: [] })).toBe(messages.urgency);
    });

    it('limits the photos', () => {
        expect(errorOn('photos', { photos: ['a', 'b', 'c', 'd'] })).toBe(messages.photosMax);
    });

    it('refuses a city typed without being picked from the list', () => {
        const location = { ...form().location, department: '' };
        expect(schema.safeParse(form({ location })).success).toBe(false);
    });
});
