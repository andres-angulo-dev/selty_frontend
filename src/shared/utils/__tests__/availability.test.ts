import type { Annonce, Offer } from '@/shared/types';
import {
    getAnnonceAvailability,
    getOfferAvailability,
    getProfessionalAvailability,
} from '@/shared/utils/availability';

const offer = (over: Partial<Offer>) => ({ isActive: true, expiresAt: null, ...over }) as Offer;

describe('getOfferAvailability', () => {
    it('is deleted when nothing is behind the ID', () => {
        expect(getOfferAvailability(undefined)).toBe('deleted');
        expect(getOfferAvailability(null)).toBe('deleted');
    });

    it('stays available all day on its last day', () => {
        const laterToday = new Date();
        laterToday.setHours(0, 0, 0, 0);
        expect(getOfferAvailability(offer({ expiresAt: laterToday }))).toBe('available');
    });

    it('has ended after its end date, or when disabled', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        expect(getOfferAvailability(offer({ expiresAt: yesterday }))).toBe('ended');
        expect(getOfferAvailability(offer({ isActive: false }))).toBe('ended');
    });
});

describe('getAnnonceAvailability', () => {
    it('follows the state of the annonce', () => {
        expect(getAnnonceAvailability({ isActive: true } as Annonce)).toBe('available');
        expect(getAnnonceAvailability({ isActive: false } as Annonce)).toBe('ended');
        expect(getAnnonceAvailability(undefined)).toBe('deleted');
    });
});

describe('getProfessionalAvailability', () => {
    it('only knows a closed account', () => {
        expect(getProfessionalAvailability({})).toBe('available');
        expect(getProfessionalAvailability(undefined)).toBe('deleted');
    });
});
