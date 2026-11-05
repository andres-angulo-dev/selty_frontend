// ============================================
// SHARED TYPES — Central type registry
// All types used across multiple features live here.
// Features import from '@/shared/types', never from each other.
// ============================================

// ============================================
// ACCOUNT TYPE
// ============================================

// Role of the signed-in account: drives the profile variant and, later,
// the tab bar (the "Add" tab is for professionals only)
export type AccountType = 'user' | 'professional';

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

  // Relations (IDs for backend)
  professionalId: string;
  categoryId: string;

  // Populated relations (for display)
  professional: Professional | null;
  category: Category | null;

  // Pricing
  isFree?: boolean;                // true = "Gratuit" stat item
  priceType?: 'fixed' | 'quote';  // fixed = "Prix fixe", quote = "Devis gratuit"
  price?: number;                  // Amount in euros, only when priceType is 'fixed'

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

// Kinds of items a user can save in Favorites. Whether an item is saved
// belongs to the user (favorites store), not to the item itself.
export type FavoriteKind = 'professional' | 'annonce' | 'offer';

// Small copy of a saved item, taken when it is saved. Lets the Favorites tab
// still show a deleted / ended item (greyed) without its live data.
export interface FavoriteSnapshot {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

// ============================================
// SERVICE REQUEST ("Demande") — an INDIVIDUAL's need that professionals answer
// ("J'ai besoin d'un peintre"). NOT an Annonce (a pro's post): different
// fields, audience and life cycle. Stored in Redux, so every field is
// serializable (dates as ISO strings, no Date objects).
// Named ServiceRequest, not Request: `Request` is the global fetch type.
// ============================================

/** How soon the individual needs the job done */
export type RequestUrgency = 'urgent' | 'this_week' | 'this_month' | 'flexible';

/** Stored status. "Expired" is NOT stored: it is computed from expiresAt (shared/utils/requestStatus) */
export type RequestStoredStatus = 'open' | 'fulfilled';

/** Status shown to users */
export type RequestStatus = RequestStoredStatus | 'expired';

/** A trade a request targets ("Peintre"), linked to a broad category ("Artisans") for filtering */
export interface Trade {
  id: string;
  label: string;
  categoryId: string;
}

/**
 * Author as PUBLICLY shown: first name + last-name initial only.
 * Privacy: the backend must never send the full name, phone or address of an
 * individual to other users; the app only formats what it receives.
 */
export interface RequestAuthor {
  id: string;
  firstName: string;
  lastNameInitial: string;       // "M" → "Sophie M."
  memberSince: string;           // ISO date
}

export interface ServiceRequest {
  id: string;
  tradeId: string;
  categoryId: string;            // Copied from the trade, for category filters
  title: string;
  description: string;
  urgency: RequestUrgency;
  photos: string[];              // 0 to 3 image URIs

  // Location: city level only, never an address. Coordinates = city center
  // (used for "à 3 km"), not the individual's home.
  city: string;
  department: string;
  latitude: number | null;
  longitude: number | null;

  author: RequestAuthor;
  status: RequestStoredStatus;
  createdAt: string;             // ISO date
  expiresAt: string;             // ISO date — createdAt + 30 days
}
