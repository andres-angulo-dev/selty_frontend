// ============================================
// HOME TYPES
// ============================================

// Category has moved to shared/types (used across multiple features).
// Re-exported here for backward compatibility during migration.
export type { Category } from '@/shared/types';

// Banner stays here — only used within the home feature.
// Rendering priority: imageUrl > gradientColors > backgroundColor
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;          // Solid fallback (always required)
  gradientColors?: [string, string]; // Diagonal LinearGradient when no image
  imageUrl?: string;                 // Photo background (advertisers, pros) — highest priority
  ctaLabel?: string;                 // Optional CTA button label (e.g. "Explorer")
  professionalId: string | null;     // null = external ad (Google Ads, etc.)
}
