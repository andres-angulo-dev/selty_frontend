import { buildPublishedAnnonce, buildPublishedOffer } from '@/features/add/utils/buildPublication';
import type { AnnonceFormOutput } from '@/features/add/schemas/annonceSchema';
import type { OfferFormOutput } from '@/features/add/schemas/offerSchema';
import { hydrateAnnonce, hydrateOffer, listAnnonces, listOffers } from '@/shared/utils/publications';
import { mockAnnonces } from '@/__mocks__/mockAnnonces';
import { mockOffers } from '@/__mocks__/mockOffers';
import { getOfferAvailability } from '@/shared/utils/availability';

const now = new Date('2026-11-06T10:00:00.000Z');

const annonceForm = (over: Partial<AnnonceFormOutput>) =>
    ({
        photos: ['file:///cover.jpg', 'file:///second.jpg'],
        title: 'Peinture de salon',
        tradeId: 'trade-painter',
        description: 'Une description assez longue pour passer.',
        location: { postalCode: '77000', city: 'Melun', department: '77' },
        priceType: ['quote'],
        price: '',
        ...over,
    }) as AnnonceFormOutput;

const offerForm = (over: Partial<OfferFormOutput>) =>
    ({
        image: [],
        title: 'Diagnostic offert',
        discount: null,
        tradeId: 'trade-plumber',
        description: 'Une description assez longue pour passer.',
        startsAt: null,
        expiresAt: null,
        conditions: ['free_quote'],
        ...over,
    }) as OfferFormOutput;

describe('buildPublishedAnnonce', () => {
    it('turns the form into an annonce of the signed-in professional', () => {
        const annonce = buildPublishedAnnonce(annonceForm({}), now);
        expect(annonce).toMatchObject({
            id: `annonce-${now.getTime()}`,
            professionalId: 'pro-1',
            tradeId: 'trade-painter',
            categoryId: 'cat-1',
            images: ['file:///cover.jpg', 'file:///second.jpg'],
            city: 'Melun',
            department: '77',
            priceType: 'quote',
            isActive: true,
            createdAt: now.toISOString(),
        });
        expect(annonce.isFree).toBeUndefined();
        expect(annonce.price).toBeUndefined();
    });

    it('puts each price type in the right field', () => {
        const fixed = buildPublishedAnnonce(annonceForm({ priceType: ['fixed'], price: '49,90' }), now);
        expect(fixed.priceType).toBe('fixed');
        expect(fixed.price).toBe(49.9);

        const free = buildPublishedAnnonce(annonceForm({ priceType: ['free'] }), now);
        expect(free.isFree).toBe(true);
        expect(free.priceType).toBeUndefined();
    });

    it('stays serializable, as the store requires', () => {
        const annonce = buildPublishedAnnonce(annonceForm({}), now);
        expect(JSON.parse(JSON.stringify(annonce))).toEqual(annonce);
    });
});

describe('buildPublishedOffer', () => {
    it('keeps null for what was left empty', () => {
        const offer = buildPublishedOffer(offerForm({}), now);
        expect(offer).toMatchObject({ image: null, discount: null, startsAt: null, expiresAt: null });
        expect(offer.conditions).toEqual(['free_quote']);
        expect(JSON.parse(JSON.stringify(offer))).toEqual(offer);
    });

    it('stores dates as text', () => {
        const end = new Date('2027-01-15T00:00:00.000Z');
        const offer = buildPublishedOffer(offerForm({ image: ['file:///o.jpg'], discount: '-30 %', expiresAt: end }), now);
        expect(offer).toMatchObject({ image: 'file:///o.jpg', discount: '-30 %', expiresAt: end.toISOString() });
    });
});

describe('reading publications back', () => {
    it('rebuilds a normal annonce for the screens', () => {
        const annonce = hydrateAnnonce(buildPublishedAnnonce(annonceForm({}), now));
        expect(annonce.professional?.id).toBe('pro-1');
        expect(annonce.category?.id).toBe('cat-1');
        expect(annonce.createdAt).toEqual(now);
    });

    it('rebuilds a normal offer for the screens', () => {
        const end = new Date('2099-01-15T00:00:00.000Z');
        const offer = hydrateOffer(buildPublishedOffer(offerForm({ expiresAt: end }), now));
        expect(offer.expiresAt).toEqual(end);
        expect(offer.startsAt).toBeNull();
        expect(offer.professional?.id).toBe('pro-1');
        expect(getOfferAvailability(offer)).toBe('available');
    });

    it('lists published items first, and keeps the mocks', () => {
        const annonce = buildPublishedAnnonce(annonceForm({}), now);
        const annonces = listAnnonces([annonce]);
        expect(annonces).toHaveLength(mockAnnonces.length + 1);
        expect(annonces[0].id).toBe(annonce.id);
        expect(listAnnonces([]).map((item) => item.id)).toEqual(mockAnnonces.map((item) => item.id));

        const offer = buildPublishedOffer(offerForm({}), now);
        const offers = listOffers([offer]);
        expect(offers).toHaveLength(mockOffers.length + 1);
        expect(offers[0].id).toBe(offer.id);
    });
});
