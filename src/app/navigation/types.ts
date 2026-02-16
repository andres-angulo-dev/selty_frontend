// Global navigation types for the app

// Root tab navigator toures
export type RootTabParamList = {
    HomeTab: undefined;
    SearchTab: undefined;
    FavoritesTab: undefined;
    MessagingTab: undefined;
    ProfileTab: undefined;
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
