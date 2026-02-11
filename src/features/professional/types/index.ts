// ============================================
// PROFESSIONAL TYPES
// ============================================  

import { Review } from '@/features/profile/types/index';
import { Annonce } from '@/features/annonce/types';

// Professional profile for display (card, list, search results)
export interface Professional {
  // Identity
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar: string | null;

  // Professional info
  profession: string;             // Main profession 
  description: string;            // Bio / presentation text
  services: string[];             // List of services offered

  // Location 
  address: string | null;         // Full address (optional for privacy)
  city: string;   
  department: string;             
  latitude: number | null;        // For distance calculation
  longitude: number | null;       
  distance: string | null;        // Calculated client-side (e.g. "500m")

  // Ratings  
  rating: number;                 // Average rating
  reviewsCount: number;                // Total number of reviews
  
  // Status
  isCertified: boolean;           // Sialty verified badge
  isAvailable: boolean;           // Currently available for work

  // Contact
  phone: string | null;
  email: string | null;

  // Metadata
  createdAt: Date;

  // Stats
  annoncesCount: number;          // Number of annonces posted

  // Relations:
  mainCategoryId: string;         // Main category (displayed on card)
  secondaryCategoryIds: string[]; // Other categories (for search/filter)
}

// ============================================
// PROFESSIONAL DETAIL TYPE
// ============================================

// Extended type for professional detail screen
export interface ProfessionalDetail extends Professional {
  // Annonces
  annonces: Annonce[];            // List of annonces posted by this pro 
  
  // Reviews
  reviews: Review[];               // List of reviews for this professional
}

