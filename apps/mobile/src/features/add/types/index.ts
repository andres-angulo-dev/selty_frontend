// ============================================
// ADD FEATURE TYPES
// ============================================

// Price display chosen by the professional on an annonce.
// Maps to the Annonce model: 'free' → isFree, 'fixed' | 'quote' → priceType.
export type AnnoncePriceType = 'fixed' | 'quote' | 'free';
