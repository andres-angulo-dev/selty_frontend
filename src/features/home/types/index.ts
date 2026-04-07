// ============================================
// HOME TYPES
// ============================================

// Category has moved to shared/types (used across multiple features).
// Re-exported here for backward compatibility during migration.
export type { Category } from '@/shared/types';

// Banner stays here — only used within the home feature.
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;        // Placeholder color (will be replaced by image)
  professionalId: string | null;  // null = external ad (Google Ads, etc.)
}
