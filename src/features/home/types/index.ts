// ============================================
// HOME TYPES
// ============================================

// Category of professional services
export interface Category {
    // Identity
    id: string;

    // Content
    name: string;                   // e.g. "Craftsmen", "Beauty", "Legal"
    icon: string;                  
    color: string | null;           // Optional background color for the card

    // Stats
    professionalsCount: number;     // Number of professionals in this category
} 