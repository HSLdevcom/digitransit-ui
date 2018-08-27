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
