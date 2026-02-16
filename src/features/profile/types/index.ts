// ============================================                                                                                               
// USER TYPES                                                                                                                                 
// ============================================       

// User account type
export type AccountType = 'user' | 'professional';

// Notifivation preferences
export interface NotificationSettings {
    messages: boolean;      // New message received  
    favorites: boolean;     // Favorite pro posted someting
    promotions: boolean;    // Sialty offers and news    
    reviews: boolean;       // Response to a review
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

    // Vérification
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

// ============================================                                                                                               
// REVIEW TYPES                                                                                                                               
// ============================================  

// Review given by user to a professional
export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    professionalId: string;
    professionalName: string;
    professionalAvatar: string | null;
    rating: number; // 1-5
    comment: string;
    createdAt: Date;
    updatedAt: Date | null;
}