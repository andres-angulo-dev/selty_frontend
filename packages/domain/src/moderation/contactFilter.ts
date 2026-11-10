// ============================================
// CONTACT FILTER — finds contact details in a published text.
//
// Spec "Textes publiés": a title or a description may not carry a phone
// number, an e-mail, a website or a social account. The app warns before
// sending, the server refuses. Same function on both sides.
//
// Known limit, accepted: the filter stops honest people, not determined ones
// ("zéro six douze..." passes). Reports are the safety net. What matters most
// is never to block a normal text: prices, dates, postal codes, distances.
// Private messages are NOT filtered (spec 5 bis).
// ============================================

/** What was found, so the form can say which detail to remove */
export type ContactInfoKind = 'phone' | 'email' | 'url' | 'social';

/**
 * Lowercases, removes accents and undoes the common e-mail disguises, so one
 * set of expressions covers "JEAN@GMAIL.COM", "jean [at] gmail.com" and
 * "jean(at)gmail(dot)com".
 */
const normalize = (text: string): string =>
    text
        .toLowerCase()
        // "é" → "e" + combining accent, then the accent is dropped
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // "[at]" / "(at)" → "@", with the spaces around it
        .replace(/\s*[[(]\s*at\s*[\])]\s*/g, '@')
        // "[dot]" / "(point)" → "."
        .replace(/\s*[[(]\s*(dot|point)\s*[\])]\s*/g, '.');

// French phone number: "0" or "+33" / "0033", a digit 1-9, then four pairs of
// digits, each pair preceded by up to 3 separators (spaces, dots, dashes,
// slashes: "06 / 12 / 34..."). Not preceded or followed by another digit, so
// "77000" or "1 200" never match: a postal code has 5 digits, not "0" + 9 digits.
const PHONE = /(?<![\d+])(?:(?:\+|00)33[\s./-]*|0)[1-9](?:[\s./-]{0,3}\d{2}){4}(?!\d)/;

// E-mail address (checked after normalize, so disguised forms are covered)
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/;

// Website: an explicit start ("http://", "https://", "www.")...
const URL_START = /\b(?:https?:\/\/|www\.)\S+/;
// ...or a word followed by a known domain ending ("monsite.com").
// A closed list on purpose: "etc." or "17.30" must not look like an address.
const URL_DOMAIN = /\b[a-z0-9][a-z0-9-]*\.(?:fr|com|net|org|io|eu|be|ch|app|shop|info|biz|me)\b/;

// Social handle: "@" + 3 characters or more, not inside a word or an e-mail
const SOCIAL_HANDLE = /(?<![\w.@])@[a-z0-9_.]{3,}/;
// Social network named in the text ("insta : jean", "whatsapp moi").
// Whole words only: "snack" is not "snap".
const SOCIAL_NAME = /\b(?:instagram|insta|facebook|fb|snapchat|snap|tiktok|whatsapp|telegram|messenger)\b/;

/**
 * @param text A title or a description as typed by the user
 * @returns The first kind of contact detail found (checked in the order
 *          phone, e-mail, website, social account), or null when the text is clean
 */
export const findContactInfo = (text: string): ContactInfoKind | null => {
    const value = normalize(text);

    if (PHONE.test(value)) return 'phone';
    // E-mail before social: the "@" of an address is not a handle
    if (EMAIL.test(value)) return 'email';
    if (URL_START.test(value) || URL_DOMAIN.test(value)) return 'url';
    if (SOCIAL_HANDLE.test(value) || SOCIAL_NAME.test(value)) return 'social';
    return null;
};
