// Global navigation types for the app

// Root tab navigator toures
export type RootTabParamList = {
    Home: undefined;
    Search: undefined;
    Favorites: undefined;
    Messages: undefined;
    Profile: undefined;
};

// Profile stack routes
export type ProfileStackParamList = {
    Profile: undefined;
    EditProfile: undefined;
    ChangePassword: undefined;
};

import type { MapPoint, MapZone } from '@/shared/components/MapPreview';

export type RootStackParamList = {
    MainTabs: undefined;
    ProfessionalDetail: { professionalId: string };
    OfferDetail: { offerId: string };
    AnnonceDetail: { annonceId: string };
    CommentsModal: { annonceId: string };
    // Full-screen map. Params stay serializable (plain coordinates, no business object, no callback)
    LocationMap: { title: string; caption?: string; markers: MapPoint[]; zones: MapZone[] };
}
