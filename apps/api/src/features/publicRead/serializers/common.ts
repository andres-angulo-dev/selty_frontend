import { FRENCH_DEPARTMENTS, FRENCH_REGIONS, type Blurred, type MemberMedia, type MemberPlace, type VisitorMedia, type VisitorPlace } from '@sialty/domain';
import { placeholderText } from '../placeholderText';
import type { MemberMediaRow, MemberPlaceRow, VisitorMediaRow, VisitorPlaceRow } from './rows';

// ============================================
// Building blocks shared by the serializers. Every builder LISTS the keys it
// sends (no spreading of a row), so a column added to a query later cannot
// reach an answer by accident.
// ============================================

/**
 * Public URL of a stored file. Only blur.webp keys are served today (media route);
 * the 1080 key is served to members from plan 4.
 */
const mediaUrl = (key: string): string => `/v1/media/${key}`;

/** @returns the blurred photo only */
export const toVisitorMedia = (row: VisitorMediaRow): VisitorMedia => ({ blurUrl: mediaUrl(row.blurKey) });

/** @returns the clear 1080 px photo and its blurred version */
export const toMemberMedia = (row: MemberMediaRow): MemberMedia => ({
    url: mediaUrl(row.key1080),
    blurUrl: mediaUrl(row.blurKey),
});

/** @returns a text the visitor may not read, as filler of bucketed length */
export const blurred = (length: number): Blurred => ({ blurred: true, placeholder: placeholderText(length) });

/** Department name from its code ("77" → "Seine-et-Marne"); the code itself when unknown */
export const departmentName = (code: string): string =>
    FRENCH_DEPARTMENTS.find((department) => department.code === code)?.name ?? code;

/** Region name from its code ("11" → "Île-de-France"); the code itself when unknown */
export const regionName = (code: string): string => FRENCH_REGIONS.find((region) => region.code === code)?.name ?? code;

/** @returns city and department only */
export const toVisitorPlace = (row: VisitorPlaceRow): VisitorPlace => ({
    city: row.city,
    department: departmentName(row.departmentCode),
    departmentCode: row.departmentCode,
});

/** @returns the visitor place plus the commune code and its center */
export const toMemberPlace = (row: MemberPlaceRow): MemberPlace => ({
    ...toVisitorPlace(row),
    communeCode: row.communeCode,
    latitude: row.latitude,
    longitude: row.longitude,
});

/**
 * Guard for member answers: the row must hold the clear fields. A visitor row
 * here is a repository bug: fail loudly instead of sending a half answer.
 * @param row    the row given to a member serializer
 * @param fields fields that only a member row has
 */
export const assertMemberRow = (row: object, fields: string[], resource: string): void => {
    const missing = fields.filter((field) => !(field in row));
    if (missing.length > 0) {
        throw new Error(`${resource}: member answer built from a row without ${missing.join(', ')}`);
    }
};

/** @returns the ISO string of a date, or undefined (the key is then left out) */
export const isoOrUndefined = (date: Date | null): string | undefined => (date ? date.toISOString() : undefined);
