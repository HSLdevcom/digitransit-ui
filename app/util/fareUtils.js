import { uniqBy } from 'lodash';

export const getFaresFromLegs = (legs, config) => {
  if (
    !Array.isArray(legs) ||
    legs.size === 0 ||
    !config.showTicketInformation
  ) {
    return null;
  }
  const availableTickets = Object.values(config.availableTickets)
    .map(r => Object.keys(r))
    .flat();
  const filteredLegs = legs.map(leg => ({
    ...leg,
    fareProducts: leg.fareProducts.filter(fp =>
      availableTickets.includes(fp.product.id),
    ),
  }));

  const knownFareLegs = uniqBy(
    filteredLegs
      .filter(l => l.fareProducts.length > 0)
      .map(leg => ({
        fareProducts: leg.fareProducts.filter(fp =>
          availableTickets.includes(fp.product.id),
        ),
        route: leg.route,
        agency: leg.route.agency,
      })),
    'fareProducts[0].id',
  ).map(fp => ({
    fareProducts: fp.fareProducts,
    agency: fp.agency,
    price: fp.fareProducts[0].product.price.amount,
    ticketName:
      // E2E-testing does not work without this check
      (config.NODE_ENV === 'test' &&
        fp.fareProducts[0].product.id.split(':')[1]) ||
      config.fareMapping(fp.fareProducts[0].product.id),
  }));

  // Legs that have empty fares but still have a route, i.e. transit legs
  const unknownFareLegs = filteredLegs
    .filter(l => l.fareProducts.length === 0 && l.route)
    .map(leg => leg.route)
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
  return [...knownFareLegs, ...unknownFareLegs];
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
    const { fareProducts } = currentFares[0];
    const fareId = fareProducts[0].product.id;
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

export const shouldShowFarePurchaseInfo = (config, breakpoint, fares) => {
  const unknownFares = fares.some(fare => fare.isUnknown);
  // Windows phones or Huawei should only show ticket information.
  const { userAgent } = navigator;
  const huaweiPattern = /(?:huaweibrowser|huawei|emui|hmscore|honor)/i;
  const windowsPattern = /windows phone/i;
  if (huaweiPattern.test(userAgent) || windowsPattern.test(userAgent)) {
    return false;
  }
  return (
    !unknownFares &&
    fares?.length === 1 &&
    config.ticketPurchaseLink &&
    breakpoint !== 'large'
  );
};
