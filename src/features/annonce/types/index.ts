// ============================================
// ANNONCE TYPES
// ============================================

import { Professional } from "@/features/professional/types";

// Annonce posted by a professional (feed content)
export interface Annonce {
  // Identity
  id: string;
  
  // Content
  title: string;                // e.g. "Plumbing services in the 77 area"
  description: string;          // Detailed description
  images: string[];              // List of image URLs
  
  // Location
  city: string;
  department: string;
  
  // Interactions
  likesCount: number;           // Total likes
  commentsCount: number;        // Total Comments
  isLiked: boolean;             // Liked by current user
  isFavorite: boolean;           // Saved by current user
  
  // Relations (ID for backend)
  professionalId: string;
  categoryId: string;
  
  // Populated relation (for display)
  professional: Professional | null;
  
  // Metadata
  createdAt: Date;
  isActive: boolean;
}

// ============================================
// COMMENT (on an annonce)
// ============================================

// Comment posted by a user on an annone
export interface Comment {
    // Identity
    id: string;

    // Content
    content: string;            // Comment text

    // Author info
    userId: string;
    userName: string;
    userAvatar: string | null;

    // Relations
    annonceId: string;          // Which annonce this belongs to

    // Metadata
    createdAt: Date;
}