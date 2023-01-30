import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import { graphql } from 'react-relay';
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
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
    $modeWeight: InputModeWeight
  ) {
    viewer {
      ...SummaryPage_viewer
      @arguments(
        fromPlace: $fromPlace
        toPlace: $toPlace
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
        unpreferred: $unpreferred
        allowedBikeRentalNetworks: $allowedBikeRentalNetworks
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
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
  ) {
    plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
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
      unpreferred: $unpreferred
      allowedVehicleRentalNetworks: $allowedBikeRentalNetworks
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

export const allModesQuery = graphql`
query queryUtils_SummaryPage_allModesQuery(
  $fromPlace: String!
  $toPlace: String!
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
  $unpreferred: InputUnpreferred
  $allowedBikeRentalNetworks: [String]
) {
  plan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
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
    unpreferred: $unpreferred
    allowedVehicleRentalNetworks: $allowedBikeRentalNetworks
  ) {
    routingErrors {
      code
      inputField
    }
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

export const walkAndBikeQuery = graphql`
query queryUtils_SummaryPage_WalkBike_Query(
  $fromPlace: String!
  $toPlace: String!
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
  $unpreferred: InputUnpreferred
  $shouldMakeWalkQuery: Boolean!
  $shouldMakeBikeQuery: Boolean!
  $shouldMakeCarQuery: Boolean!
  $shouldMakeParkRideQuery: Boolean!
  $showBikeAndPublicItineraries: Boolean!
  $showBikeAndParkItineraries: Boolean!
  $bikeAndPublicModes: [TransportMode!]
  $bikeParkModes: [TransportMode!]
) {
  walkPlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    transportModes: [{ mode: WALK }]
    date: $date
    time: $time
    walkSpeed: $walkSpeed
    wheelchair: $wheelchair
    arriveBy: $arriveBy
  ) @include(if: $shouldMakeWalkQuery) {
    ...SummaryPlanContainer_plan
    ...ItineraryTab_plan
    itineraries {
      walkDistance
      duration
      startTime
      endTime
      ...ItineraryTab_itinerary
      ...SummaryPlanContainer_itineraries
      legs {
        mode
        ...ItineraryLine_legs
        legGeometry {
          points
        }
        distance
      }
    }
  }

  bikePlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    transportModes: [{ mode: BICYCLE }]
    date: $date
    time: $time
    walkSpeed: $walkSpeed
    arriveBy: $arriveBy
    bikeSpeed: $bikeSpeed
    optimize: $optimize
  ) @include(if: $shouldMakeBikeQuery) {
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
        legGeometry {
          points
        }
        distance
      }
    }
  }

  bikeAndPublicPlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    numItineraries: 6
    transportModes: $bikeAndPublicModes
    date: $date
    time: $time
    walkReluctance: $walkReluctance
    walkBoardCost: $walkBoardCost
    minTransferTime: $minTransferTime
    walkSpeed: $walkSpeed
    allowedTicketTypes: $ticketTypes
    arriveBy: $arriveBy
    transferPenalty: $transferPenalty
    bikeSpeed: $bikeSpeed
    optimize: $optimize
    unpreferred: $unpreferred
  ) @include(if: $showBikeAndPublicItineraries) {
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
          type
          shortName
        }
        trip {
          gtfsId
          directionId
          stoptimesForDate {
            scheduledDeparture
          }
          pattern {
            ...RouteLine_pattern
          }
        }
        distance
      }
    }
  }

  bikeParkPlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    numItineraries: 6
    transportModes: $bikeParkModes
    date: $date
    time: $time
    walkReluctance: $walkReluctance
    walkBoardCost: $walkBoardCost
    minTransferTime: $minTransferTime
    walkSpeed: $walkSpeed
    allowedTicketTypes: $ticketTypes
    arriveBy: $arriveBy
    transferPenalty: $transferPenalty
    bikeSpeed: $bikeSpeed
    optimize: $optimize
    unpreferred: $unpreferred
  ) @include(if: $showBikeAndParkItineraries) {
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
          type
          shortName
        }
        trip {
          gtfsId
          directionId
          stoptimesForDate {
            scheduledDeparture
          }
          pattern {
            ...RouteLine_pattern
          }
        }
        to {
          bikePark {
            bikeParkId
            name
          }
        }
        distance
      }
    }
  }

  carPlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    numItineraries: 5
    transportModes: [{ mode: CAR }]
    date: $date
    time: $time
    walkReluctance: $walkReluctance
    walkBoardCost: $walkBoardCost
    minTransferTime: $minTransferTime
    walkSpeed: $walkSpeed
    allowedTicketTypes: $ticketTypes
    arriveBy: $arriveBy
    transferPenalty: $transferPenalty
    bikeSpeed: $bikeSpeed
    optimize: $optimize
    unpreferred: $unpreferred
  ) @include(if: $shouldMakeCarQuery) {
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
          type
          shortName
        }
        trip {
          gtfsId
          directionId
          stoptimesForDate {
            scheduledDeparture
          }
          pattern {
            ...RouteLine_pattern
          }
        }
        to {
          bikePark {
            bikeParkId
            name
          }
        }
        distance
      }
    }
  }

  parkRidePlan: plan(
    fromPlace: $fromPlace
    toPlace: $toPlace
    numItineraries: 5
    transportModes: [{ mode: CAR, qualifier: PARK }, { mode: TRANSIT }]
    date: $date
    time: $time
    walkReluctance: $walkReluctance
    walkBoardCost: $walkBoardCost
    minTransferTime: $minTransferTime
    walkSpeed: $walkSpeed
    allowedTicketTypes: $ticketTypes
    arriveBy: $arriveBy
    transferPenalty: $transferPenalty
    bikeSpeed: $bikeSpeed
    optimize: $optimize
    unpreferred: $unpreferred
  ) @include(if: $shouldMakeParkRideQuery) {
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
          type
          shortName
        }
        trip {
          gtfsId
          directionId
          stoptimesForDate {
            scheduledDeparture
          }
          pattern {
            ...RouteLine_pattern
          }
        }
        to {
          carPark {
            carParkId
            name
          }
          name
        }
        distance
      }
    }
  }
}
`;