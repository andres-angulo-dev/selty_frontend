export const Strings = {                                                                                                          
    // App info                                                                                                                     
    app: {                                                                                                                          
      name: 'Sialty',                                                                                                               
      tagline: 'Trouvez le bon professionnel, facilement.',                                                                         
    },                                                                                                                              
                                                                                                                                    
    // Navigation / Tab names                                                                                                       
    tabs: {                                                                                                                         
      home: 'Accueil',                                                                                                              
      search: 'Recherche',                                                                                                          
      favorites: 'Favoris',                                                                                                         
      messages: 'Messages',                                                                                                         
      profile: 'Profil',                                                                                                            
    },                                                                                                                              
                                                                                                                                    
    // Screen titles                                                                                                                
    screens: {                                                                                                                      
      home: {                                                                                                                       
        title: 'Accueil',                                                                                                           
        subtitle: 'Feed des professionnels',                                                                                        
      },                                                                                                                            
      search: {                                                                                                                     
        title: 'Recherche',                                                                                                         
        subtitle: 'Trouver un professionnel',                                                                                       
      },                                                                                                                            
      favorites: {                                                                                                                  
        title: 'Favoris',                                                                                                           
        subtitle: 'Vos professionnels sauvegardés',                                                                                 
      },                                                                                                                            
      messages: {                                                                                                                   
        title: 'Messages',                                                                                                          
        subtitle: 'Vos conversations',                                                                                              
      },                                                                                                                            
      profile: {                                                                                                                    
        title: 'Profil',                                                                                                            
        subtitle: 'Gérer votre compte',                                                                                             
      },                                                                                                                            
    },                                                                                                                              
                                                                                                                                    
    // Common buttons                                                                                                               
    buttons: {                                                                                                                      
      submit: 'Valider',                                                                                                            
      cancel: 'Annuler',                                                                                                            
      save: 'Enregistrer',                                                                                                          
      delete: 'Supprimer',                                                                                                          
      edit: 'Modifier',                                                                                                             
      back: 'Retour',                                                                                                               
    },                                                                                                                              
                                                                                                                                    
    // Common labels                                                                                                                
    labels: {                                                                                                                       
      email: 'Email',                                                                                                               
      password: 'Mot de passe',                                                                                                     
      name: 'Nom',                                                                                                                  
      phone: 'Téléphone',                                                                                                           
    },                                                                                                                              
                                                                                                                                    
    // Error messages                                                                                                               
    errors: {                                                                                                                       
      required: 'Ce champ est requis',                                                                                              
      invalidEmail: 'Email invalide',                                                                                               
      networkError: 'Erreur de connexion',                                                                                          
    },         
    
    // ------------------------------                                                                                               
    // Profile screen                                                                                                   
    // ------------------------------    
    profile: {
      // Sections
      sections: {
        personalInfo: 'Informations personnelles',
        settings: 'Paramètres',
        support: 'Support',
      },

      // Labels
      labels: {
        userName: "Nom d'utilisateur",
        name: 'Nom',
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        password: 'Mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmNewPassword: 'Confirmer le nouveau mot de passe',
      },

      // Placeholders
      placeholders: {
        userName: "Votre nom d'utilisateur",
        firstName: 'Votre prénom',
        lastName: 'Votre nom',
        email: 'Votre email',
        phone: 'Votre numéro de téléphone',
        currentPassword: 'Votre mot de passe actuel',
        newPassword: 'Entrez votre nouveau mot de passe',
        confirmNewPassword: 'Confirmez votre nouveau mot de passe',
      },

      // Menu items
      menu: {
        editProfile: 'Modifier le profil',
        password: 'Mot de passe',
        notifications: 'Notifications',
        language: 'Langue',
        theme:'Thème',
        helpCenter: "Centre d'aide",
        terms: "Conditions d'utilisation",
        privacy: 'Politique de confidentialité',
        contact: 'Nous contacter',
        logout: 'Déconnexion',
        deleteAccount: 'Supprimer mon compte',
      },

      // Alerts
      alerts: {
        profileUpdated: {
          title: 'Profil mis à jour',
          message: 'Vos modifications ont été enregistrées',
        },
        passwordChanged: {
          title: 'Mot de passe modifié',
          message: 'Votre mot de passe a été mis à jour avec succès.',
        },
      },

      // Others
      version: 'Version',
    },

    // Validation errors
    validation: {
      required: 'Ce champ est obligatoire',
      passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
    },

    // ------------------------------                                                                                                       
    // Home screen                                                                                                                            
    // ------------------------------                                                                                                         
    home: {
        searchPlaceholder: 'Rechercher un professionnel...',
        popularProfessionals: 'Professionnels populaires',
        currentOffers: 'Les offres du moment',
        nearYou: 'Près de chez vous',
    },

    // ------------------------------
    // Search overlay
    // ------------------------------
    search: {
        recentSearches: 'Recherches récentes',
        clear: 'Effacer',
        categories: 'Catégories',
        professionals: 'Professionnels',
        noResults: 'Aucun Résultat pour',
    },
    
    // ------------------------------
    // Professional detail
    // ------------------------------
    professional: {
        notFound: 'Professionnel non trouvé',
    },

  } as const;   