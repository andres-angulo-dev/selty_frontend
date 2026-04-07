// ============================================
// PROFILE TYPES
// ============================================

// Review has moved to shared/types (used across multiple features).
// Re-exported here for backward compatibility during migration.
export type { Review } from '@/shared/types';

// ============================================
// USER TYPES — stay here (profile feature only)
// ============================================

// User account type
export type AccountType = 'user' | 'professional';

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
