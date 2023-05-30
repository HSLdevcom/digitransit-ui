import uniq from 'lodash/uniq';
import React from 'react';
import { FormattedNumber } from 'react-intl';

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
    ticketName:
      // E2E-testing does not work without this check
      (config.NODE_ENV === 'test' &&
        (fare.fareId && fare.fareId.substring
          ? fare.fareId.substring(fare.fareId.indexOf(':') + 1)
          : '')) ||
      config.fareMapping(fare.fareId),
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

  const unknownTotalFare =
    fares && fares[0] && fares[0].type === 'regular' && fares[0].cents === -1;
  const unknownFares = (
    ((unknownTotalFare || !fares || fares.length === 0) &&
      Array.isArray(routes) &&
      routes) ||
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

/**
 * Converts the price in cents to euros and returns the formatted amount.
 *
 * @param {number} price - The price in cents.
 * @returns {React.ReactNode} - The formatted amount as a React node.
 */
export const formatPriceInEuros = price => {
  const amountInEuros = price / 100; // Convert cents to euros

  return (
    <FormattedNumber
      value={amountInEuros}
      // eslint-disable-next-line react/style-prop-object
      style="currency"
      currency="EUR"
      minimumFractionDigits={2}
      maximumFractionDigits={2}
      aria-label={`Price: ${amountInEuros} euros`}
    />
  );
};

/**
 * Converts the price in cents to euros and returns the formatted amount suitable for aria.
 *
 * @param {number} price - The price in cents.
 * @returns {string} - The formatted amount as a string.
 */
export const fortmatPriceForAria = price => `${(price / 100).toFixed(2)} €`;
