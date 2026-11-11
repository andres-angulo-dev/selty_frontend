import { describe, expect, it } from 'vitest';
import { serializeAnnonce } from '../serializers/annonce';
import { serializeOffer } from '../serializers/offer';
import { serializeProfessional } from '../serializers/professional';
import { serializeRequest } from '../serializers/request';
import type {
    MemberAnnonceRow,
    MemberOfferRow,
    MemberProfessionalRow,
    MemberProfessionalSummaryRow,
    MemberRequestRow,
} from '../serializers/rows';

// ============================================
// Per-audience serializers. Each visitor test is fed the FULL member row, plus
// columns that must never go out (phone, rating...), as if a repository had
// selected too much: the visitor answer must still hold none of it.
// ============================================

const REAL_PRO_NAME = 'Atelier Dupont Peinture';
const REAL_PRO_DESCRIPTION = 'Peintre depuis vingt ans à Melun, travail soigné et devis rapide.';
const REAL_ANNONCE_DESCRIPTION = 'Rénovation complète de votre salon, murs et plafonds, finition mate.';
const REAL_OFFER_DESCRIPTION = 'Moins vingt pour cent sur toute prestation de peinture extérieure.';
const REAL_REQUEST_DESCRIPTION = 'Je cherche un peintre pour ma chambre de douze mètres carrés.';
const REAL_FIRST_NAME = 'Sophie';

// Columns a careless query could bring: none may reach any answer
const FORBIDDEN_EXTRAS = {
    phone: '0601020304',
    showPhone: true,
    email: 'pro@example.com',
    rating: 4.8,
    reviewsCount: 12,
    firstName: 'Jean',
    lastName: 'Dupont',
};

const NOW = new Date('2026-11-10T12:00:00Z');

const media = (id: string) => ({ blurKey: `media/${id}/blur.webp`, key1080: `media/${id}/1080.webp` });

const proSummary: MemberProfessionalSummaryRow = {
    id: '11111111-1111-4111-8111-111111111111',
    displayName: REAL_PRO_NAME,
    displayNameLength: REAL_PRO_NAME.length,
    tradeIds: ['trade-painter'],
    avatar: media('avatar'),
};

const proRow = {
    ...FORBIDDEN_EXTRAS,
    id: proSummary.id,
    displayName: REAL_PRO_NAME,
    displayNameLength: REAL_PRO_NAME.length,
    description: REAL_PRO_DESCRIPTION,
    descriptionLength: REAL_PRO_DESCRIPTION.length,
    tradeIds: ['trade-painter', 'trade-plasterer'],
    services: ['Peinture intérieure', 'Ravalement'],
    serviceLengths: ['Peinture intérieure'.length, 'Ravalement'.length],
    city: 'Melun',
    departmentCode: '77',
    communeCode: '77288',
    latitude: 48.5421,
    longitude: 2.6553,
    locationType: 'mobile',
    memberSince: new Date('2025-03-01T08:00:00Z'),
    startingPrice: 40,
    avatar: media('avatar'),
    cover: null,
    zones: [
        {
            id: 'city-77288',
            kind: 'city',
            communeCode: '77288',
            city: 'Melun',
            departmentCode: '77',
            radiusKm: 20,
            latitude: 48.5421,
            longitude: 2.6553,
            surfaceHectares: 804,
        },
        { id: 'department-91', kind: 'department', departmentCode: '91' },
        { id: 'region-11', kind: 'region', regionCode: '11' },
        { id: 'country', kind: 'country' },
    ],
} as MemberProfessionalRow;

const annonceRow = {
    ...FORBIDDEN_EXTRAS,
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Peinture de salon',
    description: REAL_ANNONCE_DESCRIPTION,
    descriptionLength: REAL_ANNONCE_DESCRIPTION.length,
    tradeId: 'trade-painter',
    categoryId: 'category-artisans',
    priceType: 'fixed',
    price: 450,
    city: 'Melun',
    departmentCode: '77',
    communeCode: '77288',
    latitude: 48.5421,
    longitude: 2.6553,
    createdAt: new Date('2026-11-01T10:00:00Z'),
    photos: [media('annonce-1'), media('annonce-2')],
    professional: { ...FORBIDDEN_EXTRAS, ...proSummary },
} as MemberAnnonceRow;

const offerRow = {
    ...FORBIDDEN_EXTRAS,
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Ravalement -20 %',
    description: REAL_OFFER_DESCRIPTION,
    descriptionLength: REAL_OFFER_DESCRIPTION.length,
    tradeId: 'trade-painter',
    categoryId: 'category-artisans',
    discount: '-20 %',
    conditions: ['free_quote'],
    city: 'Melun',
    departmentCode: '77',
    communeCode: '77288',
    latitude: 48.5421,
    longitude: 2.6553,
    startsAt: null,
    expiresAt: new Date('2027-06-30T00:00:00Z'),
    createdAt: new Date('2026-11-02T10:00:00Z'),
    photo: media('offer'),
    professional: { ...FORBIDDEN_EXTRAS, ...proSummary },
} as MemberOfferRow;

const requestRow = {
    ...FORBIDDEN_EXTRAS,
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Peindre une chambre',
    description: REAL_REQUEST_DESCRIPTION,
    descriptionLength: REAL_REQUEST_DESCRIPTION.length,
    tradeId: 'trade-painter',
    categoryId: 'category-artisans',
    urgency: 'this_week',
    status: 'open',
    city: 'Melun',
    departmentCode: '77',
    communeCode: '77288',
    latitude: 48.5421,
    longitude: 2.6553,
    createdAt: new Date('2026-11-09T10:00:00Z'),
    expiresAt: new Date('2026-12-09T10:00:00Z'),
    photos: [media('request-1')],
    authorFirstName: REAL_FIRST_NAME,
    authorLastNameInitial: 'M',
    authorMemberSince: new Date('2026-01-15T08:00:00Z'),
} as MemberRequestRow;

/** Checks shared by every visitor answer: nothing original, nothing absent present */
const expectNoVisitorLeak = (answer: unknown, realTexts: string[]) => {
    const json = JSON.stringify(answer);
    for (const text of [...realTexts, REAL_PRO_NAME]) expect(json).not.toContain(text);
    for (const forbidden of ['"latitude"', '"longitude"', '"communeCode"', '1080.webp', 'Jean', 'Dupont']) {
        expect(json).not.toContain(forbidden);
    }
};

/** Checks shared by every answer, member included */
const expectNeverSent = (answer: unknown) => {
    const json = JSON.stringify(answer);
    for (const key of ['"phone"', '"showPhone"', '"email"', '"rating"', '"reviewsCount"', '"lastName"', '0601020304']) {
        expect(json).not.toContain(key);
    }
};

const sortedKeys = (value: object) => Object.keys(value).sort();

describe('serializeProfessional', () => {
    it('visitor: name and description blurred, photo blurred, no location, exact keys', () => {
        const answer = serializeProfessional(proRow, 'visitor');

        expectNoVisitorLeak(answer, [REAL_PRO_DESCRIPTION, 'Peinture intérieure', 'Ravalement']);
        expectNeverSent(answer);
        expect(answer.services).toEqual([
            { blurred: true, placeholder: expect.any(String) },
            { blurred: true, placeholder: expect.any(String) },
        ]);
        expect(sortedKeys(answer)).toEqual(
            [
                'id',
                'displayName',
                'description',
                'tradeIds',
                'services',
                'city',
                'department',
                'departmentCode',
                'locationType',
                'memberSince',
                'startingPrice',
                'avatar',
                'zones',
            ].sort(),
        );
        expect(answer.displayName).toEqual({ blurred: true, placeholder: expect.any(String) });
        expect(answer.description).toEqual({ blurred: true, placeholder: expect.any(String) });
        expect(answer.avatar).toEqual({ blurUrl: '/v1/media/media/avatar/blur.webp' });
        expect(answer.department).toBe('Seine-et-Marne');
        expect(answer.memberSince).toBe('2025-03');
        expect(answer.zones).toEqual([
            { kind: 'city', city: 'Melun', department: 'Seine-et-Marne', departmentCode: '77', radiusKm: 20 },
            { kind: 'department', code: '91', name: 'Essonne' },
            { kind: 'region', code: '11', name: 'Île-de-France' },
            { kind: 'country' },
        ]);
    });

    it('visitor: the fake name length is bucketed, not exact', () => {
        const answer = serializeProfessional(proRow, 'visitor');
        // 23 characters → 30
        expect(answer.displayName).toEqual({ blurred: true, placeholder: expect.stringMatching(/^.{30}$/) });
    });

    it('member: real texts, clear photo, commune center, zones with coordinates, never a phone', () => {
        const answer = serializeProfessional(proRow, 'member');

        expectNeverSent(answer);
        expect(answer.displayName).toBe(REAL_PRO_NAME);
        expect(answer.description).toBe(REAL_PRO_DESCRIPTION);
        expect(answer.latitude).toBe(48.5421);
        expect(answer.longitude).toBe(2.6553);
        expect(answer.communeCode).toBe('77288');
        expect(answer.avatar).toEqual({
            url: '/v1/media/media/avatar/1080.webp',
            blurUrl: '/v1/media/media/avatar/blur.webp',
        });
        expect(answer.zones[0]).toEqual({
            kind: 'city',
            id: 'city-77288',
            communeCode: '77288',
            city: 'Melun',
            department: 'Seine-et-Marne',
            departmentCode: '77',
            latitude: 48.5421,
            longitude: 2.6553,
            cityRadiusKm: expect.closeTo(1.6, 1),
            radiusKm: 20,
        });
    });

    it('leaves out absent optional fields instead of sending null', () => {
        const answer = serializeProfessional({ ...proRow, startingPrice: null, avatar: null }, 'visitor');
        expect(answer).not.toHaveProperty('startingPrice');
        expect(answer).not.toHaveProperty('avatar');
        expect(answer).not.toHaveProperty('cover');
    });

    it('refuses to build a member answer from a visitor row', () => {
        const { displayName: _n, description: _d, ...visitorOnly } = proRow;
        expect(() => serializeProfessional(visitorOnly as MemberProfessionalRow, 'member')).toThrow();
    });
});

describe('serializeAnnonce', () => {
    it('visitor: title and price readable, description and photos blurred, exact keys', () => {
        const answer = serializeAnnonce(annonceRow, 'visitor');

        expectNoVisitorLeak(answer, [REAL_ANNONCE_DESCRIPTION]);
        expectNeverSent(answer);
        expect(answer.title).toBe('Peinture de salon');
        expect(answer.price).toBe(450);
        expect(sortedKeys(answer)).toEqual(
            [
                'id',
                'title',
                'description',
                'tradeId',
                'categoryId',
                'priceType',
                'price',
                'city',
                'department',
                'departmentCode',
                'publishedAt',
                'photos',
                'professional',
            ].sort(),
        );
        expect(answer.photos).toEqual([
            { blurUrl: '/v1/media/media/annonce-1/blur.webp' },
            { blurUrl: '/v1/media/media/annonce-2/blur.webp' },
        ]);
        expect(sortedKeys(answer.professional)).toEqual(['avatar', 'displayName', 'id', 'tradeIds']);
        expect(answer.professional.displayName).toEqual({ blurred: true, placeholder: expect.any(String) });
    });

    it('visitor: no price key when the annonce is on quote', () => {
        const answer = serializeAnnonce({ ...annonceRow, priceType: 'quote', price: null }, 'visitor');
        expect(answer).not.toHaveProperty('price');
        expect(answer.priceType).toBe('quote');
    });

    it('member: real description, clear photos, commune center', () => {
        const answer = serializeAnnonce(annonceRow, 'member');

        expectNeverSent(answer);
        expect(answer.description).toBe(REAL_ANNONCE_DESCRIPTION);
        expect(answer.latitude).toBe(48.5421);
        expect(answer.photos[0]).toEqual({
            url: '/v1/media/media/annonce-1/1080.webp',
            blurUrl: '/v1/media/media/annonce-1/blur.webp',
        });
        expect(answer.professional.displayName).toBe(REAL_PRO_NAME);
    });
});

describe('serializeOffer', () => {
    it('visitor: offer type readable, description and photo blurred, exact keys', () => {
        const answer = serializeOffer(offerRow, 'visitor');

        expectNoVisitorLeak(answer, [REAL_OFFER_DESCRIPTION]);
        expectNeverSent(answer);
        expect(answer.title).toBe('Ravalement -20 %');
        expect(answer.discount).toBe('-20 %');
        expect(answer.conditions).toEqual(['free_quote']);
        // startsAt is null in the row: the key is absent
        expect(sortedKeys(answer)).toEqual(
            [
                'id',
                'title',
                'description',
                'tradeId',
                'categoryId',
                'discount',
                'conditions',
                'city',
                'department',
                'departmentCode',
                'publishedAt',
                'expiresAt',
                'photo',
                'professional',
            ].sort(),
        );
        expect(answer.photo).toEqual({ blurUrl: '/v1/media/media/offer/blur.webp' });
    });

    it('member: real description, clear photo, the professional commune center', () => {
        const answer = serializeOffer(offerRow, 'member');

        expectNeverSent(answer);
        expect(answer.description).toBe(REAL_OFFER_DESCRIPTION);
        expect(answer.latitude).toBe(48.5421);
        expect(answer.photo).toEqual({
            url: '/v1/media/media/offer/1080.webp',
            blurUrl: '/v1/media/media/offer/blur.webp',
        });
    });
});

describe('serializeRequest', () => {
    it('visitor: author first name blurred (10 characters), no initial, exact keys', () => {
        const answer = serializeRequest(requestRow, 'visitor', NOW);

        expectNoVisitorLeak(answer, [REAL_REQUEST_DESCRIPTION, REAL_FIRST_NAME]);
        expectNeverSent(answer);
        expect(answer.title).toBe('Peindre une chambre');
        expect(sortedKeys(answer)).toEqual(
            [
                'id',
                'title',
                'description',
                'tradeId',
                'categoryId',
                'urgency',
                'status',
                'city',
                'department',
                'departmentCode',
                'publishedAt',
                'expiresAt',
                'photos',
                'author',
            ].sort(),
        );
        expect(answer.author).toEqual({
            firstName: { blurred: true, placeholder: expect.stringMatching(/^.{10}$/) },
            memberSince: '2026-01',
        });
        expect(JSON.stringify(answer)).not.toContain('lastNameInitial');
    });

    it('computes the status: an open request past its expiry is expired', () => {
        const answer = serializeRequest(requestRow, 'visitor', new Date('2027-01-01T00:00:00Z'));
        expect(answer.status).toBe('expired');
        expect(serializeRequest(requestRow, 'visitor', NOW).status).toBe('open');
    });

    it('member: first name and initial, real description, commune center', () => {
        const answer = serializeRequest(requestRow, 'member', NOW);

        expectNeverSent(answer);
        expect(answer.description).toBe(REAL_REQUEST_DESCRIPTION);
        expect(answer.latitude).toBe(48.5421);
        expect(answer.author).toEqual({
            firstName: REAL_FIRST_NAME,
            lastNameInitial: 'M',
            memberSince: '2026-01',
        });
    });
});

describe('request author without last name', () => {
    it('an empty last name gives no initial', () => {
        const answer = serializeRequest({ ...requestRow, authorLastNameInitial: '' }, 'member', NOW);
        expect(answer.author).toMatchObject({ lastNameInitial: null });
    });

    it('a member request author without last name has no initial', () => {
        const answer = serializeRequest({ ...requestRow, authorLastNameInitial: null }, 'member', NOW);
        expect(answer.author).toEqual({
            firstName: REAL_FIRST_NAME,
            lastNameInitial: null,
            memberSince: '2026-01',
        });
    });
});

describe('memberSince is the month only, in French time, for every audience', () => {
    // 23:30 UTC on 31 March = 01:30 on 1 April in Paris
    const lateInMonth = new Date('2025-03-31T23:30:00Z');

    it.each(['visitor', 'member'] as const)('professional, %s', (audience) => {
        const answer = serializeProfessional({ ...proRow, memberSince: lateInMonth }, audience);
        expect(answer.memberSince).toBe('2025-04');
    });

    it.each(['visitor', 'member'] as const)('request author, %s', (audience) => {
        const answer = serializeRequest({ ...requestRow, authorMemberSince: lateInMonth }, audience, NOW);
        expect(answer.author.memberSince).toBe('2025-04');
        expect(JSON.stringify(answer)).not.toContain('T23:30');
    });
});

describe('member media', () => {
    it('fails loudly when a photo has no 1080 key instead of sending /v1/media/undefined', () => {
        const row = { ...annonceRow, photos: [{ blurKey: 'media/x/blur.webp' }] } as MemberAnnonceRow;
        expect(() => serializeAnnonce(row, 'member')).toThrow(/key1080/);
    });
});
