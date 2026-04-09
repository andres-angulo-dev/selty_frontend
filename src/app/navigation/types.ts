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

export type RootStackParamList = {
    MainTabs: undefined;
    ProfessionalDetail: { professionalId: string };
    OfferDetail: { offerId: string };
    AnnonceDetail: { annonceId: string };
    CommentsModal: { annonceId: string };
}
