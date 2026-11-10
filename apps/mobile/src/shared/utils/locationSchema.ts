import { createLocationSchema } from '@sialty/domain';
import { Strings } from '@/shared/constants';

// ============================================
// The location rules live in @sialty/domain (the server uses them too).
// This file binds them to the app's French messages.
// ============================================

export { EMPTY_LOCATION, LOCATION_LIMITS } from '@sialty/domain';
export type { LocationValue } from '@sialty/domain';

export const locationSchema = createLocationSchema(Strings.locationFields.errors);
