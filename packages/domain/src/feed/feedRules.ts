/**
 * Rules of the home feed, shared by the server (which applies them) and the
 * app (which explains them). Change values here only.
 * - radiusStepsKm: distance steps tried in order around the viewer
 * - finalStep: after the last distance step, widen to the viewer's department
 * - pageSize / maxPageSize: default and hard limit of items per page
 */
export const FEED_RULES = {
    radiusStepsKm: [30, 100],
    finalStep: 'department',
    pageSize: 20,
    maxPageSize: 50,
} as const;

/** Radius actually used by a feed page: a distance in km (as text) or the department */
export type FeedRadius = '30' | '100' | 'department';
