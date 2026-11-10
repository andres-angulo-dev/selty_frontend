// ============================================
// FAKE TEXT for a visitor. A blurred text is replaced by filler words of close
// length: the app blurs it, and the real text never leaves the server (nor is
// it read from the database: the repository selects the *_length column).
// The length is rounded UP to the next 10 characters: an exact length would be a
// fingerprint that could tell two texts apart.
// ============================================

// Neutral filler (lowercase letters and spaces only), repeated as needed
const FILLER =
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud ';

/** Smallest fake text: an empty or broken length still gives a visible block */
const BUCKET = 10;

/**
 * Fake text whose length is the bucket of `length`.
 * @param length length of the real text (char_length from the database)
 * @returns filler cut to max(10, ceil(length / 10) * 10) characters; always the same for the same bucket
 */
export const placeholderText = (length: number): string => {
    const safeLength = Number.isFinite(length) && length > 0 ? length : 0;
    const size = Math.max(BUCKET, Math.ceil(safeLength / BUCKET) * BUCKET);
    return FILLER.repeat(Math.ceil(size / FILLER.length)).slice(0, size);
};
