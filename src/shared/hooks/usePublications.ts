import { useCallback, useMemo } from 'react';
import type { Annonce, Offer } from '@/shared/types';
import { isMine, listAnnonces, listOffers } from '@/shared/utils/publications';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import {
    addAnnonce,
    addOffer,
    PublishedAnnonce,
    PublishedOffer,
    selectPublishedAnnonces,
    selectPublishedOffers,
} from '@/stores/publications/publicationsSlice';

// ============================================
// Publication hooks — screens read every annonce and offer here and never touch
// Redux directly. With a backend these hooks become the API calls.
// ============================================

/** Every annonce: published ones first. Same array until a new one is published. */
export const useAnnonces = (): Annonce[] => {
    const records = useAppSelector(selectPublishedAnnonces);
    return useMemo(() => listAnnonces(records), [records]);
};

/** Every offer: published ones first. Same array until a new one is published. */
export const useOffers = (): Offer[] => {
    const records = useAppSelector(selectPublishedOffers);
    return useMemo(() => listOffers(records), [records]);
};

/** The annonces and offers of the signed-in professional, most recent published first */
export const useMyPublications = (): { annonces: Annonce[]; offers: Offer[] } => {
    const annonces = useAnnonces();
    const offers = useOffers();
    return useMemo(
        () => ({ annonces: annonces.filter(isMine), offers: offers.filter(isMine) }),
        [annonces, offers],
    );
};

/** One annonce by ID (undefined when unknown) */
export const useAnnonce = (id: string): Annonce | undefined =>
    useAnnonces().find((annonce) => annonce.id === id);

/** One offer by ID (null when unknown) */
export const useOffer = (id: string): Offer | null =>
    useOffers().find((offer) => offer.id === id) ?? null;

/**
 * Actions on publications.
 * @returns publishAnnonce(record), publishOffer(record)
 */
export const usePublicationActions = () => {
    const dispatch = useAppDispatch();

    const publishAnnonce = useCallback(
        (record: PublishedAnnonce) => {
            dispatch(addAnnonce(record));
        },
        [dispatch],
    );
    const publishOffer = useCallback(
        (record: PublishedOffer) => {
            dispatch(addOffer(record));
        },
        [dispatch],
    );

    return { publishAnnonce, publishOffer };
};
