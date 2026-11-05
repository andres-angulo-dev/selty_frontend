// ============================================                                                                                               
// MOCK PROFESSIONAL DETAILS                                                                                                                  
// Simulates what the API will return for a single professional           
// ============================================

import { ProfessionalDetail } from "../types";
import { mockProfessionals } from "@/__mocks__/mockProfessionals";
import { mockReviews } from "./mockReviews";
import { mockAnnonces } from "@/__mocks__/mockAnnonces";

// Find a professional by ID and build the full detail object
export const getProfessionalDetail = (professionalId: string): ProfessionalDetail | null => {
    // Find the professional
    const professional = mockProfessionals.find((pro) => pro.id === professionalId);

    if (!professional) return null;

    // Find annonces posted by this professional
    const annonces = mockAnnonces.filter((annonce) => annonce.professionalId === professionalId);

    // Find reviews for this professional
    const reviews = mockReviews.filter((review) => review.professionalId === professionalId);

    return {
        ...professional,
        annonces,
        reviews,
    };
}