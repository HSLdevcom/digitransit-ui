import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import { graphql } from 'react-relay';

import { parseLatLon } from './otpStrings';
import { PREFIX_ITINERARY_SUMMARY } from './path';
import { saveFutureRoute } from '../action/FutureRoutesActions';

/**
 * Removes selected itinerary index from url (pathname) and
 * state and then returns a cleaned object.
 *
 * @param {*} location from the router
 * @returns cleaned location object
 */
export const resetSelectedItineraryIndex = loc => {
  const location = cloneDeep(loc);
  if (location.state && location.state.summaryPageSelected) {
    location.state.summaryPageSelected = 0;
  }

  if (location.pathname) {
    const pathArray = location.pathname.split('/');
    if (pathArray.length === 5) {
      pathArray.pop();
      location.pathname = pathArray.join('/');
    }
  }

  return location;
};

/**
 * Processes query so that empty arrays will be preserved in URL
 *
 * @param {*} query The location query params to fix
 */

export const fixArrayParams = query => {
  const fixedQuery = { ...query };

  Object.keys(query).forEach(key => {
    if (Array.isArray(query[key]) && !query[key].length) {
      fixedQuery[key] = '';
    }
  });
  return fixedQuery;
};

/**
 * Updates the browser's url with the given parameters.
 *
 * @param {*} router The router
 * @param {*} match The match object from found
 * @param {*} newParams The location query params to apply
 */
export const replaceQueryParams = (router, match, newParams, executeAction) => {
  let { location } = match;
  location = resetSelectedItineraryIndex(location);

  const query = fixArrayParams({
    ...location.query,
    ...newParams,
  });

  if (
    query &&
    query.time &&
    location &&
    location.pathname.indexOf(PREFIX_ITINERARY_SUMMARY) === 1 &&
    executeAction
  ) {
    const pathArray = decodeURIComponent(location.pathname)
      .substring(1)
      .split('/');
    pathArray.shift();
    const originArray = pathArray[0].split('::');
    const destinationArray = pathArray[1].split('::');
    const newRoute = {
      origin: {
        address: originArray[0],
        coordinates: parseLatLon(originArray[1]),
      },
      destination: {
        address: destinationArray[0],
        coordinates: parseLatLon(destinationArray[1]),
      },
      arriveBy: query.arriveBy ? query.arriveBy : false,
      time: query.time,
    };
    executeAction(saveFutureRoute, newRoute);
  }

  router.replace({
    ...location,
    query,
  });
};

/**
 * Updates the intermediatePlaces query parameter with the given values.
 *
 * @param {*} router The router
 * @param {*} match The match object from found
 * @param {String|String[]} newIntermediatePlaces A string or an array of intermediate locations
 */
export const setIntermediatePlaces = (router, match, newIntermediatePlaces) => {
  const hasUndefined = string => string.includes('undefined');

  if (
    isString(newIntermediatePlaces) ||
    (Array.isArray(newIntermediatePlaces) &&
      newIntermediatePlaces.every(isString))
  ) {
    let parsedIntermediatePlaces;

    if (isString(newIntermediatePlaces)) {
      parsedIntermediatePlaces = hasUndefined(newIntermediatePlaces)
        ? ''
        : newIntermediatePlaces;
    } else {
      parsedIntermediatePlaces = newIntermediatePlaces.filter(
        intermediatePlace => !hasUndefined(intermediatePlace),
      );
    }

    replaceQueryParams(router, match, {
      intermediatePlaces: parsedIntermediatePlaces,
    });
  }
};

/**
 * Generic plan query.
 */
export const planQuery = graphql`
  query queryUtils_SummaryPage_Query(
    $fromPlace: String!
    $toPlace: String!
    $intermediatePlaces: [InputCoordinates!]
    $numItineraries: Int!
    $modes: [TransportMode!]
    $date: String!
    $time: String!
    $walkReluctance: Float
    $walkBoardCost: Int
    $minTransferTime: Int
    $walkSpeed: Float
    $maxWalkDistance: Float
    $wheelchair: Boolean
    $ticketTypes: [String]
    $disableRemainingWeightHeuristic: Boolean
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
    $locale: String
  ) {
    viewer {
      ...SummaryPage_viewer
      @arguments(
        fromPlace: $fromPlace
        toPlace: $toPlace
        intermediatePlaces: $intermediatePlaces
        numItineraries: $numItineraries
        modes: $modes
        date: $date
        time: $time
        walkReluctance: $walkReluctance
        walkBoardCost: $walkBoardCost
        minTransferTime: $minTransferTime
        walkSpeed: $walkSpeed
        maxWalkDistance: $maxWalkDistance
        wheelchair: $wheelchair
        ticketTypes: $ticketTypes
        disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
        arriveBy: $arriveBy
        transferPenalty: $transferPenalty
        bikeSpeed: $bikeSpeed
        optimize: $optimize
        itineraryFiltering: $itineraryFiltering
        unpreferred: $unpreferred
        allowedBikeRentalNetworks: $allowedBikeRentalNetworks
        locale: $locale
      )
    }

    serviceTimeRange {
      ...SummaryPage_serviceTimeRange
    }
  }
`;

export const moreItinerariesQuery = graphql`
  query queryUtils_SummaryPage_moreItins_Query(
    $fromPlace: String!
    $toPlace: String!
    $intermediatePlaces: [InputCoordinates!]
    $numItineraries: Int!
    $modes: [TransportMode!]
    $date: String!
    $time: String!
    $walkReluctance: Float
    $walkBoardCost: Int
    $minTransferTime: Int
    $walkSpeed: Float
    $maxWalkDistance: Float
    $wheelchair: Boolean
    $ticketTypes: [String]
    $disableRemainingWeightHeuristic: Boolean
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
    $locale: String
  ) {
    plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      intermediatePlaces: $intermediatePlaces
      numItineraries: $numItineraries
      transportModes: $modes
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      maxWalkDistance: $maxWalkDistance
      wheelchair: $wheelchair
      allowedTicketTypes: $ticketTypes
      disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      itineraryFiltering: $itineraryFiltering
      unpreferred: $unpreferred
      allowedBikeRentalNetworks: $allowedBikeRentalNetworks
      locale: $locale
    ) {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...SummaryPlanContainer_itineraries
        legs {
          mode
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
          route {
            gtfsId
          }
          trip {
            gtfsId
            directionId
            stoptimesForDate {
              scheduledDeparture
              pickupType
            }
            pattern {
              ...RouteLine_pattern
            }
          }
          from {
            name
            lat
            lon
            stop {
              gtfsId
              zoneId
            }
            bikeRentalStation {
              bikesAvailable
              networks
            }
          }
          to {
            stop {
              gtfsId
              zoneId
            }
            bikePark {
              bikeParkId
              name
            }
          }
        }
      }
    }
  }
`;
