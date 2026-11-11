import { describe, expect, it } from 'vitest';
import { authConfigFromEnv, TERMS_VERSION } from '../authConfig';
import { loadEnv } from '../env';

// ============================================
// The authentication settings handed to Better Auth come from the checked env.
// ============================================

const baseEnv = {
    DATABASE_URL: 'postgres://sialty:sialty@localhost:5432/sialty_test',
    BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-0000',
};

describe('authConfigFromEnv', () => {
    it('trusts exp:// in development and test only', () => {
        expect(authConfigFromEnv(loadEnv({ ...baseEnv, NODE_ENV: 'development' })).trustedOrigins).toEqual(['sialty://', 'exp://']);
        expect(authConfigFromEnv(loadEnv({ ...baseEnv, NODE_ENV: 'test' })).trustedOrigins).toEqual(['sialty://', 'exp://']);
        expect(authConfigFromEnv(loadEnv({ ...baseEnv, NODE_ENV: 'production' })).trustedOrigins).toEqual(['sialty://']);
    });

    it('maps the env keys to the auth settings', () => {
        const config = authConfigFromEnv(loadEnv(baseEnv));
        expect(config.secret).toBe(baseEnv.BETTER_AUTH_SECRET);
        expect(config.allowedHosts).toEqual(['localhost:4000', '127.0.0.1:4000', '*.trycloudflare.com']);
        expect(config.fallbackUrl).toBe('http://localhost:4000');
        expect(config.ipAddressHeaders).toEqual(['cf-connecting-ip']);
    });

    it('uses TERMS_VERSION', () => {
        expect(TERMS_VERSION).toBe('draft-2026-11');
        expect(authConfigFromEnv(loadEnv(baseEnv)).termsVersion).toBe(TERMS_VERSION);
    });
});
