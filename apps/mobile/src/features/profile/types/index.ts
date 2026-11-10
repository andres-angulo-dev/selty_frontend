// ============================================
// PROFILE TYPES
// ============================================

// Review has moved to shared/types (used across multiple features).
// Re-exported here for backward compatibility during migration.
export type { Review } from '@/shared/types';

// ============================================
// USER TYPES — stay here (profile feature only)
// ============================================

// User account type: moved to shared/types (read app-wide), re-exported here
export type { AccountType } from '@/shared/types';
import type { AccountType } from '@/shared/types';

// Notification preferences
export interface NotificationSettings {
  messages: boolean;    // New message received
  favorites: boolean;   // Favorite pro posted something
  promotions: boolean;  // Sialty offers and news
  reviews: boolean;     // Response to a review
}

// User notification preferences (push + email)
export interface UserNotifications {
  push: NotificationSettings;
  email: NotificationSettings;
}

// Main User interface
export interface User {
  // Identity
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;

  // Account type
  accountType: AccountType;

  // Dates
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;

  // Verification
  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  // Account status
  isActive: boolean;

  // Permissions (moderation)
  canPost: boolean;
  canMessage: boolean;
  canReview: boolean;

  // Notification preferences
  notifications: UserNotifications;

  // Statistics
  reviewsCount: number;
}

// Subscription plan of a professional account (paid plans come post-MVP)
export type SubscriptionPlan = 'free';

// Professional data shown on the profile tab of a professional account.
// Kept apart from User so an individual account carries none of it.
export interface ProfessionalProfileSummary {
  professionalId: string;          // Opens the public profile (ProfessionalDetail)
  city: string;
  rating: number;
  reviewsCount: number;
  plan: SubscriptionPlan;
}
