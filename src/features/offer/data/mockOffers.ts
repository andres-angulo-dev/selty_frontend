// ============================================                                                                                               
// MOCK OFFERS                                                                                                                                
// ============================================   

import { Offer } from '../types';
import { mockProfessionals } from '@/features/professional/data/mockProfessionals';
import { mockCategories } from '@/features/home/data/mockCategories';

export const mockOffers: Offer[] = [
    {
      id: 'offer-1',
      title: '-30% sur la plomberie',
      description: 'Profitez de 30% de réduction sur toute intervention de plomberie. Devis gratuit et intervention sous 24h.',
      discount: '-30%',
      image: null,
      startsAt: null,
      expiresAt: new Date('2025-06-30'),
      isActive: true,
      professionalId: 'pro-1',
      categoryId: 'cat-1',
      professional: mockProfessionals[0],    // Jean Dupont
      category: mockCategories[0],           // Artisans
      createdAt: new Date('2025-02-01'),
    },
    {
      id: 'offer-2',
      title: 'Devis gratuit',
      description: 'Devis gratuit pour toute installation électrique. Sans engagement.',
      discount: 'Gratuit',
      image: null,
      startsAt: null,
      expiresAt: null,
      isActive: true,
      professionalId: 'pro-5',
      categoryId: 'cat-1',
      professional: mockProfessionals[4],    // Lucas Bernard
      category: mockCategories[0],           // Artisans
      createdAt: new Date('2025-01-15'),
    },
    {
      id: 'offer-3',
      title: '1ère coupe offerte',
      description: 'Votre première coupe est offerte ! Venez découvrir notre salon à domicile.',
      discount: 'Offert',
      image: null,
      startsAt: null,
      expiresAt: new Date('2025-08-31'),
      isActive: true,
      professionalId: 'pro-2',
      categoryId: 'cat-2',
      professional: mockProfessionals[1],    // Marie Martin
      category: mockCategories[1],           // Beauté
      createdAt: new Date('2025-01-20'),
    },
    {
      id: 'offer-4',
      title: '-15% consultation juridique',
      description: 'Réduction de 15% sur votre première consultation en droit immobilier.',
      discount: '-15%',
      image: null,
      startsAt: new Date('2025-03-01'),
      expiresAt: new Date('2025-05-31'),
      isActive: true,
      professionalId: 'pro-3',
      categoryId: 'cat-3',
      professional: mockProfessionals[2],    // Paul Leblanc
      category: mockCategories[2],           // Juridique
      createdAt: new Date('2025-02-10'),
    },
    {
      id: 'offer-5',
      title: 'Séance découverte offerte',
      description: 'Séance de coaching sportif découverte gratuite. Programme personnalisé inclus.',
      discount: 'Gratuit',
      image: null,
      startsAt: null,
      expiresAt: null,
      isActive: true,
      professionalId: 'pro-4',
      categoryId: 'cat-5',
      professional: mockProfessionals[3],    // Sophie Durand
      category: mockCategories[4],           // Santé
      createdAt: new Date('2025-02-05'),
    },
]