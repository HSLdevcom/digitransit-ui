import uniq from 'lodash/uniq';

// returns null or non-empty array of ticket names
export function mapFares(fares, config) {
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
    ticketName: config.fareMapping(fare.fareId),
  }));
}

export const getFares = (fares, routes, config) => {
  const knownFares = mapFares(fares, config) || [];

  const routesWithFares = uniq(
    knownFares
      .map(fare => (Array.isArray(fare.routes) && fare.routes) || [])
      .reduce((a, b) => a.concat(b), [])
      .map(route => route.gtfsId),
  );

  const unknownFares = ((Array.isArray(routes) && routes) || [])
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
    const fareId = currentFares[0].fareId;
    const ticketFeed = fareId.split(':')[0];
    const faresForFeed = allFares[ticketFeed];
    if (faresForFeed && faresForFeed[fareId]) {
      const ticketPrice = faresForFeed[fareId].price;
      for (let [key, value] of Object.entries(faresForFeed)) {
        if (key !== fareId && value.zones.includes(zones[0]) && value.price === ticketPrice) {
          alternativeFares.push(key.split(':')[1]);
        }
      }
    }
  }
  return alternativeFares;
}
