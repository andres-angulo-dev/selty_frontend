import { z } from 'zod';
import { findContactInfo } from '../moderation/contactFilter';

// ============================================
// FIRST-NAME RULE
// One rule for the server sign-up guard and the app sign-up form.
//
// Security: the first name is shown to other members (first name + initial),
// so it must not carry a phone number, an e-mail, a website or a social
// handle. The app check is for comfort; the server validates again.
// ============================================

/** Limits of the person fields. `firstNameMax` counts characters (code points), not UTF-16 units. */
export const PERSON_LIMITS = {
    firstNameMax: 50,
} as const;

/** Starts with a letter, then letters, combining marks, apostrophes (straight or U+2019, iOS smart punctuation), space, dot, hyphen (refuses emoji, digits, bare punctuation) */
const FIRST_NAME_PATTERN = /^\p{L}[\p{L}\p{M}'\u2019 .-]*$/u;

/** Texts shown for each first-name rule (passed in by the caller) */
export interface FirstNameMessages {
    required: string;
    tooLong: string;
    invalid: string;
}

/**
 * Builds the first-name schema.
 * Trims the value, then refuses: empty, more than 50 characters, any digit,
 * and anything the contact filter recognises (phone, e-mail, URL, handle).
 * @param messages - texts for each refusal
 * @returns a Zod schema producing the trimmed first name
 */
export const createFirstNameSchema = (messages: FirstNameMessages): z.ZodType<string> =>
    z
        .string()
        .trim()
        .min(1, messages.required)
        // Length in code points: `.max()` would count UTF-16 units and split emoji / astral letters
        .refine((value) => [...value].length <= PERSON_LIMITS.firstNameMax, messages.tooLong)
        .refine(
            (value) => FIRST_NAME_PATTERN.test(value) && !/\d/.test(value) && findContactInfo(value) === null,
            messages.invalid,
        );
