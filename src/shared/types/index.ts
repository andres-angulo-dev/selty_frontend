// ============================================
// SHARED TYPES — Central type registry
// All types used across multiple features live here.
// Features import from '@/shared/types', never from each other.
// ============================================

// ============================================
// CATEGORY
// ============================================

// Category of professional services (e.g. "Craftsmen", "Beauty", "Legal")
export interface Category {
  id: string;
  name: string;
  icon: string;                    // Ionicons icon name
  color: string | null;            // Optional background color for the card
  professionalsCount: number;      // Number of professionals in this category
}

// ============================================
// PROFESSIONAL
// ============================================

// Professional profile for display (card, list, search results)
export interface Professional {
  // Identity
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar: string | null;

  // Professional info
  profession: string;              // Main profession
  description: string;             // Bio / presentation text
  services: string[];              // List of services offered

  // Location
  address: string | null;          // Full address (optional for privacy)
  city: string;
  department: string;
  latitude: number | null;         // For distance calculation
  longitude: number | null;
  distance: string | null;         // Calculated client-side (e.g. "500m")

  // Ratings
  rating: number;                  // Average rating
  reviewsCount: number;            // Total number of reviews

  // Status
  isCertified: boolean;            // Sialty verified badge
  isAvailable: boolean;            // Currently available for work

  // Contact
  phone: string | null;
  email: string | null;

  // Metadata
  createdAt: Date;

  // Stats
  annoncesCount: number;           // Number of annonces posted

  // Display (HomeScreen card)
  coverImage?: string;             // Cover photo URL (ProfessionalCoverCard)
  startingPrice?: number;          // Starting price in euros ("À partir de X€")

  // Relations
  mainCategoryId: string;          // Main category (displayed on card)
  secondaryCategoryIds: string[];  // Other categories (for search/filter)
}

// ============================================
// ANNONCE
// ============================================

// Annonce posted by a professional (feed content)
export interface Annonce {
  // Identity
  id: string;

  // Content
  title: string;                   // e.g. "Plumbing services in the 77 area"
  description: string;             // Detailed description
  images: string[];                // List of image URLs

  // Location
  city: string;
  department: string;

  // Interactions
  likesCount: number;              // Total likes
  commentsCount: number;           // Total comments
  isLiked: boolean;                // Liked by current user
  isFavorite: boolean;             // Saved by current user

  // Relations (IDs for backend)
  professionalId: string;
  categoryId: string;

  // Populated relation (for display)
  professional: Professional | null;

  // Metadata
  createdAt: Date;
  isActive: boolean;
}

// ============================================
// COMMENT
// ============================================

// Comment posted by a user on an annonce
export interface Comment {
  // Identity
  id: string;

  // Content
  content: string;                 // Comment text

  // Author info
  userId: string;
  userName: string;
  userAvatar: string | null;

  // Relations
  annonceId: string;               // Which annonce this belongs to
  parentId: string | null;         // null = top-level, string = reply to another comment

  // Metadata
  createdAt: Date;

  // Interactions
  usefulCount: number;             // Total "useful" marks
  isUseful: boolean;               // Marked as useful by current user
}

// ============================================
// OFFER
// ============================================

// Promotional offer created by a professional
export interface Offer {
  // Identity
  id: string;

  // Content
  title: string;                   // e.g. "-30% on plumbing"
  description: string;             // Detailed description of the offer
  discount: string;                // e.g. "-30%", "free", "2 for 1"
  image: string | null;

  // Validity
  startsAt: Date | null;           // null = immediate
  expiresAt: Date | null;          // null = no limit
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

// ============================================
// REVIEW
// ============================================

// Review given by a user to a professional
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string | null;
  rating: number;                  // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// ============================================
// PROFESSIONAL DETAIL
// ============================================

// Extended type for the professional detail screen
// Includes populated annonces and reviews
export interface ProfessionalDetail extends Professional {
  annonces: Annonce[];             // List of annonces posted by this pro
  reviews: Review[];               // List of reviews for this professional
}
