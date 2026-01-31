import { User } from "../types/index";

export const mockUser: User = {
    // Identity
    id: 'user_001',
    userName: 'Afas',
    firstName: 'Andrés Felipe',
    lastName: 'Angulo Serna',
    email: 'andresangulo@hotmail.com',
    phone: '06 12 34 56 78',
    avatar: null,

    // Account type
    accountType: 'user',
    
    // Dates
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-20'),
    lastLoginAt: new Date('2025-01-28'),

    // Vérification
    isEmailVerified: true,
    isPhoneVerified: false,

    // Account status
    isActive: true,

    // Permissions (moderation)
    canPost: true,
    canMessage: true,
    canReview: true,

    // Notification preferences
    notifications: {
        push: {
            messages: true,
            favorites: true,
            promotions: false,
            reviews: true,
        },
        email: {
            messages: true,
            favorites: true,
            promotions: false,
            reviews: true,
        },
    },

    // Statistics
    reviewsCount: 5,
}