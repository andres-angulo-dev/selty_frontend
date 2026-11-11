import type { FeedRadius } from '../feed/feedRules';
import type { AnnoncePriceType, OfferCondition, RequestStatus, RequestUrgency } from '../types';

// ============================================
// Shapes of the PUBLIC read API. Types only.
// Visitor rule: readable = trade, price, offer type, city, department,
// publication date, title. Blurred = names, photos, descriptions. Absent =
// phone, contact, map, precise location (the field does not exist at all).
// Each resource has a Visitor* and a Member* shape; Public* is their union.
// Never in any audience: phone, email, rating, reviews count, a last name.
// Dates are ISO strings. Optional fields are left out, never sent as null.
// ============================================

/** Who is reading: no account (visitor) or signed in (member) */
export type Audience = 'visitor' | 'member';

/** A text the visitor may not read: fake text of close length, never the real one */
export type Blurred = { blurred: true; placeholder: string };

/** A photo for a visitor: only the server-made blurred version */
export type VisitorMedia = { blurUrl: string };

/** A photo for a member: the clear version (1080 px) and the blurred one (placeholder while loading) */
export type MemberMedia = { url: string; blurUrl: string };

export type PublicMedia = VisitorMedia | MemberMedia;

/**
 * When a person joined, MONTH ONLY: "YYYY-MM" (month in Europe/Paris time), for
 * every audience. The app shows "Membre depuis <mois année>"; an exact timestamp
 * would be a near-unique fingerprint linking all the requests of one individual.
 */
export type MemberSinceMonth = string;

/** Where a thing is, for a visitor: city and department only */
export interface VisitorPlace {
    city: string;
    department: string;          // Department name ("Seine-et-Marne")
    departmentCode: string;      // "77"
}

/** Where a thing is, for a member: adds the commune and its CENTER (never an address) */
export interface MemberPlace extends VisitorPlace {
    communeCode: string;
    latitude: number;
    longitude: number;
}

// ============================================
// SERVICE ZONES of a professional
// ============================================

/** A zone for a visitor: no coordinates, no commune code */
export type VisitorZone =
    | { kind: 'city'; city: string; department: string; departmentCode: string; radiusKm: number }
    | { kind: 'department'; code: string; name: string }
    | { kind: 'region'; code: string; name: string }
    | { kind: 'country' };

/** A zone for a member: same shapes as ServiceZone (city zones carry the commune center) */
export type MemberZone =
    | {
          kind: 'city';
          id: string;
          communeCode: string;
          city: string;
          department: string;
          departmentCode: string;
          latitude: number;
          longitude: number;
          cityRadiusKm: number;
          radiusKm: number;
      }
    | { kind: 'department'; id: string; code: string; name: string }
    | { kind: 'region'; id: string; code: string; name: string }
    | { kind: 'country'; id: string };

// ============================================
// PROFESSIONAL
// ============================================

/** "Proposed by" block inside an annonce or an offer */
export interface VisitorProfessionalSummary {
    id: string;
    displayName: Blurred;
    tradeIds: string[];          // First = main trade (profession label)
    avatar?: VisitorMedia;
}

export interface MemberProfessionalSummary {
    id: string;
    displayName: string;
    tradeIds: string[];
    avatar?: MemberMedia;
}

export type PublicProfessionalSummary = VisitorProfessionalSummary | MemberProfessionalSummary;

/** Professional page for a visitor. Never a phone, never a rating */
export interface VisitorProfessional extends VisitorPlace {
    id: string;
    displayName: Blurred;
    description: Blurred;
    tradeIds: string[];
    services: Blurred[];         // Free text written by the pro: one placeholder per service
    locationType: 'fixed' | 'mobile' | 'both';
    memberSince: MemberSinceMonth;
    startingPrice?: number;      // Euros, whole amount
    avatar?: VisitorMedia;
    cover?: VisitorMedia;
    zones: VisitorZone[];
}

/** Professional page for a member. Still never a phone (separate route, later) */
export interface MemberProfessional extends MemberPlace {
    id: string;
    displayName: string;
    description: string;
    tradeIds: string[];
    services: string[];
    locationType: 'fixed' | 'mobile' | 'both';
    memberSince: MemberSinceMonth;
    startingPrice?: number;
    avatar?: MemberMedia;
    cover?: MemberMedia;
    zones: MemberZone[];
}

export type PublicProfessional = VisitorProfessional | MemberProfessional;

// ============================================
// ANNONCE (a professional's post)
// ============================================

interface AnnonceCommon {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    priceType: AnnoncePriceType;
    price?: number;              // Euros, present only when priceType is 'fixed'
    publishedAt: string;
}

export interface VisitorAnnonce extends AnnonceCommon, VisitorPlace {
    description: Blurred;
    photos: VisitorMedia[];
    professional: VisitorProfessionalSummary;
}

export interface MemberAnnonce extends AnnonceCommon, MemberPlace {
    description: string;
    photos: MemberMedia[];
    professional: MemberProfessionalSummary;
}

export type PublicAnnonce = VisitorAnnonce | MemberAnnonce;

// ============================================
// OFFER (promotion). Placed at its professional's commune
// ============================================

interface OfferCommon {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    discount?: string;           // Free text ("-20 %"); absent = no badge
    conditions: OfferCondition[];
    publishedAt: string;
    startsAt?: string;
    expiresAt?: string;
}

export interface VisitorOffer extends OfferCommon, VisitorPlace {
    description: Blurred;
    photo?: VisitorMedia;
    professional: VisitorProfessionalSummary;
}

export interface MemberOffer extends OfferCommon, MemberPlace {
    description: string;
    photo?: MemberMedia;
    professional: MemberProfessionalSummary;
}

export type PublicOffer = VisitorOffer | MemberOffer;

// ============================================
// REQUEST (an individual's need)
// ============================================

interface RequestCommon {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    urgency: RequestUrgency;
    status: RequestStatus;       // Computed: 'expired' is never stored
    publishedAt: string;
    expiresAt: string;
}

/** Author for a visitor: first name blurred (fixed 10-character fake), no initial */
export interface VisitorRequestAuthor {
    firstName: Blurred;
    memberSince: MemberSinceMonth;
}

/** Author for a member: "Sophie M." (never the last name) */
export interface MemberRequestAuthor {
    firstName: string;
    lastNameInitial: string | null; // null while the member has not given a last name
    memberSince: MemberSinceMonth;
}

export interface VisitorRequest extends RequestCommon, VisitorPlace {
    description: Blurred;
    photos: VisitorMedia[];
    author: VisitorRequestAuthor;
}

export interface MemberRequest extends RequestCommon, MemberPlace {
    description: string;
    photos: MemberMedia[];
    author: MemberRequestAuthor;
}

export type PublicRequest = VisitorRequest | MemberRequest;

// ============================================
// PROFESSIONAL PAGE — GET /v1/professionals/:id
// The profile and its live publications, all in ONE audience's shapes:
// a visitor page never nests member annonces, and the reverse.
// ============================================

export type VisitorProfessionalPage = VisitorProfessional & {
    annonces: VisitorAnnonce[];  // Active, newest first, at most 50
    offers: VisitorOffer[];      // Live, newest first, at most 50
};

export type MemberProfessionalPage = MemberProfessional & {
    annonces: MemberAnnonce[];
    offers: MemberOffer[];
};

export type ProfessionalPage = VisitorProfessionalPage | MemberProfessionalPage;

// ============================================
// REFERENCE LISTS — GET /v1/trades → ReferenceList<Trade>,
// GET /v1/categories → ReferenceList<CategoryRef>
// ============================================

/** A whole reference list (small, never paginated) */
export type ReferenceList<T> = { items: T[] };

// ============================================
// FEED
// ============================================

/** One entry of the home feed. distanceKm: whole kilometers from the asked position */
export type FeedItem = (
    | ({ kind: 'annonce' } & PublicAnnonce)
    | ({ kind: 'offer' } & PublicOffer)
    | ({ kind: 'request' } & PublicRequest)
) & { distanceKm: number };

/**
 * A page of the feed. `widenTo` = next radius to offer when this one holds nothing.
 * `items` can be empty while `nextCursor` is set (every item of the page changed
 * while it was read): follow the cursor, the radius is not exhausted.
 */
export type FeedPage = {
    items: FeedItem[];
    nextCursor: string | null;
    radius: FeedRadius;
    widenTo: FeedRadius | null;
};

/**
 * Answer of GET /v1/me: the signed-in member, with the optional professional
 * profile. Member-only (never cached: `Cache-Control: private, no-store`).
 * `memberSince` is "YYYY-MM" in Paris time, like the public types.
 */
export interface MeResponse {
    profileId: string;
    email: string;
    firstName: string;
    lastInitial: string | null;
    memberSince: MemberSinceMonth;
    professional: {
        id: string;
        status: 'pending' | 'validated' | 'refused';
        displayName: string;
    } | null;
}
