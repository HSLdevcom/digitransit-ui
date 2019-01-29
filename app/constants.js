/**
 * StreetMode depicts different kinds of mode available as non-public transportation.
 */
export const StreetMode = {
  /** Cycling */
  Bicycle: 'BICYCLE',
  /** Driving */
  Car: 'CAR',
  /** Driving and parking */
  ParkAndRide: 'CAR_PARK',
  /** Walking */
  Walk: 'WALK',
};

/**
 * TransportMode depicts different kinds of mode available as public transportation.
 */
export const TransportMode = {
  /** Taking the airplane */
  Airplane: 'AIRPLANE',
  /** Taking the bus */
  Bus: 'BUS',
  /** Cycling with a city bike */
  Citybike: 'CITYBIKE',
  /** Taking the ferry */
  Ferry: 'FERRY',
  /** Taking the train */
  Rail: 'RAIL',
  /** Taking the subway */
  Subway: 'Subway',
  /** Taking the tram */
  Tram: 'TRAM',
};

/**
 * Mode depicts different kinds of mode available as any kind of transportation.
 */
export const Mode = {
  ...StreetMode,
  ...TransportMode,
};

/**
 * OptimizeType depicts different types of OTP routing optimization.
 */
export const OptimizeType = {
  /** Avoid changes in altitude. Needs elevation data in OTP to work. */
  Flat: 'FLAT',
  /** Weights cycleways even more. Used only for biking. */
  Greenways: 'GREENWAYS',
  /** The quickest route. */
  Quick: 'QUICK',
  /** The safest route. */
  Safe: 'SAFE',
  /** Uses the flat/quick/safe triangle for routing. Used only for biking. */
  Triangle: 'TRIANGLE',
};

/**
 * QuickOptionSetType depicts different types of quick routing settings sets.
 */
export const QuickOptionSetType = {
  DefaultRoute: 'default-route',
  LeastElevationChanges: 'least-elevation-changes',
  LeastTransfers: 'least-transfers',
  LeastWalking: 'least-walking',
  PreferGreenways: 'prefer-greenways',
  PreferWalkingRoutes: 'prefer-walking-routes',
  SavedSettings: 'saved-settings',
};

/**
 * RealtimeStateType depicts different types of a trip's information state.
 */
export const RealtimeStateType = {
  /** The trip has been added using a real-time update, i.e. the trip was not present in the GTFS feed. */
  Added: 'ADDED',
  /** The trip has been canceled by a real-time update. */
  Canceled: 'CANCELED',
  /** The trip information has been updated and resulted in a different trip pattern compared to the trip pattern of the scheduled trip. */
  Modified: 'MODIFIED',
  /** The trip information comes from the GTFS feed, i.e. no real-time update has been applied. This is often the default state. */
  Scheduled: 'SCHEDULED',
  /** The trip information has been updated, but the trip pattern stayed the same as the trip pattern of the scheduled trip. */
  Updated: 'UPDATED',
};
