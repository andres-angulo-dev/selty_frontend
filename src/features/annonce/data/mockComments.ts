  // ============================================                                                                                               
  // MOCK COMMENTS                                                                                                                              
  // ============================================      

  import { Comment } from '../types';

  export const getCommentsByAnnonceId = (annonceId: string): Comment[] => {
    return mockComments.filter((comment) => comment.annonceId === annonceId);
  };

  export const mockComments: Comment[] = [
      // annonce-1 (plomberie Jean Dupont)
      {
          id: 'comment-1',
          content: 'Très réactif, intervention rapide et propre. Je recommande !',
          userId: 'user-1',
          userName: 'Sophie M.',
          userAvatar: null,
          annonceId: 'annonce-1',
          createdAt: new Date('2025-02-10'),
      },
      {
          id: 'comment-2',
          content: 'Devis reçu en 2h, travail sérieux.',
          userId: 'user-2',
          userName: 'Marc L.',
          userAvatar: null,
          annonceId: 'annonce-1',
          createdAt: new Date('2025-02-08'),
      },
      {
          id: 'comment-3',
          content: 'Est-ce que vous intervenez aussi sur Fontainebleau ?',
          userId: 'user-3',
          userName: 'Julie R.',
          userAvatar: null,
          annonceId: 'annonce-1',
          createdAt: new Date('2025-02-07'),
      },

      // annonce-6 (chauffe-eau Jean Dupont)
      {
          id: 'comment-4',
          content: 'Remplacement fait en une journée, nickel.',
          userId: 'user-4',
          userName: 'Pierre D.',
          userAvatar: null,
          annonceId: 'annonce-6',
          createdAt: new Date('2025-01-20'),
      },
      {
          id: 'comment-5',
          content: 'Bon rapport qualité/prix.',
          userId: 'user-5',
          userName: 'Emma B.',
          userAvatar: null,
          annonceId: 'annonce-6',
          createdAt: new Date('2025-01-18'),
      },

      // annonce-2 (coiffure Marie Martin)
      {
          id: 'comment-6',
          content: 'Elle a coiffé toutes mes demoiselles d\'honneur, parfait !',
          userId: 'user-6',
          userName: 'Laura T.',
          userAvatar: null,
          annonceId: 'annonce-2',
          createdAt: new Date('2025-02-08'),
      },
      {
          id: 'comment-7',
          content: 'Super professionnel et à l\'écoute.',
          userId: 'user-7',
          userName: 'Camille V.',
          userAvatar: null,
          annonceId: 'annonce-2',
          createdAt: new Date('2025-02-06'),
      },

      // annonce-3 (immobilier Paul Leblanc)
      {
          id: 'comment-8',
          content: 'Très bon article, merci pour les explications.',
          userId: 'user-8',
          userName: 'Antoine P.',
          userAvatar: null,
          annonceId: 'annonce-3',
          createdAt: new Date('2025-02-06'),
      },
      {
          id: 'comment-9',
          content: 'Et pour les propriétaires en zone tendue, ça change quelque chose ?',
          userId: 'user-9',
          userName: 'Nadia C.',
          userAvatar: null,
          annonceId: 'annonce-3',
          createdAt: new Date('2025-02-05'),
      },

      // annonce-4 (sport Sophie Durand)
      {
          id: 'comment-10',
          content: 'J\'ai rejoint le groupe, super ambiance !',
          userId: 'user-10',
          userName: 'Thomas G.',
          userAvatar: null,
          annonceId: 'annonce-4',
          createdAt: new Date('2025-02-04'),
      },
      {
          id: 'comment-11',
          content: 'C\'est adapté aux débutants ?',
          userId: 'user-11',
          userName: 'Lucie F.',
          userAvatar: null,
          annonceId: 'annonce-4',
          createdAt: new Date('2025-02-03'),
      },    
  ]