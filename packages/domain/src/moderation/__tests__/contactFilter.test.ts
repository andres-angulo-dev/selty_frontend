import { describe, expect, it } from 'vitest';
import { findContactInfo } from '../contactFilter';

// ============================================
// Spec "Textes publiés": a published title or description must not carry a
// phone number, an e-mail, a website or a social account. The filter stops
// honest people, not determined ones ("zéro six..." passes on purpose), and
// above all it must never block a normal text (prices, dates, postal codes).
// ============================================

describe('findContactInfo', () => {
    it.each([
        '06 12 34 56 78',
        '0612345678',
        '06.12.34.56.78',
        '06-12-34-56-78',
        '+33 6 12 34 56 78',
        '+33612345678',
        '0033 6 12 34 56 78',
        'appelez le 01 23 45 67 89',
        'Tél : 07 98 76 54 32 après 18h',
        '06  12  34  56  78',
        '06 / 12 / 34 / 56 / 78',
    ])('finds a phone number in "%s"', (text) => {
        expect(findContactInfo(text)).toBe('phone');
    });

    it.each([
        'jean.dupont@gmail.com',
        'contact@plomberie-77.fr',
        'jean [at] gmail.com',
        'jean(at)gmail(dot)com',
        'Écrivez à JEAN@GMAIL.COM',
    ])('finds an e-mail in "%s"', (text) => {
        expect(findContactInfo(text)).toBe('email');
    });

    it.each([
        'www.monsite.fr',
        'https://monsite.fr',
        'http://exemple.org/page',
        'monsite.com',
        'voir plomberie-dupont.fr',
    ])('finds a website in "%s"', (text) => {
        expect(findContactInfo(text)).toBe('url');
    });

    it.each([
        '@jean_plombier',
        'suivez @jean.plombier77',
        'insta : jean_plombier',
        'mon instagram jeanplombier',
        'whatsapp moi',
        'snap: jean77',
        'Contactez-moi sur Facebook',
    ])('finds a social account in "%s"', (text) => {
        expect(findContactInfo(text)).toBe('social');
    });

    it('finds a social profile link, as a website or a social account', () => {
        expect(findContactInfo('facebook.com/jean')).not.toBeNull();
    });

    it.each([
        'Tarif 1 200 € TTC',
        'Disponible le 12/05/2026',
        'Intervention sur 77000 Melun',
        'Dans un rayon de 30 km',
        'Délai 2 à 3 jours',
        'Pose de 4 prises et 2 interrupteurs',
        'Ouvert de 8h30 à 18h',
        'Réduction de -30 %',
        'Devis gratuit sous 48 h, 10 ans d’expérience',
        'Surface de 120 m², 3 pièces, 2e étage',
        'Prix : 49,90 € la séance',
        'Le 06 décembre à 14 h',
        'Fin de chantier vers 17.30',
        'Peinture, enduit, etc. Travail soigné.',
        'Snack, pizzas et sandwichs',
        'Le 06/12/2026 à 14 h',
        'Du 01/02 au 03/04/2026',
        'Réf. 06 12 34',
        '',
    ])('lets a normal text through: "%s"', (text) => {
        expect(findContactInfo(text)).toBeNull();
    });
});
