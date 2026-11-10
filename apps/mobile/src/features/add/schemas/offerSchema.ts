import { createOfferSchema } from '@sialty/domain';
import { Strings } from '@/shared/constants';

// ============================================
// OFFER SCHEMA — the rules live in @sialty/domain (the server validates
// with the same ones). This file binds them to the app's French messages.
// ============================================

export { createOfferSchema, OFFER_CONDITIONS, OFFER_LIMITS, startOfDay } from '@sialty/domain';
export type { OfferFormInput, OfferFormOutput } from '@sialty/domain';

export const offerSchema = createOfferSchema(Strings.add.offerForm.errors);
