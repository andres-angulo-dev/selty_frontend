import { createAnnonceSchema } from '@sialty/domain';
import { Strings } from '@/shared/constants';

// ============================================
// ANNONCE SCHEMA — the rules live in @sialty/domain (the server validates
// with the same ones). This file binds them to the app's French messages.
// ============================================

export { ANNONCE_LIMITS, ANNONCE_PRICE_TYPES, createAnnonceSchema, parsePriceInput } from '@sialty/domain';
export type { AnnonceFormInput, AnnonceFormOutput } from '@sialty/domain';

export const annonceSchema = createAnnonceSchema(Strings.add.annonceForm.errors, Strings.locationFields.errors);
