import type { FeedRadius } from '../feed/feedRules';

// ============================================
// Shapes of the PUBLIC read API. Types only.
// Visitor rule: readable = trade, price, offer type, city, department,
// publication date, title. Blurred = names, photos, descriptions. Absent =
// phone, contact, map, precise location (the field does not exist at all).
// The exact field lists may be refined by a later task.
// ============================================

/** Who is reading: no account (visitor) or signed in (member) */
export type Audience = 'visitor' | 'member';

/** A text the visitor may not read: fake text of close length, never the real one */
export type Blurred = { blurred: true; placeholder: string };

/** A photo: always a blurred version; the clear URL only exists for a member */
export type PublicMedia = { blurUrl: string } | { url: string; blurUrl: string };

/** Professional card. Visitor: name blurred, photo blurred. Never a phone. */
export interface PublicProfessional {
    id: string;
    tradeIds: string[];
    city: string;
    department: string;
    name: string | Blurred;
    photo?: PublicMedia;
    description?: string | Blurred;
}

/** Annonce (a professional's post) */
export interface PublicAnnonce {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    price?: string;
    city: string;
    department: string;
    publishedAt: string;
    photos: PublicMedia[];
    description: string | Blurred;
    professional: PublicProfessional;
}

/** Offer (promotion) */
export interface PublicOffer {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    discount?: number;
    conditions: string[];
    city: string;
    department: string;
    publishedAt: string;
    startsAt?: string;
    expiresAt?: string;
    photos: PublicMedia[];
    description: string | Blurred;
    professional: PublicProfessional;
}

/** Request (an individual's need). Author: first name blurred for a visitor. */
export interface PublicRequest {
    id: string;
    title: string;
    tradeId: string;
    categoryId: string;
    budget?: string;
    city: string;
    department: string;
    publishedAt: string;
    expiresAt: string;
    photos: PublicMedia[];
    description: string | Blurred;
    authorFirstName: string | Blurred;
}

/** One entry of the home feed */
export type FeedItem =
    | ({ kind: 'annonce' } & PublicAnnonce)
    | ({ kind: 'offer' } & PublicOffer)
    | ({ kind: 'request' } & PublicRequest);

/** A page of the feed. `widenTo` = next radius to offer when this one is exhausted. */
export type FeedPage = {
    items: FeedItem[];
    nextCursor: string | null;
    radius: FeedRadius;
    widenTo: FeedRadius | null;
};
