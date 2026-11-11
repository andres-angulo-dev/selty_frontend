import { describe, expect, it } from 'vitest';
import { loadEnv } from '../env';

// ============================================
// The server refuses to start with a missing or invalid setting, and says which.
// ============================================

const DATABASE_URL = 'postgres://sialty:sialty@localhost:5432/sialty_dev';
// Test-only value, 40 characters: long enough for the 32-character minimum
const BETTER_AUTH_SECRET = 'test-secret-test-secret-test-secret-0000';

describe('loadEnv', () => {
    it('reads a complete environment, with defaults', () => {
        expect(loadEnv({ DATABASE_URL, BETTER_AUTH_SECRET })).toEqual({
            NODE_ENV: 'development',
            PORT: 4000,
            DATABASE_URL,
            TRUST_PROXY_HOPS: 0,
            HOST: '127.0.0.1',
            STORAGE_DIR: 'storage',
            BETTER_AUTH_SECRET,
            AUTH_ALLOWED_HOSTS: ['localhost:4000', '127.0.0.1:4000', '*.trycloudflare.com'],
            AUTH_FALLBACK_URL: 'http://localhost:4000',
            AUTH_IP_HEADERS: ['cf-connecting-ip'],
            SMTP_HOST: '127.0.0.1',
            SMTP_PORT: 1025,
            MAIL_FROM: 'Sialty <no-reply@sialty.test>',
        });
    });

    it('refuses a BETTER_AUTH_SECRET shorter than 32 characters, without echoing it', () => {
        const short = 'too-short-secret';
        let message = '';
        try {
            loadEnv({ DATABASE_URL, BETTER_AUTH_SECRET: short });
        } catch (error) {
            message = (error as Error).message;
        }
        expect(message).toMatch(/BETTER_AUTH_SECRET/);
        expect(message).not.toContain(short);
    });

    it('requires a BETTER_AUTH_SECRET (no default)', () => {
        expect(() => loadEnv({ DATABASE_URL })).toThrow(/BETTER_AUTH_SECRET/);
    });

    it('reads AUTH_ALLOWED_HOSTS and AUTH_IP_HEADERS as trimmed lists', () => {
        const env = loadEnv({
            DATABASE_URL,
            BETTER_AUTH_SECRET,
            AUTH_ALLOWED_HOSTS: ' api.sialty.test , localhost:4000 ,',
            AUTH_IP_HEADERS: 'x-real-ip, cf-connecting-ip',
        });
        expect(env.AUTH_ALLOWED_HOSTS).toEqual(['api.sialty.test', 'localhost:4000']);
        expect(env.AUTH_IP_HEADERS).toEqual(['x-real-ip', 'cf-connecting-ip']);
    });

    it('applies the SMTP defaults', () => {
        const env = loadEnv({ DATABASE_URL, BETTER_AUTH_SECRET });
        expect(env.SMTP_HOST).toBe('127.0.0.1');
        expect(env.SMTP_PORT).toBe(1025);
        expect(env.MAIL_FROM).toBe('Sialty <no-reply@sialty.test>');
    });

    it('refuses TRUST_PROXY_HOPS=true, which would trust any forged address', () => {
        expect(() => loadEnv({ DATABASE_URL, TRUST_PROXY_HOPS: 'true' })).toThrow(/TRUST_PROXY_HOPS/);
    });

    it('reads PORT as a number', () => {
        expect(loadEnv({ DATABASE_URL, BETTER_AUTH_SECRET, PORT: '4100', NODE_ENV: 'test' }).PORT).toBe(4100);
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
