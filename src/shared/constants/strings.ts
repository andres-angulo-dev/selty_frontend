export const Strings = {                                                                                                          
    // App info                                                                                                                     
    app: {                                                                                                                          
      name: 'Sialty',                                                                                                               
      tagline: 'Trouvez le bon professionnel, facilement.',                                                                         
    },     

    // App locale for date and number formatting                                                                                                  
    locale: 'fr-FR',     
                                                                                                                                    
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
        categories: 'Catégories',
        forYou: 'Pour vous',
        specialOffers: 'Offres spéciales',
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
        available: 'Disponible',
        unavailable: 'Indisponible',
        stats: {
          annonces: 'ANNONCES',
          reviews: 'AVIS',
          memberSince: 'INSCRIT EN',
        },
        actions: {
          call: 'Appeler',
          message: 'Message',
          favorite: 'Favoris',
          share: 'Partager',
          noPhoneTitle: 'Numéro indisponible',
          noPhoneMessage: 'Ce professionnel n\'a pas renseigné de numéro de téléphone.',
          shareMessage: 'Découvre',
          shareOnSialty: 'sur Sialty !',
        },
        about: {
          title: 'À propos',
          seeMore: 'Voir plus',
          seeLess: 'Voir moins',
          servicesTitle: 'Services proposés'
        },
        tabs: {
          annonces: 'Annonces',
          reviews: 'Avis',
          noReviews: 'Aucun avis pour le moment',
          reviewsCount: (n: number) => `${n} avis`,
          reviewsSummaryTitle: 'Vue d\'ensemble',
          reviewsTitle: 'Avis clients',
        }
    },

    // ------------------------------
    // Offer detail
    // ------------------------------
    offer: {
        notFound: 'Offre non trouvée',
        headerTitle: 'Offre',
        // Validity meta row
        validUntil: 'Valable jusqu\'au',
        validFrom: 'Du',
        validTo: 'au',
        noExpiry: 'Sans date limite',
        // Countdown pill on the hero image
        expiresIn: 'Expire dans',
        expiresToday: 'Expire aujourd\'hui',
        expired: 'Offre expirée',
        day: 'jour',
        days: 'jours',
        // Stat cards — keys must match the OfferCondition union in shared/types
        conditions: 'Conditions de l\'offre',
        conditionLabels: {
            free_quote: 'Devis gratuit',
            fast_response: 'Sous 24h',
            no_commitment: 'Sans engagement',
            first_session_free: '1ère séance offerte',
        },
        // Professional card
        professional: 'Proposé par',
        verified: 'Pro vérifié',
        reviews: 'avis',
        // Location
        location: 'Localisation',
        locationSuffix: 'et alentours',
        // Social proof
        likes: 'personnes ont aimé cette offre',
        // CTA bar
        message: 'Envoyer un message',
        call: 'Appeler',
    },
    
    // ------------------------------
    // Annonce detail
    // ------------------------------
    annonce: {
      notFound: 'Annonce non trouvée',
      location: 'Localisation',
      department: 'Dép.',
      publishedAt: 'Publié',
      interactions: 'Interactions',
      professional: 'Proposé par',
      call: 'Appeler',
      message: 'Envoyer un message',
      likes: (n: number) => `${n} j'aime`,
      comments: (n: number) => `${n} commentaire${n > 1 ? 's' : ''}`,
    },

    // ------------------------------                                                                                                             
    // Comments modal                                                                                                                             
    // ------------------------------   
    comments: {
      title: (n: number) => `Commentaires (${n})`,
      empty: 'Aucun commentaire pour le moment',
      placeholder: 'Écrire un commentaire...',
      send: 'Envoyer',
      useful: 'Utile',
      reply: 'Répondre',
      replyLabel: 'Réponse à',
      replyingTo: (name: string) => `@${name}`,
      cancelReply: 'Annuler',
      currentUser: 'Moi',
      viewReply: 'Voir la réponse',
      viewReplies: (n: number) => `Voir les ${n} réponses`,
      collapseReplies: 'Réduire',
    },

    // ------------------------------
    // Messaging (feature not built yet — shared "coming soon" alert)
    // ------------------------------
    messaging: {
        comingSoonTitle: 'Messagerie',
        comingSoonMessage: 'La messagerie sera disponible prochainement.',
    },

    // ------------------------------
    // Location (useUserLocation hook)
    // ------------------------------
    location: {
        permissionDenied: 'Permission de localisation refusée',
        fetchError: 'Impossible de récupérer la localisation',
    },

    // ------------------------------
    // Full-screen map (LocationMapScreen)
    // ------------------------------
    map: {
        title: 'Localisation',
        locating: 'Localisation en cours…',
        distanceFromYou: (distance: string) => `À ${distance} de vous`,
        inZone: 'dans sa zone d\'intervention',
        directions: 'Itinéraire',
        openSettings: 'Réglages',
        fitAll: 'Voir tout',
        directionsErrorTitle: 'Itinéraire indisponible',
        directionsErrorMessage: 'Aucune application de navigation n\'a pu être ouverte.',
    },

    // ------------------------------
    // Date formatting
    // ------------------------------
    dates: {
        justNow: "À l'instant",
        today: "Aujourd'hui",
        yesterday: 'Hier',
        minutesAgo: (n: number) => `Il y a ${n} min`,
        hoursAgo: (n: number) => `Il y a ${n}h`,
        daysAgo: (n: number) => `Il y a ${n} jours`,
        weeksAgo: (n: number) => `Il y a ${n} semaine${n > 1 ? 's' : ''}`,
        monthsAgo: (n: number) => `Il y a ${n} mois`,
        yearsAgo: (n: number) => `Il y a ${n} an${n > 1 ? 's' : ''}`,
    },

  } as const;   