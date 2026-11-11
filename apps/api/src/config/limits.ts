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
    // Largest JSON body accepted, in bytes (100 KiB, express's '100kb'). Photos
    // never go through JSON (direct upload, plan 4). A number, not '100kb', so
    // express.json and the /v1/auth guard (which runs before it) share one value.
    jsonBodyMax: 100 * 1024,
    // Reads of the clear public data per signed-in account and hour (anti-scraping,
    // spec: a few hundred records an hour). Visitors see blurred data: per-IP baseline only.
    memberReadsPerHour: 600,
} as const;
