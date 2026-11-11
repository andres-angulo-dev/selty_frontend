import { describe, expect, it } from 'vitest';
import { createFirstNameSchema } from '../firstName';

// ============================================
// First-name rule: used by the sign-up guard (server) and the sign-up form (app).
// ============================================

const messages = { required: 'REQ', tooLong: 'LONG', invalid: 'BAD' };
const schema = createFirstNameSchema(messages);

/** Returns the first error message of a refused value, or null when accepted */
const firstError = (value: unknown): string | null => {
    const result = schema.safeParse(value);
    return result.success ? null : result.error.issues[0].message;
};

describe('createFirstNameSchema', () => {
    it.each(['Zoé', 'Jean-Pierre', "N'Golo"])('accepts %s', (name) => {
        expect(schema.parse(name)).toBe(name);
    });

    it('trims the value', () => {
        expect(schema.parse('  Anna  ')).toBe('Anna');
    });

    it('refuses an empty or blank value with "required"', () => {
        expect(firstError('')).toBe('REQ');
        expect(firstError('   ')).toBe('REQ');
    });

    it('refuses more than 50 characters with "tooLong"', () => {
        expect(schema.safeParse('a'.repeat(50)).success).toBe(true);
        expect(firstError('a'.repeat(51))).toBe('LONG');
    });

    it('refuses a digit, a phone number and an e-mail with "invalid"', () => {
        expect(firstError('Jean2')).toBe('BAD');
        expect(firstError('06 12 34 56 78')).toBe('BAD');
        expect(firstError('jean@mail.fr')).toBe('BAD');
    });
});
