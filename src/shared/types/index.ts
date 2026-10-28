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

// Where the professional works:
// - 'fixed'  → customers come to a place (salon, office) → pin on the map
// - 'mobile' → the professional travels within a radius → zone circle on the map
// - 'both'   → a place AND home visits around it → pin + circle
export type ProfessionalLocationType = 'fixed' | 'mobile' | 'both';

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
  locationType: ProfessionalLocationType;
  interventionRadiusKm?: number;   // Required when locationType is 'mobile' or 'both'

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

  // Populated relations (for display)
  professional: Professional | null;
  category: Category | null;

  // Pricing
  isFree?: boolean;                // true = "Gratuit" stat item
  priceType?: 'fixed' | 'quote';  // fixed = "Prix fixe", quote = "Devis gratuit"

  // Display
  isNew?: boolean;                 // "Nouveau" badge overlaid on hero image

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

// Offer highlight rendered as a stat card on the detail screen.
// Union instead of { icon, label }: icons are a view concern and labels go through i18n,
// so the data stays presentation-agnostic (same pattern as Annonce.priceType).
export type OfferCondition = 'free_quote' | 'fast_response' | 'no_commitment' | 'first_session_free';

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

  // Highlights & social proof (optional: sections are hidden when absent)
  conditions?: OfferCondition[];   // Max 3 rendered as stat cards
  likesCount?: number;             // "24 personnes ont aimé cette offre"

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
