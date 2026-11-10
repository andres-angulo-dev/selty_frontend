import { CURRENT_PROFESSIONAL_ID } from '@/__mocks__/mockSession';
import { ProfessionalProfileSummary } from '../types';

// Professional side of the mock user. Used only when the account type is
// 'professional'. professionalId points to an existing mock professional so
// "Profil public" opens a real detail screen.
export const mockProfessionalSummary: ProfessionalProfileSummary = {
    professionalId: CURRENT_PROFESSIONAL_ID,
    city: 'Melun',
    rating: 4.8,
    reviewsCount: 127,
    plan: 'free',
};
