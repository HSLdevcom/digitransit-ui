import uniq from 'lodash/uniq';

function getFareId(config, fareId, lang) {
  // E2E-testing does not work without this check
  const tmp =
    (config.NODE_ENV === 'test' &&
      (fareId && fareId.substring
        ? fareId.substring(fareId.indexOf(':') + 1)
        : '')) ||
    config.fareMapping(fareId);
  return typeof tmp === 'string' ? tmp : tmp[lang];
}

// returns null or non-empty array of ticket names
export function mapFares(fares, config, lang) {
  if (!Array.isArray(fares) || !config.showTicketInformation) {
    return null;
  }

  const [regularFare] = fares.filter(fare => fare.type === 'regular');
  if (!regularFare) {
    return null;
  }

  const { components } = regularFare;
  if (!Array.isArray(components) || components.length === 0) {
    return null;
  }

  return components.map(fare => ({
    ...fare,
    agency:
      (Array.isArray(fare.routes) &&
        fare.routes.length > 0 &&
        fare.routes[0].agency) ||
      undefined,
    ticketName: getFareId(config, fare.fareId, lang),
  }));
}

export function fetchFares(itinerary, url) {
  const it = {
    startTime: itinerary.startTime,
    endTime: itinerary.endTime,
    walkDistance: itinerary.walkDistance,
    duration: itinerary.duration,
    legs: itinerary.legs.map(
      ({ __id, __fragmentOwner, __fragments, ...item }) => item,
    ),
  };

  return fetch(url, {
    method: 'POST',
    // eslint-disable-next-line compat/compat
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify(it),
  }).then(response => {
    return response.ok ? response.json() : null;
  });
}

export const getFares = (fares, routes, config, lang) => {
  const knownFares = mapFares(fares, config, lang) || [];

  const routesWithFares = uniq(
    knownFares
      .map(fare => (Array.isArray(fare.routes) && fare.routes) || [])
      .reduce((a, b) => a.concat(b), [])
      .map(route => route.gtfsId),
  );

  const unknownTotalFare =
    fares && fares[0] && fares[0].type === 'regular' && fares[0].cents === -1;
  const unknownFares = (
    ((unknownTotalFare || !fares) && Array.isArray(routes) && routes) ||
    []
  )
    .filter(route => !routesWithFares.includes(route.gtfsId))
    .map(route => ({
      agency: {
        fareUrl: route.agency.fareUrl,
        gtfsId: route.agency.gtfsId,
        name: route.agency.name,
      },
      isUnknown: true,
      routeGtfsId: route.gtfsId,
      routeName: route.longName,
    }));

  return [...knownFares, ...unknownFares];
};

/**
 * Returns alternative fares that cost as much as the one given by OpenTripPlanner
 *
 * @param {*} zones zones that are visited.
 * @param {*} currentFares fare given by OpenTripPlanner.
 * @param {*} allFares all fare options.
 */
export const getAlternativeFares = (zones, currentFares, allFares) => {
  const alternativeFares = [];
  if (zones.length === 1 && currentFares.length === 1 && allFares) {
    const { fareId } = currentFares[0];
    const ticketFeed = fareId.split(':')[0];
    const faresForFeed = allFares[ticketFeed];
    if (faresForFeed && faresForFeed[fareId]) {
      const ticketPrice = faresForFeed[fareId].price;
      Object.keys(faresForFeed).forEach(key => {
        const fareInfo = faresForFeed[key];
        if (
          key !== fareId &&
          fareInfo.zones.includes(zones[0]) &&
          fareInfo.price === ticketPrice
        ) {
          alternativeFares.push(key.split(':')[1]);
        }
      });
    }
  }
  return alternativeFares;
};

/**
 * This function resolves if fare info should be shown.
 * Fare information is shown if showTicketInformation is true in config
 * and availableTickets includes tickets for some feedId from config.
 *
 * @param {*} config configuration.
 */
export const shouldShowFareInfo = config =>
  config.showTicketInformation &&
  config.availableTickets &&
  Array.isArray(config.feedIds) &&
  config.feedIds.some(feedId => config.availableTickets[feedId]);
