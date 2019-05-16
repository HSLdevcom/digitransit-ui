import uniq from 'lodash/uniq';

// returns null or non-empty array of localized ticket names
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
    ticketName: config.fareMapping(fare.fareId, lang),
  }));
}

export const getFares = (fares, routes, config, lang) => {
  const knownFares = mapFares(fares, config, lang) || [];

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
        name: route.agency.name,
      },
      isUnknown: true,
      routeName: route.longName,
    }));

  return [...knownFares, ...unknownFares];
};
