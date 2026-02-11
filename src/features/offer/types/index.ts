// ============================================
// OFFER TYPES
// ============================================

import { Professional } from "@/features/professional/types";
import { Category } from "@/features/home/types"

// Promotional offer created by a professional
export interface Offer {
    // Identity
    id: string;

    // Content
    title: string;              // e.g. "-30% on plumbing"
    description: string;        // Detailled description of the offer
    discount: string;           // e.g. "-30%", "free", "2 for 1"
    image: string | null;       
    
    // Validity 
    startsAt: Date | null;       // null = immediate
    expiresAt: Date | null;     // null = no limit
    isActive: boolean;

    // Relations (IDs for backend)
    professionalId: string;
    categoryId: string;

    // Populated relations (for display)
    professional: Professional | null;
    category: Category | null;

    // Metadata
    createdAt: Date;
}

