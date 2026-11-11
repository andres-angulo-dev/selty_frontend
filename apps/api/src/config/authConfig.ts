import type { Env } from './env';

// ============================================
// AUTHENTICATION SETTINGS — the part of the environment Better Auth needs,
// in the shape createAuth expects.
// ============================================

/**
 * Version of the terms a new member accepts at sign-up. Stored with the
 * acceptance date in `profiles`. "draft": the legal texts are written in plan 10.
 */
export const TERMS_VERSION = 'draft-2026-11';

export interface AuthConfig {
    secret: string;
    allowedHosts: string[];
    fallbackUrl: string;
    ipAddressHeaders: string[];
    trustedOrigins: string[];
    termsVersion: string;
}

/**
 * @param env The checked environment (loadEnv)
 * @returns The settings handed to createAuth
 */
export const authConfigFromEnv = (env: Env): AuthConfig => ({
    secret: env.BETTER_AUTH_SECRET,
    allowedHosts: env.AUTH_ALLOWED_HOSTS,
    fallbackUrl: env.AUTH_FALLBACK_URL,
    ipAddressHeaders: env.AUTH_IP_HEADERS,
    // Security: sialty:// (the app's own scheme) is always trusted. exp:// is the
    // Expo Go scheme, which any app on the phone can open: trusted outside
    // production only, so a production build never accepts it.
    trustedOrigins: env.NODE_ENV === 'production' ? ['sialty://'] : ['sialty://', 'exp://'],
    termsVersion: TERMS_VERSION,
});
