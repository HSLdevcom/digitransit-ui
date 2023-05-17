/**
 * StreetMode depicts different kinds of mode available as non-public transportation.
 */
export const StreetMode = Object.freeze({
  /** Cycling */
  Bicycle: 'BICYCLE',
  /** Driving */
  Car: 'CAR',
  /** Driving and parking */
  ParkAndRide: 'CAR_PARK',
  /** Walking */
  Walk: 'WALK',
});

/**
 * TransportMode depicts different kinds of mode available as public transportation.
 */
export const TransportMode = Object.freeze({
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
  /** Taking the funicular */
  Funicular: 'FUNICULAR',
});

/**
 * Mode depicts different kinds of mode available as any kind of transportation.
 */
export const Mode = Object.freeze({
  ...StreetMode,
  ...TransportMode,
});

/**
 * RealtimeStateType depicts different types of a trip's information state.
 */
export const RealtimeStateType = Object.freeze({
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
});

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
export const AlertSeverityLevelType = Object.freeze({
  Info: 'INFO',
  Severe: 'SEVERE',
  Unknown: 'UNKNOWN_SEVERITY',
  Warning: 'WARNING',
});

/**
 * AlertEntityType is an OTP enum for different entity selector
 * types on GTFS RT service alerts.
 */
export const AlertEntityType = Object.freeze({
  Agency: 'Agency',
  Route: 'Route',
  Pattern: 'Pattern',
  Stop: 'Stop',
  Trip: 'Trip',
  StopOnRoute: 'StopOnRoute',
  StopOnTrip: 'StopOnTrip',
  RouteType: 'RouteType',
  Unknown: 'Unknown',
});

export const ExtendedRouteTypes = Object.freeze({
  BusExpress: 702,
  BusLocal: 704,
});

export const ParkTypes = {
  Bicycle: 'BICYCLE',
  Car: 'CAR',
};

/**
 * OpenTripPlanner (v2) plan message enumerations.
 */
export const PlannerMessageType = Object.freeze({
  NoTransitConnection: 'NO_TRANSIT_CONNECTION',
  NoTransitConnectionInSearchWindow: 'NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW',
  WalkingBetterThanTransit: 'WALKING_BETTER_THAN_TRANSIT',
  OutsideBounds: 'OUTSIDE_BOUNDS',
  OutsideServicePeriod: 'OUTSIDE_SERVICE_PERIOD',
  LocationNotFound: 'LOCATION_NOT_FOUND',
  NoStopsInRange: 'NO_STOPS_IN_RANGE',
  SystemError: 'SYSTEM_ERROR',
});
