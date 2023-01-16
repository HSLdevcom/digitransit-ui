import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import { graphql } from 'react-relay';
import omit from 'lodash/omit';
import {
  locationToOTP,
  otpToLocation,
  getIntermediatePlaces,
} from './otpStrings';
import { getPathWithEndpointObjects, PREFIX_ITINERARY_SUMMARY } from './path';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { addViaPoint } from '../action/ViaPointActions';

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
export const replaceQueryParams = (router, match, newParams) => {
  let { location } = match;
  location = resetSelectedItineraryIndex(location);

  const query = fixArrayParams({
    ...location.query,
    ...newParams,
  });

  router.replace({
    ...location,
    query,
  });
};

/**
 * Clears the given parameters from the browser's url.
 *
 * @param {*} router The router
 * @param {string[]} paramsToClear The parameters to clear from the url
 */
export const clearQueryParams = (router, match, paramsToClear = []) => {
  if (paramsToClear.length === 0) {
    return;
  }
  let { location } = match;

  location = resetSelectedItineraryIndex(location);

  const query = omit(location.query, paramsToClear);
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

export const updateItinerarySearch = (
  origin,
  destination,
  router,
  location,
  executeAction,
) => {
  executeAction(saveFutureRoute, {
    origin,
    destination,
    query: location.query,
  });

  const newLocation = {
    ...location,
    state: {
      ...location.state,
      summaryPageSelected: 0,
    },
    pathname: getPathWithEndpointObjects(
      origin,
      destination,
      PREFIX_ITINERARY_SUMMARY,
    ),
  };
  router.replace(newLocation);
};

export const onLocationPopup = (item, id, router, match, executeAction) => {
  if (id === 'via') {
    const viaPoints = getIntermediatePlaces(match.location.query)
      .concat([item])
      .map(locationToOTP);
    executeAction(addViaPoint, item);
    setIntermediatePlaces(router, match, viaPoints);
    return;
  }
  let origin = otpToLocation(match.params.from);
  let destination = otpToLocation(match.params.to);
  if (id === 'origin') {
    origin = item;
  } else {
    destination = item;
  }
  updateItinerarySearch(
    origin,
    destination,
    router,
    match.location,
    executeAction,
  );
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
    $wheelchair: Boolean
    $ticketTypes: [String]
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedVehicleRentalNetworks: [String]
    $locale: String
    $modeWeight: InputModeWeight
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
        wheelchair: $wheelchair
        ticketTypes: $ticketTypes
        arriveBy: $arriveBy
        transferPenalty: $transferPenalty
        bikeSpeed: $bikeSpeed
        optimize: $optimize
        itineraryFiltering: $itineraryFiltering
        unpreferred: $unpreferred
        allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
        locale: $locale
        modeWeight: $modeWeight
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
    $wheelchair: Boolean
    $ticketTypes: [String]
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedVehicleRentalNetworks: [String]
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
      wheelchair: $wheelchair
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      itineraryFiltering: $itineraryFiltering
      unpreferred: $unpreferred
      allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
      locale: $locale
    ) {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        duration
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
            shortName
            type
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
            carPark {
              carParkId
              name
            }
          }
        }
      }
    }
  }
`;
