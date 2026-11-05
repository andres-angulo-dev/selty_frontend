import { ProfessionalProfileSummary } from '../types';

// Professional side of the mock user. Used only when the account type is
// 'professional'. professionalId points to an existing mock professional so
// "Profil public" opens a real detail screen.
export const mockProfessionalSummary: ProfessionalProfileSummary = {
    professionalId: 'pro-1',
    profession: 'Plombier',
    city: 'Melun',
    rating: 4.8,
    reviewsCount: 127,
    isVerified: true,
    annoncesCount: 12,
    activeOffersCount: 4,
    plan: 'free',
};
