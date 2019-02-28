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

/**
 * This is the date format string to use for querying dates from OTP.
 */
export const DATE_FORMAT = 'YYYYMMDD';

/**
 * AlertSeverityLevelType is an experimental part of the gtfs-rt specification.
 * It is used here to depict the severity of a service alert.
 *
 * see: https://github.com/google/transit/pull/136/files
 */
export const AlertSeverityLevelType = {
  Info: 'INFO',
  Severe: 'SEVERE',
  Unknown: 'UNKNOWN_SEVERITY',
  Warning: 'WARNING',
};

/**
 * AlertEffectType is used to describe the kind of effect that the alert has on
 * the related entity.
 *
 * see: https://developers.google.com/transit/gtfs-realtime/guides/service-alerts
 */
export const AlertEffectType = {
  AdditionalService: 'ADDITIONAL_SERVICE',
  Detour: 'DETOUR',
  ModifiedService: 'MODIFIED_SERVICE',
  NoEffect: 'NO_EFFECT',
  NoService: 'NO_SERVICE',
  OtherEffect: 'OTHER_EFFECT',
  ReducedService: 'REDUCED_SERVICE',
  SignificantDelays: 'SIGNIFICANT_DELAYS',
  StopMoved: 'STOP_MOVED',
  Unknown: 'UNKNOWN_EFFECT',
};
