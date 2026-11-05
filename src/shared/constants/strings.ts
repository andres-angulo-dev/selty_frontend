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
      favorites: 'Favoris',          // Individuals only
      add: 'Publier',                // Both roles: request (individual) / annonce or offer (pro)
      myPublications: 'Publications', // Professionals only (takes the Favorites slot)
      messages: 'Messages',
      profile: 'Profil',
    },                                                                                                                              
                                                                                                                                    
    // Screen titles                                                                                                                
    screens: {                                                                                                                      
      home: {                                                                                                                       
        title: 'Accueil',                                                                                                           
        subtitle: 'Feed des professionnels',                                                                                        
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
      ok: 'OK',
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
    // ------------------------------
    // Shared form blocks (PhotoPicker, DateField)
    // ------------------------------
    media: {
      add: 'Ajouter',
      addCover: 'Ajouter une photo de couverture',
      cover: 'Couverture',
      chooseSource: 'Ajouter une photo',
      fromLibrary: 'Choisir dans la galerie',
      takePhoto: 'Prendre une photo',
      removePhoto: (n: number) => `Retirer la photo ${n}`,
      cameraDeniedTitle: "Accès à l'appareil photo refusé",
      cameraDeniedMessage: "Autorisez l'appareil photo dans les Réglages pour prendre une photo depuis Sialty.",
      openSettings: 'Ouvrir les Réglages',
      pickError: "La photo n'a pas pu être ajoutée. Réessayez.",
    },
    // Save / unsave an item (bookmark buttons) — screen reader labels
    // Message above the submit button after a refused attempt (FormErrorSummary)
    formErrors: {
      message: 'Corrigez pour continuer :',
    },
    // Postal code + city fields (LocationFields), in every form asking for a place
    locationFields: {
      summaryLabel: 'Code postal et ville',
      postalCode: 'Code postal',
      city: 'Ville',
      searching: 'Recherche…',
      notFound: 'Code postal introuvable.',
      unavailable: 'Recherche indisponible : saisissez votre ville.',
      chooseCity: 'Choisissez votre ville',
      choosePostalCode: 'Choisissez votre code postal',
      errors: {
        postalCode: 'Indiquez un code postal à 5 chiffres.',
        city: 'Choisissez votre ville dans la liste.',
        cityMax: 'La ville ne peut pas dépasser 60 caractères.',
      },
    },
    // Professionals: their trades and zones ("Mon activité")
    serviceArea: {
      tradesIntro: 'Vous pouvez répondre aux demandes de ces métiers, dans vos zones.',
      zonesIntro: 'Vous pouvez répondre aux demandes de vos métiers, dans ces zones. Tout le monde voit toutes les demandes.',
      trades: 'Mes métiers',
      addTrade: 'Ajouter un métier',
      tradeSearch: 'Rechercher un métier',
      tradeEmpty: 'Aucun métier trouvé',
      removeTrade: (trade: string) => `Retirer ${trade}`,
      zones: 'Mes zones',
      zonesCounter: (count: number, max: number) => `Mes zones · ${count} / ${max}`,
      addZone: 'Ajouter une zone',
      removeZone: (zone: string) => `Retirer ${zone}`,
      manageTrades: 'Gérer mes métiers',
      manageZones: 'Gérer mes zones',
      count: (count: number, one: string, many: string) => `${count} ${count > 1 ? many : one}`,
      tradeUnit: { one: 'métier', many: 'métiers' },
      zoneUnit: { one: 'zone', many: 'zones' },
      zoneKinds: {
        department: 'Département',
        region: 'Région',
        country: 'Pour vos métiers à distance',
      },
      country: 'Toute la France',
      radius: (km: number, city: string) => (km === 0 ? `${city} uniquement` : `${km} km autour de ${city}`),
      cityRow: (km: number) => (km === 0 ? 'Cette ville uniquement' : `Et ${km} km autour`),
      limits: {
        title: 'Action impossible',
        lastZone: 'Gardez au moins une zone : sans zone, vous ne pourriez répondre à aucune demande.',
        lastTrade: 'Gardez au moins un métier : sans métier, vous ne pourriez répondre à aucune demande.',
        countryOnly: "« Toute la France » est votre seule zone et elle ne vaut que pour les métiers à distance. Ajoutez d'abord une autre zone.",
        countryRemoved: "« Toute la France » a été retirée : vous n'avez plus de métier à distance.",
      },
      add: {
        title: 'Ajouter une zone',
        kind: 'Type de zone',
        kinds: {
          city: { title: "Autour d'une ville", description: 'Une ville et les kilomètres autour' },
          department: { title: 'Département', description: 'Tout un département' },
          region: { title: 'Région', description: 'Toute une région' },
          country: { title: 'Toute la France', description: 'Pour vos métiers à distance' },
        },
        city: 'Ville',
        radiusSection: 'Kilomètres autour de la ville',
        department: 'Département',
        departmentPlaceholder: 'Choisir un département',
        departmentSearch: 'Rechercher un département',
        region: 'Région',
        regionPlaceholder: 'Choisir une région',
        regionSearch: 'Rechercher une région',
        empty: 'Aucun résultat',
        countryHint: 'Vous pourrez répondre partout en France, seulement pour vos métiers à distance.',
        submit: 'Ajouter cette zone',
        missing: 'Complétez pour continuer :',
        cityUnavailable: "Cette ville n'a pas pu être vérifiée. Réessayez avec du réseau.",
        duplicate: 'Cette zone est déjà dans votre liste.',
        limitReached: (max: number) => `Vous avez atteint le maximum de ${max} zones. Retirez-en une pour en ajouter une autre.`,
        coveredByRegion: (region: string) => `Cette zone est déjà incluse dans ${region}.`,
        updated: 'Le rayon de cette ville a été mis à jour.',
        replaced: (names: string, region: string) => `${names} : inclus dans ${region}, retirés de votre liste.`,
      },
    },
    // Individuals: a REQUEST ("J'ai besoin d'un peintre"), not an annonce
    request: {
      placeholder: {
        title: 'Publier une demande',
        comingSoon: 'Bientôt disponible',
        message: 'Décrivez votre besoin et recevez les réponses des professionnels près de chez vous.',
      },
      badge: 'DEMANDE',
      tradeMatch: 'Pour vous',           // Pro: right trade, inside their zone (short: card strip)
      myRequests: {
        title: 'Mes demandes',
        emptyTitle: 'Aucune demande pour le moment',
        emptyMessage: 'Décrivez votre besoin : les professionnels près de chez vous pourront vous répondre.',
      },
      detail: {
        headerTitle: 'Demande',
        notFound: 'Cette demande n\'existe plus.',
        published: 'Publiée :',
        expiresIn: (days: number) => (days <= 1 ? 'Expire bientôt' : `Expire dans ${days} jours`),
        urgency: 'Délai',
        place: 'Lieu',
        distance: (distance: string) => `à ${distance}`,
        description: 'Description de la demande',
        memberSince: (year: number) => `Membre depuis ${year}`,
        privacyNotice: (firstName: string) =>
          `L'adresse exacte vous sera communiquée en privé si ${firstName} choisit votre proposition.`,
        tradeMatchPill: 'Votre métier, dans votre zone',
        ownRequestNotice: 'Vous avez publié cette demande : vous ne pouvez pas y répondre.',
        outOfZonesNotice: (place: string) =>
          `Cette demande à ${place} n'est dans aucune de vos zones.`,
        otherTradeNotice: (trade: string) =>
          `Cette demande recherche : ${trade}. Seuls les professionnels de ce métier peuvent y répondre.`,
        reply: 'Répondre en privé',
        markFulfilled: "J'ai trouvé un pro",
        fulfillTitle: 'Vous avez trouvé un pro ?',
        fulfillMessage: 'Votre demande sera retirée du feed et les professionnels ne pourront plus y répondre.',
        fulfillConfirm: 'Oui, retirer',
        reportTitle: 'Signaler cette demande',
        reportMessage: 'Elle sera examinée par notre équipe.',
        reportConfirm: 'Signaler',
        reportDoneTitle: 'Merci',
        reportDoneMessage: 'Votre signalement a bien été pris en compte.',
      },
      // Urgency labels (chips in the form, pill on cards)
      urgency: {
        urgent: 'Urgent',
        this_week: 'Cette semaine',
        this_month: 'Ce mois-ci',
        flexible: 'Flexible',
      },
      // Status pill
      status: {
        open: 'Ouverte',
        fulfilled: 'Pro trouvé',
        expired: 'Expirée',
      },
      form: {
        title: 'Publier une demande',
        sections: {
          need: 'Votre besoin',
          urgency: 'Délai',
          location: 'Lieu',
          photos: 'Photos (facultatif)',
        },
        fields: {
          trade: 'Métier recherché',
          tradePlaceholder: 'Choisir un métier',
          tradeSearch: 'Rechercher un métier',
          tradeEmpty: 'Aucun métier trouvé',
          title: 'Titre de votre demande',
          titlePlaceholder: "Ex. Peinture d'un salon",
          description: 'Description',
          descriptionPlaceholder: 'Décrivez votre besoin : travaux, surface, matériel…',
        },
        privacyNotice: 'Ne donnez ni votre adresse, ni votre téléphone, ni vos disponibilités : vous les communiquerez en privé au pro choisi.',
        locationHint: 'Seule la ville sera visible, jamais votre adresse.',
        photosHint: 'Jusqu\'à 3 photos pour aider les pros à estimer votre besoin.',
        submit: 'Publier la demande',
        submitStart: 'Décrire mon besoin',
        discard: {
          title: 'Abandonner la demande ?',
          message: 'Les informations saisies seront perdues.',
          confirm: 'Abandonner',
          keepEditing: 'Continuer',
        },
        errors: {
          trade: 'Choisissez le métier recherché.',
          titleMin: 'Le titre doit contenir au moins 5 caractères.',
          titleMax: 'Le titre ne peut pas dépasser 80 caractères.',
          descriptionMin: 'La description doit contenir au moins 20 caractères.',
          descriptionMax: 'La description ne peut pas dépasser 500 caractères.',
          urgency: 'Choisissez un délai.',
          photosMax: 'Jusqu\'à 3 photos.',
        },
      },
    },
    // Professionals: manage their own annonces and offers
    publication: {
      placeholder: {
        title: 'Mes publications',
        comingSoon: 'Bientôt disponible',
        message: 'Retrouvez ici vos annonces et vos offres pour les modifier ou les désactiver.',
      },
    },
    favorites: {
      add: 'Ajouter aux favoris',
      remove: 'Retirer des favoris',
      // Favorites tab
      title: 'Favoris',
      subtitle: 'Ce que vous avez enregistré',
      segments: {
        professional: 'Pros',
        annonce: 'Annonces',
        offer: 'Offres',
      },
      empty: {
        professional: 'Aucun pro enregistré',
        annonce: 'Aucune annonce enregistrée',
        offer: 'Aucune offre enregistrée',
      },
      emptyHint: {
        professional: 'Touchez le marque-page d\'un pro pour le retrouver ici.',
        annonce: 'Touchez le marque-page d\'une annonce pour la retrouver ici.',
        offer: 'Touchez le marque-page d\'une offre pour la retrouver ici.',
      },
      explore: 'Explorer',
      verified: 'Vérifié',
      reviews: 'avis',
      removeNamed: (name: string) => `Retirer ${name} des favoris`,
      removeAction: 'Retirer',
      // Saved item that can no longer be opened (greyed card)
      unavailable: {
        professional: { ended: 'Profil plus disponible', deleted: 'Profil plus disponible' },
        annonce: { ended: 'Annonce plus disponible', deleted: 'Annonce supprimée' },
        offer: { ended: 'Offre terminée', deleted: 'Offre supprimée' },
      },
    },
    selectField: {
      close: 'Fermer',
    },
    dateField: {
      clear: 'Effacer',
      done: 'OK',
    },

    // ------------------------------
    // Add feature (professionals publish an annonce or an offer)
    // ------------------------------
    add: {
      choice: {
        title: 'Publier',
        subtitle: "Que souhaitez-vous partager aujourd'hui ?",
        annonceTitle: 'Publier une annonce',
        annonceDescription: "Présentez un service avec photos, prix et zone d'intervention.",
        offerTitle: 'Créer une offre',
        offerDescription: 'Une promotion limitée dans le temps : remise, conditions, dates.',
        tip: 'Vos publications sont visibles par les particuliers de votre zone.',
      },
      annonceForm: {
        title: 'Nouvelle annonce',
        sections: {
          photos: 'Photos',
          informations: 'Informations',
          location: 'Localisation',
          price: 'Prix',
        },
        photosHint: '1 à 6 photos. La première sert de couverture.',
        fields: {
          title: 'Titre',
          titlePlaceholder: 'Ex. Dépannage 7j/7',   // Short: one line on small screens
          category: 'Catégorie',
          categoryPlaceholder: 'Choisir une catégorie',
          categorySearch: 'Rechercher une catégorie',
          categoryEmpty: 'Aucune catégorie trouvée',
          description: 'Description',
          descriptionPlaceholder: 'Décrivez vos prestations, votre expérience et vos disponibilités…',
          price: 'Montant',
          pricePlaceholder: 'Ex. 80',
          priceHint: 'En euros, montant affiché sur votre annonce.',
        },
        priceTypes: {
          fixed: 'Prix fixe',
          quote: 'Devis gratuit',
          free: 'Gratuit',
        },
        submit: "Publier l'annonce",
        errors: {
          photosMin: 'Ajoutez au moins une photo.',
          photosMax: '6 photos maximum.',
          titleMin: 'Le titre doit contenir au moins 5 caractères.',
          titleMax: 'Le titre ne peut pas dépasser 80 caractères.',
          category: 'Choisissez une catégorie.',
          descriptionMin: 'La description doit contenir au moins 20 caractères.',
          descriptionMax: 'La description ne peut pas dépasser 1000 caractères.',
          priceType: 'Choisissez un type de prix.',
          priceRequired: 'Indiquez le montant.',
          priceInvalid: 'Montant invalide (ex. 80 ou 49,90).',
          priceRange: 'Le montant doit être compris entre 1 et 100 000 €.',
        },
        discard: {
          title: "Abandonner l'annonce ?",
          message: 'Les informations saisies seront perdues.',
          confirm: 'Abandonner',
          keepEditing: 'Continuer',
        },
      },
      success: {
        annonceTitle: 'Annonce publiée',
        offerTitle: 'Offre publiée',
        annonceMessage: (title: string) =>
          `Votre annonce « ${title} » est maintenant visible par les particuliers de votre zone.`,
        offerMessage: (title: string) =>
          `Votre offre « ${title} » est maintenant visible par les particuliers de votre zone.`,
        requestTitle: 'Demande publiée',
        requestMessage: (title: string) =>
          `Votre demande « ${title} » est en ligne. Les professionnels pourront vous répondre en privé.`,
        publishAnother: 'Publier autre chose',
        backToFeed: 'Voir le feed',
      },
      offerForm: {
        title: 'Nouvelle offre',
        sections: {
          image: 'Image (facultatif)',
          offer: "L'offre",
          validity: 'Validité',
          conditions: 'Conditions',
        },
        addImage: 'Ajouter une image',
        fields: {
          title: 'Titre',
          titlePlaceholder: 'Ex. Diagnostic offert',
          discount: 'Remise / avantage',
          discountPlaceholder: 'Ex. -30 %',
          discountHint: 'Ex. -30 %, 1 séance offerte, 2 pour 1',
          description: 'Description',
          descriptionPlaceholder: "Expliquez ce que comprend l'offre et à qui elle s'adresse…",
          startsAt: 'Début',
          startsAtPlaceholder: "Aujourd'hui",
          expiresAt: 'Fin',
          expiresAtPlaceholder: 'Sans date de fin',
        },
        validityHint: "Sans date de fin, l'offre reste active jusqu'à ce que vous la retiriez.",
        conditionsCounter: (selected: number, max: number) => `${selected} / ${max}`,
        conditionsHint: '3 conditions maximum, affichées sur votre offre.',
        submit: "Publier l'offre",
        errors: {
          titleMin: 'Le titre doit contenir au moins 5 caractères.',
          titleMax: 'Le titre ne peut pas dépasser 60 caractères.',
          discountMin: 'Indiquez la remise ou l\'avantage.',
          discountMax: '30 caractères maximum.',
          category: 'Choisissez une catégorie.',
          descriptionMin: 'La description doit contenir au moins 20 caractères.',
          descriptionMax: 'La description ne peut pas dépasser 1000 caractères.',
          startsAtPast: 'La date de début ne peut pas être passée.',
          expiresAtPast: 'La date de fin ne peut pas être passée.',
          expiresBeforeStart: 'La date de fin ne peut pas être avant la date de début.',
          conditionsMax: '3 conditions maximum.',
        },
        discard: {
          title: "Abandonner l'offre ?",
          message: 'Les informations saisies seront perdues.',
          confirm: 'Abandonner',
          keepEditing: 'Continuer',
        },
      },
    },

    // ------------------------------
    // Development tools (never shown in production builds)
    // ------------------------------
    dev: {
      section: 'Développement',
      professionalAccount: 'Compte professionnel',
      professionalAccountHint: 'Simule le rôle pour toute l\'app',
    },

    profile: {
      // Sections (uppercase is applied by MenuSection)
      sections: {
        activity: 'Mon activité',
        subscription: 'Abonnement',
        account: 'Compte',
        preferences: 'Préférences',
        support: 'Assistance',
      },

      // Identity card
      memberSince: 'Membre depuis',
      verified: 'Vérifié',
      reviewsCount: (count: number) => `(${count} avis)`,

      // Stats strip (professional)
      stats: {
        annonces: 'Annonces',
        activeOffers: 'Offres actives',
        reviews: 'Avis',
      },

      // "Become a professional" card (individual)
      becomePro: {
        title: 'Vous êtes professionnel ?',
        description: 'Proposez vos services et trouvez de nouveaux clients sur Sialty.',
        cta: 'Créer mon espace pro',
      },

      // Subscription plans shown as a badge
      plans: {
        free: 'Gratuit',
      },

      // Preference values shown on the right of a row
      values: {
        languageFrench: 'Français',
        themeSystem: 'Système',
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
        publicProfile: 'Profil public',
        myRequests: 'Mes demandes',
        myAnnonces: 'Mes annonces',
        myOffers: 'Mes offres',
        receivedReviews: 'Avis reçus',
        mySubscription: 'Mon abonnement',
        personalInfo: 'Informations personnelles',
        passwordSecurity: 'Mot de passe et sécurité',
        notifications: 'Notifications',
        language: 'Langue',
        theme: 'Thème',
        helpCenter: "Centre d'aide",
        contact: 'Nous contacter',
        terms: "Conditions d'utilisation",
        privacy: 'Politique de confidentialité',
        logout: 'Se déconnecter',
        deleteAccount: 'Supprimer mon compte',
      },

      // Form sections (EditProfile)
      formSections: {
        identity: 'Identité',
        contact: 'Coordonnées',
      },

      // Alerts
      alerts: {
        deleteAccount: {
          title: 'Supprimer votre compte ?',
          message: 'Vos annonces, offres, messages et avis seront définitivement effacés. Cette action est irréversible.',
          confirm: 'Supprimer',
        },
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