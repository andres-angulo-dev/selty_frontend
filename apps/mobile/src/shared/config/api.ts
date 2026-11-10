// ============================================
// API ADDRESS — where the app finds the server.
// Read from EXPO_PUBLIC_API_URL (apps/mobile/.env, never committed). In
// development it is the cloudflared tunnel address, which CHANGES at each
// launch of the tunnel: update .env, then restart Expo with --clear.
// EXPO_PUBLIC_ variables are copied into the app at build time: never put a
// secret in one, anyone can read it from the app.
// ============================================

/** Base address without trailing slash, or null when not set (the app then keeps its mock data) */
export const API_BASE_URL: string | null = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || null;
