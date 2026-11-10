// ============================================
// LIMITS — every number that bounds a client, in one place.
// Values are a starting point, to be tuned on real measures (spec section 10).
// ============================================

export const LIMITS = {
    // Baseline per IP address, on every route. Stricter limits per route come later.
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMaxRequests: 300,
    // Blurred photos (/v1/media) are left out of the baseline: a feed page alone
    // carries 20 to 60 of them. They are public, immutable and cheap, so only the
    // FAILED lookups count, per IP, over the same window: a client asking for
    // keys that do not exist is probing (or broken), never browsing.
    mediaFailedLookupsPerWindow: 100,
    // Largest JSON body accepted. Photos never go through JSON (direct upload, plan 4).
    jsonBodyMax: '100kb',
} as const;
