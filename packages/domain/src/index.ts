// ============================================
// @sialty/domain — rules shared by the app and the server.
// Pure TypeScript: no React, React Native, Expo or app import (checked by
// __tests__/purity.test.ts). User-facing texts always come in as parameters.
// ============================================

export * from './types';

// Requests: rules, who can answer, status
export * from './requests/requestRules';
export * from './requests/requestEligibility';
export * from './requests/requestStatus';

// Zones of a professional
export * from './zones/serviceZones';

// Geography
export * from './geo/frenchGeo';
export * from './geo/distance';

// Form rules
export * from './forms/patterns';
export * from './forms/locationSchema';
export * from './forms/annonceSchema';
export * from './forms/offerSchema';

// Moderation of published texts
export * from './moderation/contactFilter';

// Reference data (trades, categories)
export * from './reference/trades';
export * from './reference/categories';

// Home feed rules
export * from './feed/feedRules';

// Offers: when is an offer running
export * from './offers/offerAvailability';

// Shapes of the public read API (types only)
export * from './api/publicTypes';
