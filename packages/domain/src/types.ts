// ============================================
// DOMAIN TYPES — shapes shared by the app and the server.
// Moved from the app's shared/types (which re-exports them, so features
// still import from '@/shared/types').
// ============================================

// ============================================
// OFFER / ANNONCE (fields checked by the shared form schemas)
// ============================================

// Offer highlight rendered as a stat card on the detail screen.
// Union instead of { icon, label }: icons are a view concern and labels go through i18n,
// so the data stays presentation-agnostic (same pattern as Annonce.priceType).
export type OfferCondition = 'free_quote' | 'fast_response' | 'no_commitment' | 'first_session_free';

// Price display chosen by the professional on an annonce.
// Maps to the Annonce model: 'free' → isFree, 'fixed' | 'quote' → priceType.
export type AnnoncePriceType = 'fixed' | 'quote' | 'free';

// ============================================
// SERVICE REQUEST ("Demande") — an INDIVIDUAL's need that professionals answer
// ("J'ai besoin d'un peintre"). NOT an Annonce (a pro's post): different
// fields, audience and life cycle. Serializable on purpose (dates as ISO
// strings, no Date objects): stored in Redux by the app, sent as JSON by the server.
// Named ServiceRequest, not Request: `Request` is the global fetch type.
// ============================================

/** How soon the individual needs the job done */
export type RequestUrgency = 'urgent' | 'this_week' | 'this_month' | 'flexible';

/** Stored status. "Expired" is NOT stored: it is computed from expiresAt (requests/requestStatus) */
export type RequestStoredStatus = 'open' | 'fulfilled';

/** Status shown to users */
export type RequestStatus = RequestStoredStatus | 'expired';

/** A trade a request targets ("Peintre"), linked to a broad category ("Artisans") for filtering */
export interface Trade {
  id: string;
  label: string;
  categoryId: string;
  isRemoteCapable?: boolean;     // Can be done at a distance: only then "Toute la France" applies
}

/**
 * Author as PUBLICLY shown: first name + last-name initial only.
 * Privacy: the backend must never send the full name, phone or address of an
 * individual to other users; the app only formats what it receives.
 */
export interface RequestAuthor {
  id: string;
  firstName: string;
  lastNameInitial: string;       // "M" → "Sophie M."
  memberSince: string;           // ISO date
}

export interface ServiceRequest {
  id: string;
  tradeId: string;
  categoryId: string;            // Copied from the trade, for category filters
  title: string;
  description: string;
  urgency: RequestUrgency;
  photos: string[];              // 0 to 3 image URIs

  // Location: city level only, never an address. Coordinates = city center
  // (used for "à 3 km"), not the individual's home.
  city: string;
  department: string;
  latitude: number | null;
  longitude: number | null;

  author: RequestAuthor;
  status: RequestStoredStatus;
  createdAt: string;             // ISO date
  expiresAt: string;             // ISO date — createdAt + 30 days
}

/**
 * A place where a professional accepts requests. A request is accepted when it
 * falls inside AT LEAST ONE zone: the rule is in requests/requestRules.ts.
 */
export type ServiceZone =
  | {
      kind: 'city';
      id: string;                // "city-<INSEE code>": one zone per commune
      communeCode: string;
      city: string;
      department: string;
      latitude: number;          // Center of the commune
      longitude: number;
      cityRadiusKm: number;      // Estimated size of the city, from its surface
      radiusKm: number;          // Kilometers chosen AROUND the city (0 = the city only)
    }
  | { kind: 'department'; id: string; code: string; name: string }
  | { kind: 'region'; id: string; code: string; name: string }
  | { kind: 'country'; id: string };

/** Trades and zones set by the professional */
export interface ProServiceArea {
  userId: string;
  tradeIds: string[];
  zones: ServiceZone[];
}
