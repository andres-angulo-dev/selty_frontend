// ============================================
// LIMITS — every number that bounds a client, in one place.
// Values are a starting point, to be tuned on real measures (spec section 10).
// ============================================

export const LIMITS = {
    // Baseline per IP address, on every route. Stricter limits per route come later.
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMaxRequests: 300,
    // Largest JSON body accepted. Photos never go through JSON (direct upload, plan 4).
    jsonBodyMax: '100kb',
} as const;
