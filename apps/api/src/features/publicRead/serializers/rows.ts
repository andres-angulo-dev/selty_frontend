import type { AnnoncePriceType, OfferCondition, RequestStoredStatus, RequestUrgency } from '@sialty/domain';

// ============================================
// ROWS — what the repository SELECTs for each audience, before serializing.
// Visitor rows have NO field for description, display_name, first_name,
// last_name or phone: the visitor query cannot need those columns, so it must
// not select them (the generated *_length columns are enough for the fake text).
// Member rows extend the visitor rows, so a member row can always be shaped for
// a visitor, never the reverse.
// The comment on each field names the column it comes from.
// ============================================

/** A photo for a visitor: media.blur_key */
export interface VisitorMediaRow {
    blurKey: string;
}

/** A photo for a member: media.blur_key + media.key_1080 (key_400 is for thumbnails, later) */
export interface MemberMediaRow extends VisitorMediaRow {
    key1080: string;
}

/** Place of a thing for a visitor: communes.name, communes.department_code */
export interface VisitorPlaceRow {
    city: string;
    departmentCode: string;
}

/** Place for a member: adds the commune code and its center (communes.center: x = lng, y = lat) */
export interface MemberPlaceRow extends VisitorPlaceRow {
    communeCode: string;
    latitude: number;
    longitude: number;
}

// ============================================
// PROFESSIONAL
// ============================================

/** professional_zones (+ communes for a city zone), without any coordinate */
export type VisitorZoneRow =
    | {
          kind: 'city';
          city: string; // communes.name of professional_zones.commune_code
          departmentCode: string; // communes.department_code
          radiusKm: number; // professional_zones.radius_km
      }
    | { kind: 'department'; departmentCode: string } // professional_zones.department_code
    | { kind: 'region'; regionCode: string } // professional_zones.region_code
    | { kind: 'country' };

/** Same zones for a member: adds the zone id, the commune code, center and surface */
export type MemberZoneRow =
    | {
          kind: 'city';
          id: string; // professional_zones.id
          city: string;
          departmentCode: string;
          radiusKm: number;
          communeCode: string; // professional_zones.commune_code
          latitude: number; // communes.center y
          longitude: number; // communes.center x
          surfaceHectares: number | null; // communes.surface_ha (size of the city circle)
      }
    | { kind: 'department'; id: string; departmentCode: string }
    | { kind: 'region'; id: string; regionCode: string }
    | { kind: 'country'; id: string };

/** "Proposed by" block of an annonce / offer, for a visitor */
export interface VisitorProfessionalSummaryRow {
    id: string; // professional_profiles.id
    displayNameLength: number; // professional_profiles.display_name_length
    tradeIds: string[]; // professional_trades.trade_id ordered by position
    avatar: VisitorMediaRow | null; // media of professional_profiles.avatar_media_id
}

export interface MemberProfessionalSummaryRow extends VisitorProfessionalSummaryRow {
    displayName: string; // professional_profiles.display_name
    avatar: MemberMediaRow | null;
}

/** Professional page, visitor (place = communes of professional_profiles.commune_code) */
export interface VisitorProfessionalRow extends VisitorProfessionalSummaryRow, VisitorPlaceRow {
    descriptionLength: number; // professional_profiles.description_length
    services: string[]; // professional_profiles.services
    locationType: 'fixed' | 'mobile' | 'both'; // professional_profiles.location_type
    memberSince: Date; // profiles.member_since of professional_profiles.profile_id
    startingPrice: number | null; // professional_profiles.starting_price
    cover: VisitorMediaRow | null; // media of professional_profiles.cover_media_id
    zones: VisitorZoneRow[];
}

export interface MemberProfessionalRow extends VisitorProfessionalRow, MemberPlaceRow {
    displayName: string;
    description: string; // professional_profiles.description
    avatar: MemberMediaRow | null;
    cover: MemberMediaRow | null;
    zones: MemberZoneRow[];
}

// ============================================
// ANNONCE (place = communes of annonces.commune_code)
// ============================================

export interface VisitorAnnonceRow extends VisitorPlaceRow {
    id: string; // annonces.id
    title: string; // annonces.title
    descriptionLength: number; // annonces.description_length
    tradeId: string; // annonces.trade_id
    categoryId: string; // trades.category_id
    priceType: AnnoncePriceType; // annonces.price_type
    price: number | null; // annonces.price
    createdAt: Date; // annonces.created_at
    photos: VisitorMediaRow[]; // annonce_media ordered by position
    professional: VisitorProfessionalSummaryRow;
}

export interface MemberAnnonceRow extends VisitorAnnonceRow, MemberPlaceRow {
    description: string; // annonces.description
    photos: MemberMediaRow[];
    professional: MemberProfessionalSummaryRow;
}

// ============================================
// OFFER (no place of its own: communes of the PROFESSIONAL's commune_code)
// ============================================

export interface VisitorOfferRow extends VisitorPlaceRow {
    id: string; // offers.id
    title: string; // offers.title
    descriptionLength: number; // offers.description_length
    tradeId: string; // offers.trade_id
    categoryId: string; // trades.category_id
    discount: string | null; // offers.discount
    conditions: OfferCondition[]; // offers.conditions
    startsAt: Date | null; // offers.starts_at
    expiresAt: Date | null; // offers.expires_at
    createdAt: Date; // offers.created_at
    photo: VisitorMediaRow | null; // media of offers.media_id
    professional: VisitorProfessionalSummaryRow;
}

export interface MemberOfferRow extends VisitorOfferRow, MemberPlaceRow {
    description: string; // offers.description
    photo: MemberMediaRow | null;
    professional: MemberProfessionalSummaryRow;
}

// ============================================
// REQUEST (place = communes of requests.commune_code)
// ============================================

/** No author name at all: the visitor placeholder is a fixed 10-character bucket */
export interface VisitorRequestRow extends VisitorPlaceRow {
    id: string; // requests.id
    title: string; // requests.title
    descriptionLength: number; // requests.description_length
    tradeId: string; // requests.trade_id
    categoryId: string; // trades.category_id
    urgency: RequestUrgency; // requests.urgency
    status: RequestStoredStatus; // requests.status ('expired' is computed by the serializer)
    createdAt: Date; // requests.created_at
    expiresAt: Date; // requests.expires_at
    photos: VisitorMediaRow[]; // request_media ordered by position
    authorMemberSince: Date; // profiles.member_since of requests.author_id
}

export interface MemberRequestRow extends VisitorRequestRow, MemberPlaceRow {
    description: string; // requests.description
    photos: MemberMediaRow[];
    authorFirstName: string; // profiles.first_name
    // left(profiles.last_name, 1): select only the initial, the last name never leaves the database
    authorLastNameInitial: string;
}
