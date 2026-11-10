import type { Annonce, Offer } from '@/shared/types';
import { getAnnonceRow, getOfferRow } from '@/features/publication/utils/publicationRows';
import { isMine } from '@/shared/utils/publications';
import { isOfferLive, isOfferUpcoming } from '@/shared/utils/availability';
import { Strings } from '@/shared/constants/strings';

const priceTypes = Strings.add.annonceForm.priceTypes;

const annonce = (over: Partial<Annonce>) =>
    ({ tradeId: 'trade-plumber', city: 'Melun', department: '77', ...over }) as Annonce;
const offer = (over: Partial<Offer>) =>
    ({ tradeId: 'trade-plumber', isActive: true, startsAt: null, expiresAt: null, discount: null, ...over }) as Offer;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const laterToday = new Date();
laterToday.setHours(23, 59, 0, 0);
const past = new Date('2020-01-01');

describe('getAnnonceRow', () => {
    it('names the trade and the place', () => {
        expect(getAnnonceRow(annonce({})).subtitle).toBe('Plombier · Melun (77)');
    });

    it('shows the price', () => {
        expect(getAnnonceRow(annonce({ priceType: 'quote' })).badge).toEqual({ label: priceTypes.quote, tone: 'neutral' });
        expect(getAnnonceRow(annonce({ isFree: true })).badge).toEqual({ label: priceTypes.free, tone: 'neutral' });
        expect(getAnnonceRow(annonce({})).badge).toBeUndefined();
    });

    it('shows the amount of a fixed price when known', () => {
        // \s: the French format uses a non-breaking space
        expect(getAnnonceRow(annonce({ priceType: 'fixed', price: 80 })).badge?.label).toMatch(/^Prix fixe · 80,00\s€$/);
        expect(getAnnonceRow(annonce({ priceType: 'fixed' })).badge?.label).toBe(priceTypes.fixed);
    });
});

describe('getOfferRow', () => {
    const ended = { label: Strings.publication.ended, tone: 'neutral' };

    it('shows the trade and the discount, nothing without one', () => {
        expect(getOfferRow(offer({})).subtitle).toBe('Plombier');
        expect(getOfferRow(offer({ discount: '-30 %' })).badge).toEqual({ label: '-30 %', tone: 'danger' });
        expect(getOfferRow(offer({})).badge).toBeUndefined();
    });

    it('says when an offer is over, before its discount', () => {
        expect(getOfferRow(offer({ discount: '-30 %', expiresAt: past })).badge).toEqual(ended);
        expect(getOfferRow(offer({ isActive: false })).badge).toEqual(ended);
    });

    it('says when an offer has not started, before its discount', () => {
        expect(getOfferRow(offer({ discount: '-30 %', startsAt: tomorrow })).badge).toEqual({
            label: Strings.publication.upcoming,
            tone: 'primary',
        });
    });
});

describe('offer timing', () => {
    it('counts an offer starting today as started', () => {
        expect(isOfferUpcoming(offer({ startsAt: tomorrow }))).toBe(true);
        expect(isOfferUpcoming(offer({ startsAt: laterToday }))).toBe(false);
        expect(isOfferUpcoming(offer({}))).toBe(false);
    });

    it('calls live only an offer running now', () => {
        expect(isOfferLive(offer({}))).toBe(true);
        expect(isOfferLive(offer({ startsAt: tomorrow }))).toBe(false);
        expect(isOfferLive(offer({ expiresAt: past }))).toBe(false);
        expect(isOfferLive(offer({ isActive: false }))).toBe(false);
    });
});

describe('isMine', () => {
    it("recognizes the signed-in professional's publications", () => {
        expect(isMine({ professionalId: 'pro-1' })).toBe(true);
        expect(isMine({ professionalId: 'pro-2' })).toBe(false);
    });
});
