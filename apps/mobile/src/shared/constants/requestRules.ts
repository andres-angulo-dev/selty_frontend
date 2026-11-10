// ============================================
// REQUEST RULES — the single place for the parameters of service requests.
// To change a value, change it here: the code and the messages follow. The
// server must use the same values.
//
// A professional can answer a request when ALL of these are true:
//   1. the request is open (not fulfilled, not expired);
//   2. they are not its author;
//   3. the request's trade is one of their trades;
//   4. the request falls inside AT LEAST ONE of their zones.
//
// Inside a zone:
//   - around a city: same commune, OR distance between the two commune centers
//     <= size of the city + kilometers chosen. So 0 km = the city only, and
//     1 km = the city plus 1 km around it. The size of the city is estimated
//     from its surface, as a circle. The request is located at the center of its
//     commune, the only place known since the address stays private. Without
//     coordinates on the request: same department as the zone's city;
//   - department: same department;
//   - region: its department belongs to that region;
//   - whole of France: always, but ONLY for a trade that can be done at a distance.
//
// Zones never duplicate each other: a department already covered by a chosen
// region is refused, and adding a region removes the departments it contains.
// A circle around a city can overflow a department, so it is not a duplicate.
// ============================================

export const REQUEST_RULES = {
    /** A request stays in the feed this long, unless a pro was found before */
    lifetimeDays: 30,

    /** Kilometers around a city a professional can choose (the slider's stops) */
    radiusStepsKm: [0, 1, 3, 5, 10, 20, 30, 50, 100],

    /** Stop selected when adding a zone */
    defaultRadiusKm: 30,

    /** Number of zones per professional. A region counts for one */
    minZones: 1,
    maxZones: 10,

    /** A professional always keeps at least one trade */
    minTrades: 1,
} as const;
