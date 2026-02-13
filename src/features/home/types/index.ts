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

export interface Banner {
    id: string;
    title: string;
    subtitle: string;
    backgroundColor: string;        // Placeholder color (will be replaced by image)
    professionalId: string | null;  // null = external ad (Google Ads, etc.)
}