// ============================================
// SHARED TYPES — Central type registry
// All types used across multiple features live here.
// Features import from '@/shared/types', never from each other.
// Types the server shares (requests, zones, trades, offer conditions) live in
// @sialty/domain and are re-exported here, so feature imports do not change.
// ============================================

import type { OfferCondition, ServiceZone } from '@sialty/domain';

export type {
  AnnoncePriceType,
  OfferCondition,
  ProServiceArea,
  RequestAuthor,
  RequestStatus,
  RequestStoredStatus,
  RequestUrgency,
  ServiceRequest,
  ServiceZone,
  Trade,
} from '@sialty/domain';

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
// - 'mobile' → the professional travels to customers → no pin
// - 'both'   → a place AND home visits → pin
// Coverage does not depend on this: it comes from `zones` (circles for city zones)
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
  tradeIds: string[];              // Trades; the first one is the main profession (see getProfessionLabel)
  zones: ServiceZone[];            // Where requests are accepted (same rule as ProServiceArea)
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

  // Ratings
  rating: number;                  // Average rating
  reviewsCount: number;            // Total number of reviews

  // Status
  isCertified: boolean;            // Paid plan badge (not displayed yet), not the entry check
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
  // Center of the commune (never the address): its pin on the map. Missing on old mocks
  latitude?: number | null;
  longitude?: number | null;

  // Interactions
  likesCount: number;              // Total likes
  commentsCount: number;           // Total comments
  isLiked: boolean;                // Liked by current user

  // Relations (IDs for backend)
  professionalId: string;
  tradeId: string;                 // One of the professional's trades
  categoryId: string;              // Copied from the trade, for category filters

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

// Promotional offer created by a professional
export interface Offer {
  // Identity
  id: string;

  // Content
  title: string;                   // e.g. "-30% on plumbing"
  description: string;             // Detailed description of the offer
  discount: string | null;         // e.g. "-30%", "free", "2 for 1"; null = no discount, no badge
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
  tradeId: string;                 // One of the professional's trades
  categoryId: string;              // Copied from the trade, for category filters

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

