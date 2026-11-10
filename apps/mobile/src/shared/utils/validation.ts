// ============================================
// Shared validation patterns (used by several form schemas: annonce, request...)
// Client-side checks are for comfort only: the server validates again.
// ============================================

/**
 * French department codes: 01-19, 21-95, 2A/2B (Corsica), 971-978 (overseas,
 * including Saint-Barthélemy 977 and Saint-Martin 978), 984-989 (Pacific...).
 * Checked against what the geo.api.gouv.fr API really returns. Test on an upper-cased value.
 */
export const DEPARTMENT_PATTERN = /^(0[1-9]|1\d|2[1-9]|[3-8]\d|9[0-5]|2A|2B|97[1-8]|98[4-9])$/;
