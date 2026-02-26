// ============================================                                                                                               
// MOCK ANNONCES                                                                                                                              
// ============================================    

import { Annonce } from "../types";
import { mockProfessionals } from "@/features/professional/data/mockProfessionals";
import { mockComments } from "./mockComments";

export const getAnnonceById = (id: string): Annonce | undefined => {
  return mockAnnonces.find((annonce) => annonce.id === id);
};

export const mockAnnonces: Annonce[] = [
    {
      id: 'annonce-1',
      title: 'Intervention plomberie dans le 77',
      description: 'Disponible 7j/7 pour tous vos travaux de plomberie dans le département 77. Fuite, débouchage, installation... Devis gratuit, déplacement rapide.',
      images: [],
      city: 'Melun',
      department: '77',
      likesCount: 24,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-1').length,
      isLiked: false,
      isFavorite: false,
      professionalId: 'pro-1',
      categoryId: 'cat-1',
      professional: mockProfessionals[0],    // Jean Dupont
      createdAt: new Date('2025-02-09'),
      isActive: true,
    },
    {
      id: 'annonce-6',                                                                                                                          
      title: 'Remplacement chauffe-eau et installation sanitaire',                                                                            
      description: 'Spécialiste en remplacement de chauffe-eau, baignoire, douche et WC. Travail soigné, matériel de qualité. Devis gratuit sous 24h. Zone 77 et alentours.',                                                                                                                 
      images: [],
      city: 'Melun',
      department: '77',
      likesCount: 17,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-6').length,
      isLiked: false,
      isFavorite: false,
      professionalId: 'pro-1',
      categoryId: 'cat-1',
      professional: mockProfessionals[0],    // Jean Dupont
      createdAt: new Date('2025-01-15'),
      isActive: true,
    },
    {
      id: 'annonce-2',
      title: 'Coiffure à domicile - Spécial mariage',
      description: 'Vous vous mariez bientôt ? Je me déplace chez vous pour la coiffure de la mariée et des demoiselles d\'honneur. Essai offert!',
      images: [],
      city: 'Pontault-Combault',
      department: '77',
      likesCount: 45,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-2').length,
      isLiked: true,
      isFavorite: true,
      professionalId: 'pro-2',
      categoryId: 'cat-2',
      professional: mockProfessionals[1],    // Marie Martin
      createdAt: new Date('2025-02-07'),
      isActive: true,
    },
    {
      id: 'annonce-3',
      title: 'Nouvelle loi immobilier 2025 - Ce que vous devez savoir',
      description: 'La loi sur l\'encadrement des loyers évolue en 2025. Je vous explique les changements et comment protéger vos droits en tant que propriétaire ou locataire.',
      images: [],
      city: 'Torcy',
      department: '77',
      likesCount: 67,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-3').length,
      isLiked: false,
      isFavorite: false,
      professionalId: 'pro-3',
      categoryId: 'cat-3',
      professional: mockProfessionals[2],    // Paul Leblanc
      createdAt: new Date('2025-02-05'),
      isActive: true,
    },
    {
      id: 'annonce-4',
      title: 'Défi sportif : 30 jours pour se remettre en forme',
      description: 'Je lance un défi gratuit de 30 jours ! Programme complet avec exercices quotidiens adaptés à votre niveau. Rejoignez le groupe !',
      images: [],
      city: 'Chelles',
      department: '77',
      likesCount: 112,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-4').length,
      isLiked: true,
      isFavorite: false,
      professionalId: 'pro-4',
      categoryId: 'cat-5',
      professional: mockProfessionals[3],    // Sophie Durand
      createdAt: new Date('2025-02-03'),
      isActive: true,
    },
    {
      id: 'annonce-5',
      title: 'Dépannage électrique urgent ce week-end',
      description: 'Disponible ce samedi et dimanche pour tout dépannage électrique urgent. Panne de courant, court-circuit, tableau électrique. Intervention en 1h.',
      images: [],
      city: 'Lagny-sur-Marne',
      department: '77',
      likesCount: 8,
      commentsCount: mockComments.filter((c) => c.annonceId === 'annonce-5').length,
      isLiked: false,
      isFavorite: false,
      professionalId: 'pro-5',
      categoryId: 'cat-1',
      professional: mockProfessionals[4],    // Lucas Bernard
      createdAt: new Date('2025-02-10'),
      isActive: true,
    },   
]