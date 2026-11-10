import { describe, expect, it } from 'vitest';
import { placeholderText } from '../placeholderText';

// ============================================
// The fake text sent to a visitor instead of a blurred text: its length is
// rounded up to the next 10 characters, so it does not fingerprint the real one.
// ============================================

describe('placeholderText', () => {
    it.each([
        [1, 10],
        [10, 10],
        [11, 20],
        [247, 250],
    ])('length %i gives %i characters', (length, expected) => {
        expect(placeholderText(length)).toHaveLength(expected);
    });

    it('never returns an empty text: 0 gives the 10-character bucket', () => {
        expect(placeholderText(0)).toHaveLength(10);
    });

    it('treats a broken length (negative, NaN) as 0', () => {
        expect(placeholderText(-5)).toHaveLength(10);
        expect(placeholderText(Number.NaN)).toHaveLength(10);
    });

    it('is deterministic: same input, same output', () => {
        expect(placeholderText(247)).toBe(placeholderText(247));
        expect(placeholderText(13)).toBe(placeholderText(19));
    });

    it('is made of filler words, never of the real text', () => {
        expect(placeholderText(30)).toMatch(/^[a-z ]+$/);
    });
});
