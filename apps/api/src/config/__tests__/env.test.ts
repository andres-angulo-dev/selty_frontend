import { describe, expect, it } from 'vitest';
import { loadEnv } from '../env';

// ============================================
// The server refuses to start with a missing or invalid setting, and says which.
// ============================================

const DATABASE_URL = 'postgres://sialty:sialty@localhost:5432/sialty_dev';

describe('loadEnv', () => {
    it('reads a complete environment, with defaults', () => {
        expect(loadEnv({ DATABASE_URL })).toEqual({
            NODE_ENV: 'development',
            PORT: 4000,
            DATABASE_URL,
            TRUST_PROXY_HOPS: 0,
        });
    });

    it('refuses TRUST_PROXY_HOPS=true, which would trust any forged address', () => {
        expect(() => loadEnv({ DATABASE_URL, TRUST_PROXY_HOPS: 'true' })).toThrow(/TRUST_PROXY_HOPS/);
    });

    it('reads PORT as a number', () => {
        expect(loadEnv({ DATABASE_URL, PORT: '4100', NODE_ENV: 'test' }).PORT).toBe(4100);
    });

    it('names DATABASE_URL when it is missing', () => {
        expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
    });

    it('names PORT when it is not a number', () => {
        expect(() => loadEnv({ DATABASE_URL, PORT: 'abc' })).toThrow(/PORT/);
    });

    it('refuses a DATABASE_URL that is not PostgreSQL', () => {
        expect(() => loadEnv({ DATABASE_URL: 'mysql://localhost/x' })).toThrow(/DATABASE_URL/);
    });

    it('lists every problem at once', () => {
        expect(() => loadEnv({ PORT: 'abc' })).toThrow(/DATABASE_URL[\s\S]*PORT|PORT[\s\S]*DATABASE_URL/);
    });
});
