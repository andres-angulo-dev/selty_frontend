import type { NavigatorScreenParams } from '@react-navigation/native';
// Global navigation types for the app

// Segments of the "Mes publications" tab
export type PublicationSegment = 'annonce' | 'offer';

// Root tab navigator toures
export type RootTabParamList = {
    Home: undefined;
    Favorites: undefined;       // Individuals only
    MyPublications: { segment?: PublicationSegment } | undefined;  // Professionals only (same slot as Favorites)
    Add: undefined;             // Both roles, content depends on the role (request / annonce or offer)
    Messages: undefined;
    Profile: undefined;
};

// Profile stack routes
export type ProfileStackParamList = {
    Profile: undefined;
    EditProfile: undefined;
    ChangePassword: undefined;
};

import type { MapArea, MapPoint, MapZone } from '@/shared/components/MapPreview';

export type RootStackParamList = {
    // Optional nested params let a screen open a given tab: navigate('MainTabs', { screen: 'Home' })
    MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
    ProfessionalDetail: { professionalId: string };
    OfferDetail: { offerId: string };
    AnnonceDetail: { annonceId: string };
    CommentsModal: { annonceId: string };
    // Add feature (professionals): above the tabs, so the tab bar is hidden on the forms
    AnnonceForm: undefined;
    OfferForm: undefined;
    // Individuals: "Publier une demande" (opened by the central tab, tab bar hidden)
    RequestForm: undefined;
    RequestDetail: { requestId: string };
    MyRequests: undefined;
    // Professionals: their trades and zones
    ServiceTrades: undefined;
    ServiceZones: undefined;
    AddZone: undefined;
    // Confirmation after publishing. Plain texts only (serializable), already formatted
    PublishSuccess: {
        kind: 'annonce' | 'offer' | 'request';
        title: string;           // Title typed by the professional
        subtitle: string;        // "Artisans · Melun (77)"
        tag?: string;            // "80,00 €", "Devis gratuit", "-30 %"
        coverUri?: string;       // Local URI of the cover / offer image
    };
    // Full-screen map. Params stay serializable (plain coordinates, no business object, no callback)
    // target: the item looked at (an annonce): its own pin, and the distance is measured to it
    LocationMap: {
        title: string;
        caption?: string;
        markers: MapPoint[];
        zones: MapZone[];
        areas: MapArea[];
        target?: MapPoint;
        targetTitle?: string;
    };
}
