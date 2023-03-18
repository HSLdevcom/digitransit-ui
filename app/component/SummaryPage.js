/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import moment from 'moment';
import React from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';
import get from 'lodash/get';
import polyline from 'polyline-encoded';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import SunCalc from 'suncalc';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import ItineraryPageMap from './map/ItineraryPageMap';
import SummaryPlanContainer from './SummaryPlanContainer';
import SummaryNavigation from './SummaryNavigation';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import { getWeatherData } from '../util/apiUtils';
import Loading from './Loading';
import { getSummaryPath } from '../util/path';
import { boundWithMinimumArea } from '../util/geo-utils';
import {
  validateServiceTimeRange,
  getStartTimeWithColon,
} from '../util/timeUtils';
import {
  planQuery,
  moreItinerariesQuery,
  clearQueryParams,
} from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import { isIOS } from '../util/browser';
import { itineraryHasCancelation } from '../util/alertUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  parseLatLon,
  otpToLocation,
  getIntermediatePlaces,
} from '../util/otpStrings';
import { SettingsDrawer } from './SettingsDrawer';

import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import ItineraryTab from './ItineraryTab';
import { StreetModeSelector } from './StreetModeSelector';
import SwipeableTabs from './SwipeableTabs';
import {
  getCurrentSettings,
  preparePlanParams,
  getDefaultSettings,
  hasStartAndDestination,
} from '../util/planParamUtil';
import { getTotalBikingDistance } from '../util/legUtils';
import { userHasChangedModes } from '../util/modeUtils';
import CarpoolDrawer from './CarpoolDrawer';
import { MapMode } from '../constants';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { saveSearch } from '../action/SearchActions';
import CustomizeSearch from './CustomizeSearchNew';
import { mapLayerShape } from '../store/MapLayerStore';
import { getMapLayerOptions } from '../util/mapLayerUtils';
import { mapLayerOptionsShape } from '../util/shapes';
import ItineraryShape from '../prop-types/ItineraryShape';
import ErrorShape from '../prop-types/ErrorShape';
import RoutingErrorShape from '../prop-types/RoutingErrorShape';

const POINT_FOCUS_ZOOM = 16; // used when focusing to a point

/**
/**
 * Returns the actively selected itinerary's index. Attempts to look for
 * the information in the location's state and pathname, respectively.
 * Otherwise, pre-selects the first non-cancelled itinerary or, failing that,
 * defaults to the index 0.
 *
 * @param {{ pathname: string, state: * }} location the current location object.
 * @param {*} itineraries the itineraries retrieved from OTP.
 * @param {number} defaultValue the default value, defaults to 0.
 */
export const getActiveIndex = (
  { pathname, state } = {},
  itineraries = [],
  defaultValue = 0,
) => {
  if (state) {
    if (state.summaryPageSelected >= itineraries.length) {
      return defaultValue;
    }
    return state.summaryPageSelected || defaultValue;
  }

  /*
   * If state does not exist, for example when accessing the summary
   * page by an external link, we check if an itinerary selection is
   * supplied in URL and make that the active selection.
   */
  const lastURLSegment = pathname && pathname.split('/').pop();
  if (!Number.isNaN(Number(lastURLSegment))) {
    if (Number(lastURLSegment) >= itineraries.length) {
      return defaultValue;
    }
    return Number(lastURLSegment);
  }

  /**
   * Pre-select the first not-cancelled itinerary, if available.
   */
  const itineraryIndex = findIndex(
    itineraries,
    itinerary => !itineraryHasCancelation(itinerary),
  );
  if (itineraryIndex >= itineraries.length) {
    return defaultValue;
  }
  return itineraryIndex > 0 ? itineraryIndex : defaultValue;
};

export const getHashNumber = hash => {
  if (hash) {
    if (hash === 'walk' || hash === 'bike' || hash === 'car') {
      return 0;
    }
    return Number(hash);
  }
  return undefined;
};

export const routeSelected = (hash, secondHash, itineraries) => {
  if (
    hash === 'bikeAndVehicle' ||
    hash === 'parkAndRide' ||
    hash === 'onDemandTaxi'
  ) {
    if (secondHash && secondHash < itineraries.length) {
      return true;
    }
    return false;
  }
  if (
    (hash && hash < itineraries.length) ||
    hash === 'walk' ||
    hash === 'bike' ||
    hash === 'car'
  ) {
    return true;
  }
  return false;
};

/**
 * Report any errors that happen when showing summary
 *
 * @param {Error|string|any} error
 */
export function reportError(error) {
  if (!error) {
    return;
  }
  addAnalyticsEvent({
    category: 'Itinerary',
    action: 'ErrorLoading',
    name: 'SummaryPage',
    message: error.message || error,
    stack: error.stack || null,
  });
}

const getTopicOptions = (context, planitineraries, match) => {
  const { config } = context;
  const { realTime, feedIds } = config;
  const itineraries =
    planitineraries &&
    planitineraries.every(itinerary => itinerary !== undefined)
      ? planitineraries
      : [];
  const activeIndex =
    getHashNumber(
      match.params.secondHash ? match.params.secondHash : match.params.hash,
    ) || getActiveIndex(match.location, itineraries);
  const itineraryTopics = [];

  if (itineraries.length > 0) {
    const activeItinerary =
      activeIndex < itineraries.length
        ? itineraries[activeIndex]
        : itineraries[0];
    activeItinerary.legs.forEach(leg => {
      if (leg.transitLeg && leg.trip) {
        const feedId = leg.trip.gtfsId?.split(':')[0];
        let topic;
        if (realTime && feedIds.includes(feedId)) {
          if (realTime[feedId] && realTime[feedId].useFuzzyTripMatching) {
            topic = {
              feedId,
              route: leg.route.gtfsId?.split(':')[1],
              mode: leg.mode.toLowerCase(),
              direction: Number(leg.trip.directionId),
              shortName: leg.route.shortName,
              tripStartTime: getStartTimeWithColon(
                leg.trip.stoptimesForDate[0].scheduledDeparture,
              ),
              type: leg.route.type,
            };
          } else if (realTime[feedId]) {
            topic = {
              feedId,
              route: leg.route.gtfsId?.split(':')[1],
              tripId: leg.trip.gtfsId?.split(':')[1],
              type: leg.route.type,
              shortName: leg.route.shortName,
            };
          }
        }
        if (topic) {
          itineraryTopics.push(topic);
        }
      }
    });
  }
  return itineraryTopics;
};

const getBounds = (itineraries, from, to, viaPoints) => {
  // Decode all legs of all itineraries into latlong arrays,
  // and concatenate into one big latlong array
  const bounds = [
    [from.lat, from.lon],
    [to.lat, to.lon],
  ];
  viaPoints.forEach(p => bounds.push([p.lat, p.lon]));
  return boundWithMinimumArea(
    bounds
      .concat(
        ...itineraries.map(itinerary =>
          [].concat(
            ...itinerary.legs.map(leg =>
              polyline.decode(leg.legGeometry.points),
            ),
          ),
        ),
      )
      .filter(a => a[0] && a[1]),
  );
};

/**
 * Compares the current plans itineraries with the itineraries with default settings, if plan with default settings provides different
 * itineraries, return true
 *
 * @param {*} itineraries
 * @param {*} defaultItineraries
 * @returns boolean indicating weather or not the default settings provide a better plan
 */
const compareItineraries = (itineraries, defaultItineraries) => {
  if (!itineraries || !defaultItineraries) {
    return false;
  }
  const legValuesToCompare = ['to', 'from', 'route', 'mode'];
  for (let i = 0; i < itineraries.length; i++) {
    for (let j = 0; j < itineraries[i].legs.length; j++) {
      if (
        !isEqual(
          pick(itineraries?.[i]?.legs?.[j], legValuesToCompare),
          pick(defaultItineraries?.[i]?.legs?.[j], legValuesToCompare),
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

const relevantRoutingSettingsChanged = config => {
  const settingsToCompare = [
    'modes',
    'walkBoardCost',
    'ticketTypes',
    'walkReluctance',
  ];
  const defaultSettingsToCompare = pick(
    getDefaultSettings(config),
    settingsToCompare,
  );
  const currentSettingsToCompare = pick(
    getCurrentSettings(config),
    settingsToCompare,
  );

  return !isEqual(defaultSettingsToCompare, currentSettingsToCompare);
};

const setCurrentTimeToURL = (config, match) => {
  if (config.NODE_ENV !== 'test' && !match.location?.query?.time) {
    const newLocation = {
      ...match.location,
      query: {
        ...match.location.query,
        time: moment().unix(),
      },
    };
    match.router.replace(newLocation);
  }
};

class SummaryPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired, // DT-3358
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    match: matchShape.isRequired,
    viewer: PropTypes.shape({
      plan: PropTypes.shape({
        routingErrors: PropTypes.arrayOf(RoutingErrorShape),
        itineraries: PropTypes.arrayOf(ItineraryShape),
      }),
    }).isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    content: PropTypes.node.isRequired,
    map: PropTypes.shape({
      type: PropTypes.func.isRequired,
    }),
    breakpoint: PropTypes.string.isRequired,
    error: ErrorShape,
    loading: PropTypes.bool,
    relayEnvironment: PropTypes.object.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    mapLayers: mapLayerShape.isRequired,
    mapLayerOptions: mapLayerOptionsShape.isRequired,
    alertRef: PropTypes.string.isRequired,
  };

  static defaultProps = {
    map: undefined,
    error: undefined,
    loading: false,
  };

  constructor(props, context) {
    super(props, context);
    this.isFetching = false;
    this.secondQuerySent = false;
    this.setParamsAndQuery();
    this.originalPlan = this.props.viewer && this.props.viewer.plan;
    this.origin = undefined;
    this.destination = undefined;
    this.expandMap = 0;
    this.allModesQueryDone = false;

    if (props.error) {
      reportError(props.error);
    }
    this.tabHeaderRef = React.createRef(null);
    this.headerRef = React.createRef();
    this.contentRef = React.createRef();

    // DT-4161: Threshold to determine should vehicles be shown if search is made in the future
    this.show_vehicles_threshold_minutes = 720;

    setCurrentTimeToURL(context.config, props.match);

    this.state = {
      weatherData: {},
      loading: false,
      settingsOpen: false,
      carpoolOpen: false,
      alternativePlan: undefined,
      earlierItineraries: [],
      laterItineraries: [],
      previouslySelectedPlan: this.props.viewer && this.props.viewer.plan,
      separatorPosition: undefined,
      walkPlan: undefined,
      bikePlan: undefined,
      bikeAndPublicPlan: undefined,
      bikeRentAndPublicPlan: undefined,
      bikeParkPlan: undefined,
      carPlan: undefined,
      parkRidePlan: undefined,
      loadingMoreItineraries: undefined,
      itineraryTopics: undefined,
      isFetchingWalkAndBike: hasStartAndDestination(props.match.params),
      settingsChangedRecently: false,
    };
    // We mutate this.selectedPlan in render() too. Why?
    // fixme: merge the two places
    if (this.props.match.params.hash === 'walk') {
      this.selectedPlan = this.state.walkPlan;
    } else if (this.props.match.params.hash === 'bike') {
      this.selectedPlan = this.state.bikePlan;
    } else if (this.props.match.params.hash === 'bikeAndVehicle') {
      this.selectedPlan = {
        itineraries: [
          ...(this.state.bikeParkPlan?.itineraries || []),
          ...(this.state.bikeAndPublicPlan?.itineraries || []),
          ...(this.state.bikeRentAndPublicPlan?.itineraries || []),
        ],
      };
    } else if (this.state.streetMode === 'car') {
      this.selectedPlan = this.state.carPlan;
    } else if (this.state.streetMode === 'parkAndRide') {
      this.selectedPlan = this.state.parkRidePlan;
    } else {
      this.selectedPlan = this.props.viewer && this.props.viewer.plan;
    }
    /* A query with all modes is made on page load if relevant settings ('modes', 'walkBoardCost', 'ticketTypes', 'walkReluctance') differ from defaults. The all modes query uses default settings. */
    if (
      relevantRoutingSettingsChanged(context.config) &&
      hasStartAndDestination(context.match.params)
    ) {
      this.makeQueryWithAllModes();
    }
  }

  shouldShowSettingsChangedNotification = (plan, alternativePlan) => {
    if (
      relevantRoutingSettingsChanged(this.context.config) &&
      !this.state.settingsChangedRecently &&
      !this.planHasNoItineraries() &&
      compareItineraries(plan?.itineraries, alternativePlan?.itineraries)
    ) {
      return true;
    }
    return false;
  };

  toggleStreetMode = newStreetMode => {
    const newState = {
      ...this.context.match.location,
      state: { summaryPageSelected: 0 },
    };
    const basePath = getSummaryPath(
      this.context.match.params.from,
      this.context.match.params.to,
    );
    const indexPath = `${getSummaryPath(
      this.context.match.params.from,
      this.context.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    if (newStreetMode.includes('bike')) {
      newState.query.mapMode = MapMode.Bicycle;
    } else if (this.context.match.location.query.mapMode === MapMode.Bicycle) {
      newState.query.mapMode = MapMode.Default;
    }
    this.context.router.push(newState);
  };

  setStreetModeAndSelect = newStreetMode => {
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'OpenItineraryDetailsWithMode',
      name: newStreetMode,
    });
    this.selectFirstItinerary(newStreetMode);
  };

  selectFirstItinerary = newStreetMode => {
    const newState = {
      ...this.context.match.location,
      state: { summaryPageSelected: 0 },
    };

    const basePath = `${getSummaryPath(
      this.context.match.params.from,
      this.context.match.params.to,
    )}`;
    const indexPath = `${getSummaryPath(
      this.context.match.params.from,
      this.context.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    if (newStreetMode.includes('bike')) {
      newState.query.mapMode = MapMode.Bicycle;
    } else if (this.context.match.location.query.mapMode === MapMode.Bicycle) {
      newState.query.mapMode = MapMode.Default;
    }
    this.context.router.push(newState);
  };

  hasItinerariesContainingPublicTransit = plan => {
    if (
      plan &&
      Array.isArray(plan.itineraries) &&
      plan.itineraries.length > 0
    ) {
      // TODO why only check the first? why does the function's name imply sth else?
      if (plan.itineraries.length === 1) {
        // check that only itinerary contains public transit
        return (
          plan.itineraries[0].legs.filter(
            obj =>
              obj.mode !== 'WALK' &&
              obj.mode !== 'BICYCLE' &&
              obj.mode !== 'CAR',
          ).length > 0
        );
      }
      return true;
    }
    return false;
  };

  planHasNoItineraries = () =>
    this.props.viewer &&
    this.props.viewer.plan &&
    this.props.viewer.plan.itineraries &&
    this.props.viewer.plan.itineraries.filter(
      itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
    ).length === 0;

  findLongestDuration = itineraries => {
    return Math.max(...itineraries?.map(o => o.duration));
  };

  findShortestDuration = itineraries => {
    return Math.min(...itineraries?.map(o => o.duration));
  };

  findLongestPublicItinerary = () => {
    if (
      this.props.viewer &&
      this.props.viewer.plan &&
      this.props.viewer.plan.itineraries
    ) {
      return this.findLongestDuration(this.props.viewer.plan.itineraries);
    }
    return 0;
  };

  planHasNoStreetModeItineraries = () =>
    (!this.state.bikePlan?.itineraries ||
      this.state.bikePlan.itineraries.length === 0) &&
    (!this.state.carPlan?.itineraries ||
      this.state.carPlan.itineraries.length === 0) &&
    (!this.state.parkRidePlan?.itineraries ||
      this.state.parkRidePlan.itineraries.length === 0) &&
    (!this.state.bikeParkPlan?.itineraries ||
      this.state.bikeParkPlan.itineraries.length === 0) &&
    (this.context.config.includePublicWithBikePlan
      ? !this.state.bikeAndPublicPlan?.itineraries ||
        this.state.bikeAndPublicPlan.itineraries.length === 0
      : true);

  configClient = itineraryTopics => {
    const { config } = this.context;
    const { realTime } = config;
    const feedIds = Array.from(
      new Set(itineraryTopics.map(topic => topic.feedId)),
    );
    let feedId;
    /* handle multiple feedid case */
    feedIds.forEach(fId => {
      if (!feedId && realTime[fId]) {
        feedId = fId;
      }
    });
    const source = feedId && realTime[feedId];
    if (source && source.active) {
      return {
        ...source,
        agency: feedId,
        options: itineraryTopics.length > 0 ? itineraryTopics : null,
      };
    }
    return null;
  };

  startClient = itineraryTopics => {
    if (itineraryTopics && !isEmpty(itineraryTopics)) {
      const clientConfig = this.configClient(itineraryTopics);
      this.context.executeAction(startRealTimeClient, clientConfig);
    }
  };

  updateClient = itineraryTopics => {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );

    if (isEmpty(itineraryTopics) && client) {
      this.stopClient();
      return;
    }
    if (client) {
      const clientConfig = this.configClient(itineraryTopics);
      if (clientConfig) {
        this.context.executeAction(changeRealTimeClientTopics, {
          ...clientConfig,
          client,
          oldTopics: topics,
        });
        return;
      }
      this.stopClient();
    }
    this.startClient(itineraryTopics);
  };

  stopClient = () => {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client && this.state.itineraryTopics) {
      this.context.executeAction(stopRealTimeClient, client);
      this.setState({ itineraryTopics: undefined });
    }
  };

  paramsOrQueryHaveChanged = () => {
    return (
      !isEqual(this.params, this.context.match.params) ||
      !isEqual(this.query, this.context.match.location.query)
    );
  };

  setParamsAndQuery = () => {
    this.params = this.context.match.params;
    this.query = this.context.match.location.query;
  };

  resetSummaryPageSelection = () => {
    this.context.router.replace({
      ...this.context.match.location,
      state: {
        ...this.context.match.location.state,
        summaryPageSelected: undefined,
      },
    });
  };

  makeWalkAndBikeQueries = () => {
    const query = graphql`
      query SummaryPage_WalkBike_Query(
        $fromPlace: String!
        $toPlace: String!
        $intermediatePlaces: [InputCoordinates!]
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
        $triangle: InputTriangle
        $itineraryFiltering: Float
        $unpreferred: InputUnpreferred
        $locale: String
        $shouldMakeWalkQuery: Boolean!
        $shouldMakeBikeQuery: Boolean!
        $shouldMakeCarQuery: Boolean!
        $shouldMakeParkRideQuery: Boolean!
        $shouldMakeOnDemandTaxiQuery: Boolean!
        # TODO harmonize names shouldMakeXYZQuery vs showXYZItineraries
        $showBikeAndPublicItineraries: Boolean!
        $showBikeRentAndPublicItineraries: Boolean!
        $showBikeAndParkItineraries: Boolean!
        $bikeAndPublicModes: [TransportMode!]
        $bikeRentAndPublicModes: [TransportMode!]
        $onDemandTaxiModes: [TransportMode!]
        $bikeParkModes: [TransportMode!]
        $carParkModes: [TransportMode!]
        $parkRideModes: [TransportMode!]
        # TODO still to be implemented in upstream OTP
        # $bannedVehicleParkingTags: [String]
        # $bannedBicycleParkingTags: [String]
        # $preferredBicycleParkingTags: [String]
        # $unpreferredBicycleParkingTagPenalty: Float
        # $useVehicleParkingAvailabilityInformation: Boolean
        $allowedVehicleRentalNetworks: [String]
      ) {
        walkPlan: plan(
          fromPlace: $fromPlace
          toPlace: $toPlace
          intermediatePlaces: $intermediatePlaces
          transportModes: [{ mode: WALK }]
          date: $date
          time: $time
          walkSpeed: $walkSpeed
          wheelchair: $wheelchair
          arriveBy: $arriveBy
          locale: $locale
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
          intermediatePlaces: $intermediatePlaces
          transportModes: [{ mode: BICYCLE }]
          date: $date
          time: $time
          walkSpeed: $walkSpeed
          arriveBy: $arriveBy
          bikeSpeed: $bikeSpeed
          optimize: $optimize
          triangle: $triangle
          locale: $locale
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
          intermediatePlaces: $intermediatePlaces
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
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

        bikeRentAndPublicPlan: plan(
          fromPlace: $fromPlace
          toPlace: $toPlace
          intermediatePlaces: $intermediatePlaces
          numItineraries: 6
          transportModes: $bikeRentAndPublicModes
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
          locale: $locale
        ) @include(if: $showBikeRentAndPublicItineraries) {
          # todo: does this match the expected data of bike (rent) + public itineraries
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
              rentedBike
              startTime
              endTime
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
                }
                pattern {
                  ...RouteLine_pattern
                }
              }
              distance
            }
          }
        }

        onDemandTaxiPlan: plan(
          fromPlace: $fromPlace
          toPlace: $toPlace
          intermediatePlaces: $intermediatePlaces
          numItineraries: 6
          transportModes: $onDemandTaxiModes
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
          searchWindow: 10800
        ) @include(if: $shouldMakeOnDemandTaxiQuery) {
          ...SummaryPlanContainer_plan
          ...ItineraryTab_plan
          itineraries {
            ...ItinerarySummaryListContainer_itineraries
            duration
            startTime
            endTime
            ...ItineraryTab_itinerary
            ...SummaryPlanContainer_itineraries
            legs {
              mode
              ...ItineraryLine_legs
              transitLeg
              rentedBike
              distance
              startTime
              endTime
              route {
                url
                mode
                shortName
              }
              legGeometry {
                points
              }
              trip {
                gtfsId
                tripShortName
              }
            }
          }
        }

        bikeParkPlan: plan(
          fromPlace: $fromPlace
          toPlace: $toPlace
          intermediatePlaces: $intermediatePlaces
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
        )
        # TODO still be added in upstream OTP
        # bannedVehicleParkingTags: $bannedBicycleParkingTags
        # preferredVehicleParkingTags: $preferredBicycleParkingTags
        # unpreferredVehicleParkingTagPenalty: $unpreferredBicycleParkingTagPenalty
        @include(if: $showBikeAndParkItineraries) {
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
          intermediatePlaces: $intermediatePlaces
          numItineraries: 5
          transportModes: $carParkModes
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
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
              startTime
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
              from {
                name
                lat
                lon
              }
              to {
                name
                lat
                lon
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
          intermediatePlaces: $intermediatePlaces
          numItineraries: 5
          transportModes: $parkRideModes
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
        )
        # TODO add to upstream OTP
        # useVehicleParkingAvailabilityInformation: $useVehicleParkingAvailabilityInformation
        # bannedVehicleParkingTags: $bannedVehicleParkingTags
        @include(if: $shouldMakeParkRideQuery) {
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
              startTime
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
                lat
                lon
              }
              from {
                name
                lat
                lon
              }
              distance
            }
          }
        }
      }
    `;

    const planParams = preparePlanParams(this.context.config, false)(
      this.context.match.params,
      this.context.match,
    );

    fetchQuery(this.props.relayEnvironment, query, planParams)
      .then(result => {
        this.setState(
          {
            isFetchingWalkAndBike: false,
            walkPlan: result.walkPlan,
            bikePlan: result.bikePlan,
            bikeAndPublicPlan: result.bikeAndPublicPlan,
            bikeRentAndPublicPlan: result.bikeRentAndPublicPlan,
            bikeParkPlan: result.bikeParkPlan,
            carPlan: result.carPlan,
            parkRidePlan: result.parkRidePlan,
            onDemandTaxiPlan: result.onDemandTaxiPlan,
          },
          () => {
            this.makeWeatherQuery();
          },
        );
        // Remove bikeAndPublicPlan and bikeParkPlan itineraries if all public transport itineraries would last less.
        if (
          this.findLongestPublicItinerary() <
          this.findShortestDuration(this.state.bikeAndPublicPlan?.itineraries)
        ) {
          this.setState({
            bikeAndPublicPlan: undefined,
          });
        }
        if (
          this.findLongestPublicItinerary() <
          this.findShortestDuration(this.state.bikeParkPlan?.itineraries)
        ) {
          this.setState({
            bikeParkPlan: undefined,
          });
        }
      })
      .catch(() => {
        this.setState({ isFetchingWalkAndBike: false });
      });
  };

  makeQueryWithAllModes = () => {
    this.setLoading(true);

    this.resetSummaryPageSelection();

    const query = graphql`
      query SummaryPage_Query(
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
        # TODO bicycle params are not necessary here, are they?
        $bikeSpeed: Float
        $optimize: OptimizeType
        $itineraryFiltering: Float
        $unpreferred: InputUnpreferred
        $allowedVehicleRentalNetworks: [String]
        $locale: String
      ) {
        plan: plan(
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
          # The bbnavi OTP deployments don't have this feature yet.
          # todo: merge upstream OTP code, deploy, re-enable the code here
          # routingErrors {
          #   code
          #   inputField
          # }
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

    const planParams = preparePlanParams(this.context.config, true)(
      this.context.match.params,
      this.context.match,
    );
    fetchQuery(this.props.relayEnvironment, query, planParams, {
      force: true,
    }).then(({ plan: results }) => {
      this.setState(
        {
          alternativePlan: results,
          earlierItineraries: [],
          laterItineraries: [],
          separatorPosition: undefined,
        },
        () => {
          this.setLoading(false);
          this.isFetching = false;
          this.setParamsAndQuery();
          this.allModesQueryDone = true;
        },
      );
    });
  };

  onLater = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });
    this.setState({ loadingMoreItineraries: reversed ? 'top' : 'bottom' });
    this.showScreenreaderLoadingAlert();

    const end = moment.unix(this.props.serviceTimeRange.end);
    const latestDepartureTime = itineraries.reduce((previous, current) => {
      const startTime = moment(current.startTime);

      if (previous == null) {
        return startTime;
      }
      if (startTime.isAfter(previous)) {
        return startTime;
      }
      return previous;
    }, null);

    latestDepartureTime.add(1, 'minutes');

    if (latestDepartureTime >= end) {
      // Departure time is going beyond available time range
      this.setError('no-route-end-date-not-in-range');
      this.setLoading(false);
      return;
    }

    const useDefaultModes =
      this.planHasNoItineraries() && this.state.alternativePlan;

    const params = preparePlanParams(this.context.config, useDefaultModes)(
      this.context.match.params,
      this.context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: false,
      date: latestDepartureTime.format('YYYY-MM-DD'),
      time: latestDepartureTime.format('HH:mm'),
    };

    this.setModeToParkRideIfSelected(tunedParams);

    fetchQuery(
      this.props.relayEnvironment,
      moreItinerariesQuery,
      tunedParams,
    ).then(({ plan: result }) => {
      this.showScreenreaderLoadedAlert();
      if (reversed) {
        const reversedItineraries = result.itineraries
          .slice() // Need to copy because result is readonly
          .reverse()
          .filter(
            itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
          );
        // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
        this.setState(prevState => {
          return {
            earlierItineraries: [
              ...reversedItineraries,
              ...prevState.earlierItineraries,
            ],
            loadingMoreItineraries: undefined,
            separatorPosition: prevState.separatorPosition
              ? prevState.separatorPosition + reversedItineraries.length
              : reversedItineraries.length,
          };
        });
        this.resetSummaryPageSelection();
      } else {
        this.setState(prevState => {
          return {
            laterItineraries: [
              ...prevState.laterItineraries,
              ...result.itineraries,
            ],
            loadingMoreItineraries: undefined,
          };
        });
      }
      /*
          const max = result.itineraries.reduce(
            (previous, { endTime }) =>
              endTime > previous ? endTime : previous,
            Number.MIN_VALUE,
          );

          // OTP can't always find later routes. This leads to a situation where
          // new search is done without increasing time, and nothing seems to happen
          let newTime;
          if (this.props.plan.date >= max) {
            newTime = moment(this.props.plan.date).add(5, 'minutes');
          } else {
            newTime = moment(max).add(1, 'minutes');
          }
          */
      // this.props.setLoading(false);
      /* replaceQueryParams(this.context.router, this.context.match, {
            time: newTime.unix(),
          }); */
    });
    // }
  };

  onEarlier = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowEarlierItineraries',
      name: null,
    });
    this.setState({ loadingMoreItineraries: reversed ? 'bottom' : 'top' });
    this.showScreenreaderLoadingAlert();

    const start = moment.unix(this.props.serviceTimeRange.start);
    const earliestArrivalTime = itineraries.reduce((previous, current) => {
      const endTime = moment(current.endTime);
      if (previous == null) {
        return endTime;
      }
      if (endTime.isBefore(previous)) {
        return endTime;
      }
      return previous;
    }, null);

    earliestArrivalTime.subtract(1, 'minutes');
    if (earliestArrivalTime <= start) {
      this.setError('no-route-start-date-too-early');
      this.setLoading(false);
      return;
    }

    const useDefaultModes =
      this.planHasNoItineraries() && this.state.alternativePlan;

    const params = preparePlanParams(this.context.config, useDefaultModes)(
      this.context.match.params,
      this.context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: true,
      date: earliestArrivalTime.format('YYYY-MM-DD'),
      time: earliestArrivalTime.format('HH:mm'),
    };

    this.setModeToParkRideIfSelected(tunedParams);

    fetchQuery(
      this.props.relayEnvironment,
      moreItinerariesQuery,
      tunedParams,
    ).then(({ plan: result }) => {
      if (result.itineraries.length === 0) {
        // Could not find routes arriving at original departure time
        // --> cannot calculate earlier start time
        this.setError('no-route-start-date-too-early');
      }
      this.showScreenreaderLoadedAlert();
      if (reversed) {
        this.setState(prevState => {
          return {
            laterItineraries: [
              ...prevState.laterItineraries,
              ...result.itineraries,
            ],
            loadingMoreItineraries: undefined,
          };
        });
      } else {
        // Reverse the results so that route suggestions are in ascending order
        const reversedItineraries = result.itineraries
          .slice() // Need to copy because result is readonly
          .reverse()
          .filter(
            itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
          );
        // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
        this.setState(prevState => {
          return {
            earlierItineraries: [
              ...reversedItineraries,
              ...prevState.earlierItineraries,
            ],
            loadingMoreItineraries: undefined,
            separatorPosition: prevState.separatorPosition
              ? prevState.separatorPosition + reversedItineraries.length
              : reversedItineraries.length,
          };
        });

        this.resetSummaryPageSelection();
      }
    });
  };

  // save url-defined location to old searches
  saveUrlSearch = endpoint => {
    const parts = endpoint.split('::'); // label::lat,lon
    if (parts.length !== 2) {
      return;
    }
    const label = parts[0];
    const ll = parseLatLon(parts[1]);
    const names = label.split(','); // addr or name, city
    if (names.length < 2 || Number.isNaN(ll.lat) || Number.isNaN(ll.lon)) {
      return;
    }
    const layer =
      /\d/.test(names[0]) && names[0].indexOf(' ') >= 0 ? 'address' : 'venue';

    this.context.executeAction(saveSearch, {
      item: {
        geometry: { coordinates: [ll.lon, ll.lat] },
        properties: {
          name: names[0],
          id: label,
          gid: label,
          layer,
          label,
          localadmin: names[names.length - 1],
        },
        type: 'Feature',
      },
      type: 'endpoint',
    });
  };

  updateLocalStorage = saveEndpoints => {
    const { location } = this.props.match;
    const { query } = location;
    const pathArray = decodeURIComponent(location.pathname)
      .substring(1)
      .split('/');
    // endpoints to oldSearches store
    if (saveEndpoints && isIOS && query.save) {
      if (query.save === '1' || query.save === '2') {
        this.saveUrlSearch(pathArray[1]); // origin
      }
      if (query.save === '1' || query.save === '3') {
        this.saveUrlSearch(pathArray[2]); // destination
      }
      const newLocation = { ...location };
      delete newLocation.query.save;
      this.context.router.replace(newLocation);
    }
    // update future routes, too
    const originArray = pathArray[1].split('::');
    const destinationArray = pathArray[2].split('::');
    // make sure endpoints are valid locations and time is defined
    if (!query.time || originArray.length < 2 || destinationArray.length < 2) {
      return;
    }
    const itinerarySearch = {
      origin: {
        address: originArray[0],
        ...parseLatLon(originArray[1]),
      },
      destination: {
        address: destinationArray[0],
        ...parseLatLon(destinationArray[1]),
      },
      query,
    };
    this.context.executeAction(saveFutureRoute, itinerarySearch);
  };

  setModeToParkRideIfSelected(tunedParams) {
    if (this.props.match.params.hash === 'parkAndRide') {
      // eslint-disable-next-line no-param-reassign
      tunedParams.modes = [
        { mode: 'CAR', qualifier: 'PARK' },
        { mode: 'TRANSIT' },
      ];
    }
  }

  componentDidMount() {
    this.updateLocalStorage(true);
    const host =
      this.context.headers &&
      (this.context.headers['x-forwarded-host'] || this.context.headers.host);

    if (
      get(this.context, 'config.showHSLTracking', false) &&
      host &&
      host.indexOf('127.0.0.1') === -1 &&
      host.indexOf('localhost') === -1
    ) {
      // eslint-disable-next-line no-unused-expressions
      import('../util/feedbackly');
    }
    if (this.showVehicles()) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      // If user comes from eg. RoutePage, old client may not have been completely shut down yet.
      // This will prevent situation where RoutePages vehicles would appear on SummaryPage
      if (!client) {
        const combinedItineraries = this.getCombinedItineraries();
        const itineraryTopics = getTopicOptions(
          this.context,
          combinedItineraries,
          this.props.match,
        );
        this.startClient(itineraryTopics);
        this.setState({ itineraryTopics });
      }
    }
  }

  componentWillUnmount() {
    if (this.showVehicles()) {
      this.stopClient();
    }
  }

  componentDidUpdate(prevProps) {
    setCurrentTimeToURL(this.context.config, this.props.match);
    // screen reader alert when new itineraries are fetched
    if (
      this.props.match.params.hash === undefined &&
      this.props.viewer &&
      this.props.viewer.plan &&
      this.props.viewer.plan.itineraries &&
      !this.secondQuerySent
    ) {
      this.showScreenreaderLoadedAlert();
    }

    const viaPoints = getIntermediatePlaces(this.props.match.location.query);
    if (
      this.props.match.params.hash &&
      (this.props.match.params.hash === 'walk' ||
        this.props.match.params.hash === 'bike' ||
        this.props.match.params.hash === 'bikeAndVehicle' ||
        this.props.match.params.hash === 'car' ||
        this.props.match.params.hash === 'parkAndRide')
    ) {
      // Reset streetmode selection if intermediate places change
      if (
        !isEqual(
          getIntermediatePlaces(prevProps.match.location.query),
          viaPoints,
        )
      ) {
        const newState = {
          ...this.context.match.location,
        };
        const indexPath = `${getSummaryPath(
          this.context.match.params.from,
          this.context.match.params.to,
        )}`;
        newState.pathname = indexPath;
        this.context.router.push(newState);
      }
    }
    if (
      this.props.match.location.pathname !==
        prevProps.match.location.pathname ||
      this.props.match.location.query !== prevProps.match.location.query
    ) {
      this.updateLocalStorage(false);
    }

    // Reset walk and bike suggestions when new search is made
    if (
      this.selectedPlan !== this.state.alternativePlan &&
      !isEqual(
        this.props.viewer && this.props.viewer.plan,
        this.originalPlan,
      ) &&
      this.paramsOrQueryHaveChanged() &&
      this.secondQuerySent &&
      !this.state.isFetchingWalkAndBike
    ) {
      // Reset mapMode
      if (this.context.match.location.query.mapMode === MapMode.Bicycle) {
        clearQueryParams(this.context.router, this.context.match, ['mapMode']);
      }

      this.setParamsAndQuery();
      this.secondQuerySent = false;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          isFetchingWalkAndBike: true,
          walkPlan: undefined,
          bikePlan: undefined,
          bikeAndPublicPlan: undefined,
          bikeParkPlan: undefined,
          carPlan: undefined,
          parkRidePlan: undefined,
          onDemandTaxiPlan: undefined,
          earlierItineraries: [],
          laterItineraries: [],
          weatherData: {},
          separatorPosition: undefined,
          alternativePlan: undefined,
        },
        () => {
          const hasNonWalkingItinerary = this.selectedPlan?.itineraries?.some(
            itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
          );
          if (
            relevantRoutingSettingsChanged(this.context.config) &&
            hasStartAndDestination(this.context.match.params) &&
            hasNonWalkingItinerary
          ) {
            this.makeQueryWithAllModes();
          }
        },
      );
    }

    // Public transit routes fetched, now fetch walk and bike itineraries
    if (
      this.props.viewer &&
      this.props.viewer.plan &&
      this.props.viewer.plan.itineraries &&
      !this.secondQuerySent
    ) {
      this.originalPlan = this.props.viewer.plan;
      this.secondQuerySent = true;
      if (
        !isEqual(
          otpToLocation(this.context.match.params.from),
          otpToLocation(this.context.match.params.to),
        ) ||
        viaPoints.length > 0
      ) {
        this.makeWalkAndBikeQueries();
      } else {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ isFetchingWalkAndBike: false });
      }
    }

    if (this.props.error) {
      reportError(this.props.error);
    }
    if (this.showVehicles()) {
      let combinedItineraries = this.getCombinedItineraries();
      if (
        combinedItineraries.length > 0 &&
        this.props.match.params.hash !== 'walk' &&
        this.props.match.params.hash !== 'bikeAndVehicle'
      ) {
        combinedItineraries = combinedItineraries.filter(
          itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
        ); // exclude itineraries that have only walking legs from the summary
      }
      const itineraryTopics = getTopicOptions(
        this.context,
        combinedItineraries,
        this.props.match,
      );
      const { client } = this.context.getStore('RealTimeInformationStore');
      // Client may not be initialized yet if there was an client before ComponentDidMount
      if (!isEqual(itineraryTopics, this.state.itineraryTopics) || !client) {
        this.updateClient(itineraryTopics);
      }
      if (!isEqual(itineraryTopics, this.state.itineraryTopics)) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ itineraryTopics });
      }
    }
  }

  setLoading = loading => {
    this.setState({ loading });
  };

  setError = error => {
    reportError(error);
    this.setState({ error });
  };

  setMWTRef = ref => {
    this.mwtRef = ref;
  };

  // make the map to obey external navigation
  navigateMap = () => {
    // map sticks to user location if tracking is on, so set it off
    if (this.mwtRef?.disableMapTracking) {
      this.mwtRef.disableMapTracking();
    }
    // map will not react to location props unless they change or update is forced
    if (this.mwtRef?.forceRefresh) {
      this.mwtRef.forceRefresh();
    }
  };

  focusToPoint = (lat, lon) => {
    if (this.props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.expandMap += 1;
    }
    this.navigateMap();
    this.setState({ center: { lat, lon }, bounds: null });
  };

  focusToLeg = leg => {
    if (this.props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.expandMap += 1;
    }
    this.navigateMap();
    const bounds = boundWithMinimumArea(
      []
        .concat(
          [
            [leg.from.lat, leg.from.lon],
            [leg.to.lat, leg.to.lon],
          ],
          polyline.decode(leg.legGeometry.points),
        )
        .filter(a => a[0] && a[1]),
    );
    this.setState({
      bounds,
      center: undefined,
    });
  };

  // These are icons that contains sun
  dayNightIconIds = [1, 2, 21, 22, 23, 41, 42, 43, 61, 62, 71, 72, 73];

  checkDayNight = (iconId, timem, lat, lon) => {
    const date = timem.toDate();
    const dateMillis = date.getTime();
    const sunCalcTimes = SunCalc.getTimes(date, lat, lon);
    const sunrise = sunCalcTimes.sunrise.getTime();
    const sunset = sunCalcTimes.sunset.getTime();
    if (
      (sunrise > dateMillis || sunset < dateMillis) &&
      this.dayNightIconIds.includes(iconId)
    ) {
      // Night icon = iconId + 100
      return iconId + 100;
    }
    return iconId;
  };

  filterOnlyBikeAndWalk = itineraries => {
    if (Array.isArray(itineraries)) {
      return itineraries.filter(
        itinerary =>
          !itinerary.legs.every(
            leg => leg.mode === 'WALK' || leg.mode === 'BICYCLE',
          ),
      );
    }
    return itineraries;
  };

  // leave out each itinerary that *only* contains walk and/or bicycle legs
  filteredbikeAndPublic = plan => {
    return {
      // todo: actually, should we filter by `it.legs.some(leg => leg.transitLeg)`?
      itineraries: this.filterOnlyBikeAndWalk(plan?.itineraries) || [],
    };
  };

  // Keep each itinerary that
  // - contains >0 bicycle rent legs, *and*
  // - contains >0 transit legs.
  filteredBikeRentAndPublic = plan => {
    return {
      itineraries: (plan?.itineraries || [])
        .filter(it =>
          it.legs.some(
            leg => leg.mode === 'BICYCLE' && leg.rentedBike === true,
          ),
        )
        .filter(it => it.legs.some(leg => leg.transitLeg === true)),
    };
  };

  makeWeatherQuery() {
    const from = otpToLocation(this.props.match.params.from);
    const { walkPlan, bikePlan } = this.state;
    const bikeParkPlan = this.filteredbikeAndPublic(this.state.bikeParkPlan);
    const bikeAndPublicPlan = this.filteredbikeAndPublic(
      this.state.bikeAndPublicPlan,
    );
    const itin =
      (walkPlan && walkPlan.itineraries && walkPlan.itineraries[0]) ||
      (bikePlan && bikePlan.itineraries && bikePlan.itineraries[0]) ||
      (bikeAndPublicPlan &&
        bikeAndPublicPlan.itineraries &&
        bikeAndPublicPlan.itineraries[0]) ||
      (bikeParkPlan && bikeParkPlan.itineraries && bikeParkPlan.itineraries[0]);

    if (itin && this.context.config.showWeatherInformation) {
      const time = itin.startTime;
      const weatherHash = `${time}_${from.lat}_${from.lon}`;
      if (
        weatherHash !== this.state.weatherData.weatherHash &&
        weatherHash !== this.pendingWeatherHash
      ) {
        this.pendingWeatherHash = weatherHash;
        const timem = moment(time);
        this.setState({ isFetchingWeather: true });
        getWeatherData(
          this.context.config.URL.WEATHER_DATA,
          timem,
          from.lat,
          from.lon,
        )
          .then(res => {
            if (weatherHash === this.pendingWeatherHash) {
              // no cascading fetches
              this.pendingWeatherHash = undefined;
              let weatherData = {};
              if (Array.isArray(res) && res.length === 3) {
                weatherData = {
                  temperature: res[0].ParameterValue,
                  windSpeed: res[1].ParameterValue,
                  weatherHash,
                  time,
                  // Icon id's and descriptions: https://www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje ->  Sääsymbolien selitykset ennusteissa.
                  iconId: this.checkDayNight(
                    res[2].ParameterValue,
                    timem,
                    from.lat,
                    from.lon,
                  ),
                };
              }
              this.setState({ isFetchingWeather: false, weatherData });
            }
          })
          .catch(err => {
            this.pendingWeatherHash = undefined;
            this.setState({ isFetchingWeather: false, weatherData: { err } });
          })
          .finally(() => {
            if (this.props.alertRef.current) {
              this.props.alertRef.current.innerHTML = this.context.intl.formatMessage(
                {
                  id: 'itinerary-summary-page-street-mode.update-alert',
                  defaultMessage: 'Walking and biking results updated',
                },
              );
              setTimeout(() => {
                this.props.alertRef.current.innerHTML = null;
              }, 100);
            }
          });
      }
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      !isEqual(this.props.match.params.hash, nextProps.match.params.hash) ||
      !isEqual(
        this.props.match.params.secondHash,
        nextProps.match.params.secondHash,
      )
    ) {
      this.navigateMap();

      this.setState({
        center: undefined,
        bounds: undefined,
      });
    }
  }

  showScreenreaderLoadedAlert() {
    if (this.props.alertRef.current) {
      if (this.props.alertRef.current.innerHTML) {
        this.props.alertRef.current.innerHTML = null;
      }
      this.props.alertRef.current.innerHTML = this.context.intl.formatMessage({
        id: 'itinerary-page.itineraries-loaded',
        defaultMessage: 'More itineraries loaded',
      });
      setTimeout(() => {
        this.props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  showScreenreaderUpdatedAlert() {
    if (this.props.alertRef.current) {
      if (this.props.alertRef.current.innerHTML) {
        this.props.alertRef.current.innerHTML = null;
      }
      this.props.alertRef.current.innerHTML = this.context.intl.formatMessage({
        id: 'itinerary-page.itineraries-updated',
        defaultMessage: 'search results updated',
      });
      setTimeout(() => {
        this.props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  showScreenreaderLoadingAlert() {
    if (this.props.alertRef.current && !this.props.alertRef.current.innerHTML) {
      this.props.alertRef.current.innerHTML = this.context.intl.formatMessage({
        id: 'itinerary-page.loading-itineraries',
        defaultMessage: 'Loading for more itineraries',
      });
      setTimeout(() => {
        this.props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  changeHash = index => {
    const isbikeAndVehicle = this.props.match.params.hash === 'bikeAndVehicle';
    const isParkAndRide = this.props.match.params.hash === 'parkAndRide';

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });

    const newState = {
      ...this.context.match.location,
      state: { summaryPageSelected: index },
    };
    const indexPath = `${getSummaryPath(
      this.props.match.params.from,
      this.props.match.params.to,
    )}${isbikeAndVehicle ? '/bikeAndVehicle' : ''}${
      isParkAndRide ? '/parkAndRide' : ''
    }/${index}`;

    newState.pathname = indexPath;
    this.context.router.replace(newState);
  };

  renderMap(from, to, viaPoints) {
    const { match, breakpoint } = this.props;
    const combinedItineraries = this.getCombinedItineraries();
    // summary or detail view ?
    const detailView = routeSelected(
      match.params.hash,
      match.params.secondHash,
      combinedItineraries,
    );

    if (!detailView && breakpoint !== 'large') {
      // no map on mobile summary view
      return null;
    }
    let filteredItineraries = combinedItineraries.filter(
      itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
    );
    if (!filteredItineraries.length) {
      filteredItineraries = combinedItineraries;
    }

    const activeIndex =
      getHashNumber(
        match.params.secondHash ? match.params.secondHash : match.params.hash,
      ) || getActiveIndex(match.location, filteredItineraries);

    const mwtProps = {};
    if (this.state.bounds) {
      mwtProps.bounds = this.state.bounds;
    } else if (this.state.center) {
      mwtProps.lat = this.state.center.lat;
      mwtProps.lon = this.state.center.lon;
    } else {
      mwtProps.bounds = getBounds(filteredItineraries, from, to, viaPoints);
    }
    const onlyHasWalkingItineraries = this.onlyHasWalkingItineraries();

    return (
      <ItineraryPageMap
        {...mwtProps}
        from={from}
        to={to}
        viaPoints={viaPoints}
        zoom={POINT_FOCUS_ZOOM}
        mapLayers={this.props.mapLayers}
        mapLayerOptions={this.props.mapLayerOptions}
        setMWTRef={this.setMWTRef}
        breakpoint={breakpoint}
        itineraries={filteredItineraries}
        activeIndex={activeIndex}
        topics={this.state.itineraryTopics}
        showActive={detailView}
        showVehicles={this.showVehicles()}
        onlyHasWalkingItineraries={onlyHasWalkingItineraries}
      />
    );
  }

  toggleCarpoolDrawer = () => {
    const { carpoolOpen } = this.state;
    this.setState({ carpoolOpen: !carpoolOpen });
  };

  getOffcanvasState = () => this.state.settingsOpen;

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  internalSetOffcanvas = newState => {
    if (this.headerRef.current && this.contentRef.current) {
      setTimeout(() => {
        let inputs = Array.from(
          this.headerRef?.current?.querySelectorAll(
            'input, button, *[role="button"]',
          ) || [],
        );
        inputs = inputs.concat(
          Array.from(
            this.contentRef?.current?.querySelectorAll(
              'input, button, *[role="button"]',
            ) || [],
          ),
        );
        /* eslint-disable no-param-reassign */
        if (newState) {
          // hide inputs from screen reader
          inputs.forEach(elem => {
            elem.tabIndex = '-1';
          });
        } else {
          // show inputs
          inputs.forEach(elem => {
            elem.tabIndex = '0';
          });
        }
        /* eslint-enable no-param-reassign */
      }, 100);
    }
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ExtraSettingsPanelClick',
      name: newState ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });
    if (newState) {
      this.setState({ settingsOpen: newState });
      if (this.props.breakpoint !== 'large') {
        this.context.router.push({
          ...this.props.match.location,
          state: {
            ...this.props.match.location.state,
            customizeSearchOffcanvas: newState,
          },
        });
      }
      this.setState({
        settingsOnOpen: getCurrentSettings(this.context.config, ''),
      });
    } else {
      this.setState({ settingsOpen: newState });
      if (this.props.breakpoint !== 'large') {
        if (
          !isEqual(
            this.state.settingsOnOpen,
            getCurrentSettings(this.context.config, ''),
          )
        ) {
          if (
            !isEqual(
              otpToLocation(this.context.match.params.from),
              otpToLocation(this.context.match.params.to),
            ) ||
            getIntermediatePlaces(this.context.match.location.query).length > 0
          ) {
            this.context.router.go(-1);
            this.setState(
              {
                earlierItineraries: [],
                laterItineraries: [],
                separatorPosition: undefined,
                alternativePlan: undefined,
                settingsChangedRecently: true,
              },
              () => this.showScreenreaderUpdatedAlert(),
            );
          }
        }
      } else if (
        !isEqual(
          this.state.settingsOnOpen,
          getCurrentSettings(this.context.config, ''),
        )
      ) {
        if (
          !isEqual(
            otpToLocation(this.context.match.params.from),
            otpToLocation(this.context.match.params.to),
          ) ||
          getIntermediatePlaces(this.context.match.location.query).length > 0
        ) {
          this.setState(
            {
              isFetchingWalkAndBike: true,
              loading: true,
            },
            // eslint-disable-next-line func-names
            function () {
              const planParams = preparePlanParams(this.context.config, false)(
                this.context.match.params,
                this.context.match,
              );
              this.makeWalkAndBikeQueries();
              this.props.relay.refetch(planParams, null, () => {
                this.setState(
                  {
                    loading: false,
                    earlierItineraries: [],
                    laterItineraries: [],
                    separatorPosition: undefined,
                    alternativePlan: undefined,
                    settingsChangedRecently: true,
                  },
                  () => {
                    this.showScreenreaderUpdatedAlert();
                    this.resetSummaryPageSelection();
                  },
                );
              });
            },
          );
        }
      }
    }
  };

  showVehicles = () => {
    const now = moment();
    const startTime = moment.unix(this.props.match.location.query.time);
    const diff = now.diff(startTime, 'minutes');
    const { hash } = this.props.match.params;

    // Vehicles are typically not shown if they are not in transit. But for some quirk in mqtt, if you
    // search for a route for example tomorrow, real time vehicle would be shown.
    this.inRange =
      (diff <= this.show_vehicles_threshold_minutes && diff >= 0) ||
      (diff >= -1 * this.show_vehicles_threshold_minutes && diff <= 0);

    return !!(
      this.inRange &&
      this.context.config.showVehiclesOnSummaryPage &&
      hash !== 'walk' &&
      hash !== 'bike' &&
      hash !== 'car' &&
      (this.props.breakpoint === 'large' || hash)
    );
  };

  getCombinedItineraries = () => {
    const itineraries = [
      ...(this.state.earlierItineraries || []),
      ...(this.selectedPlan?.itineraries || []),
      ...(this.state.laterItineraries || []),
    ];
    return itineraries.filter(x => x !== undefined);
  };

  onDetailsTabFocused = () => {
    setTimeout(() => {
      if (this.tabHeaderRef.current) {
        this.tabHeaderRef.current.focus();
      }
    }, 500);
  };

  onlyHasWalkingItineraries = () => {
    return (
      this.planHasNoItineraries() &&
      (this.planHasNoStreetModeItineraries() || this.isWalkingFastest())
    );
  };

  isWalkingFastest = () => {
    const walkDuration = this.getDuration(this.state.walkPlan);
    const bikeDuration = this.getDuration(this.state.bikePlan);
    const carDuration = this.getDuration(this.state.carPlan);
    const parkAndRideDuration = this.getDuration(this.state.parkRidePlan);
    const bikeParkDuration = this.getDuration(this.state.bikeParkPlan);
    let bikeAndPublicDuration;
    if (this.context.config.includePublicWithBikePlan) {
      bikeAndPublicDuration = this.getDuration(this.state.bikeAndPublicPlan);
    }
    if (
      (bikeDuration && bikeDuration < walkDuration) ||
      (carDuration && carDuration < walkDuration) ||
      (parkAndRideDuration && parkAndRideDuration < walkDuration) ||
      (bikeParkDuration && bikeParkDuration < walkDuration) ||
      (bikeAndPublicDuration && bikeAndPublicDuration < walkDuration)
    ) {
      return false;
    }
    return true;
  };

  getDuration = plan => {
    if (!plan) {
      return null;
    }
    const min = Math.min(...plan.itineraries.map(itin => itin.duration));
    return min;
  };

  isLoading = (onlyWalkingItins, onlyWalkingAlternatives) => {
    if (this.state.loading) {
      return true;
    }
    if (!this.state.loading && onlyWalkingItins && onlyWalkingAlternatives) {
      return false;
    }
    return false;
  };

  render() {
    const { match, error } = this.props;
    const {
      walkPlan,
      bikePlan,
      carPlan,
      parkRidePlan,
      onDemandTaxiPlan,
    } = this.state;

    let carLeg = null;
    const plan = this.props.viewer && this.props.viewer.plan;

    const bikeParkPlan = this.filteredbikeAndPublic(this.state.bikeParkPlan);
    const bikeAndPublicPlan = this.filteredbikeAndPublic(
      this.state.bikeAndPublicPlan,
    );
    const bikeRentAndPublicPlan = this.filteredBikeRentAndPublic(
      this.state.bikeRentAndPublicPlan,
    );
    const planHasNoItineraries = this.planHasNoItineraries();
    if (
      planHasNoItineraries &&
      userHasChangedModes(this.context.config) &&
      !this.isFetching &&
      (!this.state.alternativePlan ||
        !isEqual(
          this.props.viewer && this.props.viewer.plan,
          this.originalPlan,
        ))
    ) {
      this.originalPlan = this.props.viewer.plan;
      this.isFetching = true;
      this.setState({ isFetchingWalkAndBike: true });
      this.makeWalkAndBikeQueries();
    }
    const hasAlternativeItineraries =
      this.state.alternativePlan &&
      this.state.alternativePlan.itineraries &&
      this.state.alternativePlan.itineraries.length > 0;

    this.bikeAndPublicItinerariesToShow = 0;
    this.bikeRentAndPublicItinerariesToShow = 0;
    this.bikeAndParkItinerariesToShow = 0;
    if (this.props.match.params.hash === 'walk') {
      this.stopClient();
      if (this.state.isFetchingWalkAndBike) {
        return (
          <>
            <Loading />
          </>
        );
      }
      this.selectedPlan = walkPlan;
    } else if (this.props.match.params.hash === 'bike') {
      this.stopClient();
      if (this.state.isFetchingWalkAndBike) {
        return (
          <>
            <Loading />
          </>
        );
      }
      this.selectedPlan = bikePlan;
    } else if (this.props.match.params.hash === 'onDemandTaxi') {
      this.stopClient();
      if (!onDemandTaxiPlan) {
        return <Loading />;
      }

      this.selectedPlan = onDemandTaxiPlan;
    } else if (this.props.match.params.hash === 'bikeAndVehicle') {
      if (this.state.isFetchingWalkAndBike) {
        return (
          <>
            <Loading />
          </>
        );
      }
      const hasBikeAndPublicPlan = Array.isArray(
        bikeAndPublicPlan?.itineraries,
      );
      const hasBikeParkPlan = Array.isArray(bikeParkPlan?.itineraries);

      if (
        !this.state.isFetchingWalkAndBike &&
        !this.context.config.showBikeAndParkItineraries &&
        (!hasBikeAndPublicPlan || !hasBikeParkPlan)
      ) {
        this.toggleStreetMode(''); // go back to showing normal itineraries
        return <Loading />;
      }

      // we have already filtered bike{AndPublic,RentAndPublic,Park}Plan above
      this.selectedPlan = {
        itineraries: [
          ...(bikeParkPlan.itineraries
            ? bikeParkPlan.itineraries.slice(0, 3)
            : []),
          ...(bikeAndPublicPlan.itineraries
            ? bikeAndPublicPlan.itineraries.slice(0, 3)
            : []),
          ...(bikeRentAndPublicPlan.itineraries
            ? bikeRentAndPublicPlan.itineraries.slice(0, 3)
            : []),
        ],
      };
      this.bikeAndPublicItinerariesToShow = Math.min(
        bikeAndPublicPlan.itineraries.length,
        3,
      );
      this.bikeRentAndPublicItinerariesToShow = Math.min(
        bikeRentAndPublicPlan.itineraries.length,
        3,
      );
      this.bikeAndParkItinerariesToShow = Math.min(
        bikeParkPlan.itineraries.length,
        3,
      );
    } else if (this.props.match.params.hash === 'car') {
      this.stopClient();
      if (this.state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      this.selectedPlan = carPlan;
      [carLeg] = carPlan.itineraries[0].legs;
    } else if (this.props.match.params.hash === 'parkAndRide') {
      if (this.state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      if (
        !this.state.isFetchingWalkAndBike &&
        !Array.isArray(parkRidePlan?.itineraries)
      ) {
        this.toggleStreetMode(''); // go back to showing normal itineraries
        return <Loading />;
      }
      this.selectedPlan = parkRidePlan;
      [carLeg] = parkRidePlan.itineraries[0].legs;
    } else if (planHasNoItineraries && hasAlternativeItineraries) {
      this.selectedPlan = this.state.alternativePlan;
    } else {
      this.selectedPlan = plan;
    }

    const currentSettings = getCurrentSettings(this.context.config, '');

    let itineraryWalkDistance;
    let itineraryBikeDistance;
    if (walkPlan && walkPlan.itineraries && walkPlan.itineraries.length > 0) {
      itineraryWalkDistance = walkPlan.itineraries[0].walkDistance;
    }
    if (bikePlan && bikePlan.itineraries && bikePlan.itineraries.length > 0) {
      itineraryBikeDistance = getTotalBikingDistance(bikePlan.itineraries[0]);
    }

    const showWalkOptionButton = Boolean(
      walkPlan &&
        walkPlan.itineraries &&
        walkPlan.itineraries.length > 0 &&
        !currentSettings.accessibilityOption &&
        itineraryWalkDistance < this.context.config.suggestWalkMaxDistance,
    );

    const bikePlanContainsOnlyWalk =
      !bikePlan ||
      !bikePlan.itineraries ||
      bikePlan.itineraries.every(itinerary =>
        itinerary.legs.every(leg => leg.mode === 'WALK'),
      );

    const showBikeOptionButton = Boolean(
      bikePlan &&
        bikePlan.itineraries &&
        bikePlan.itineraries.length > 0 &&
        !currentSettings.accessibilityOption &&
        currentSettings.includeBikeSuggestions &&
        !bikePlanContainsOnlyWalk &&
        itineraryBikeDistance < this.context.config.suggestBikeMaxDistance,
    );

    const bikeAndPublicPlanHasItineraries = this.hasItinerariesContainingPublicTransit(
      bikeAndPublicPlan,
    );
    const bikeRentAndPublicPlanHasItineraries = this.hasItinerariesContainingPublicTransit(
      bikeRentAndPublicPlan,
    );
    const bikeParkPlanHasItineraries = this.hasItinerariesContainingPublicTransit(
      bikeParkPlan,
    );

    // NOTE: here, in contrast to HSL, we don't inspect config and ignore most settings,
    // as these already should have been respected in the request
    const showBikeAndPublicOptionButton =
      bikeAndPublicPlanHasItineraries ||
      bikeRentAndPublicPlanHasItineraries ||
      bikeParkPlanHasItineraries;

    const hasCarItinerary = !isEmpty(get(carPlan, 'itineraries'));
    const showCarOptionButton =
      this.context.config.includeCarSuggestions &&
      currentSettings.includeCarSuggestions &&
      hasCarItinerary;

    const hasParkAndRideItineraries = !isEmpty(
      get(parkRidePlan, 'itineraries'),
    );
    const showParkRideOptionButton =
      this.context.config.includeParkAndRideSuggestions &&
      currentSettings.includeParkAndRideSuggestions &&
      hasParkAndRideItineraries;

    const showOnDemandTaxiOptionButton = !isEmpty(
      get(onDemandTaxiPlan, 'itineraries'),
    );
    const showStreetModeSelector =
      (showWalkOptionButton ||
        showBikeOptionButton ||
        showBikeAndPublicOptionButton ||
        showCarOptionButton ||
        showParkRideOptionButton ||
        showOnDemandTaxiOptionButton) &&
      this.props.match.params.hash !== 'bikeAndVehicle' &&
      this.props.match.params.hash !== 'parkAndRide';

    const hasItineraries =
      this.selectedPlan && Array.isArray(this.selectedPlan.itineraries);

    if (
      !this.isFetching &&
      hasItineraries &&
      (this.selectedPlan !== this.state.alternativePlan ||
        this.selectedPlan !== plan) &&
      !isEqual(this.selectedPlan, this.state.previouslySelectedPlan)
    ) {
      this.setState({
        previouslySelectedPlan: this.selectedPlan,
        separatorPosition: undefined,
        earlierItineraries: [],
        laterItineraries: [],
      });
    }
    let combinedItineraries = this.getCombinedItineraries();
    const onlyHasWalkingItineraries = this.onlyHasWalkingItineraries();
    let onlyWalkingAlternatives = false;
    // Don't show only walking alternative itineraries
    if (onlyHasWalkingItineraries && this.state.alternativePlan) {
      let onlyWalkingItineraries = true;
      this.state.alternativePlan.itineraries.forEach(itin => {
        if (!itin.legs.every(leg => leg.mode === 'WALK')) {
          onlyWalkingItineraries = false;
        }
      });
      if (onlyWalkingItineraries) {
        onlyWalkingAlternatives = true;
      }
    }

    if (
      combinedItineraries.length > 0 &&
      this.props.match.params.hash !== 'walk' &&
      this.props.match.params.hash !== 'bikeAndVehicle' &&
      !onlyHasWalkingItineraries
    ) {
      combinedItineraries = combinedItineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      ); // exclude itineraries that have only walking legs from the summary if other itineraries are found
    }

    // Remove old itineraries if new query cannot find a route
    if (error && hasItineraries) {
      combinedItineraries = [];
    }

    const hash = getHashNumber(
      this.props.match.params.secondHash
        ? this.props.match.params.secondHash
        : this.props.match.params.hash,
    );

    const from = otpToLocation(match.params.from);
    const to = otpToLocation(match.params.to);
    const viaPoints = getIntermediatePlaces(match.location.query);

    if (match.routes.some(route => route.printPage) && hasItineraries) {
      return React.cloneElement(this.props.content, {
        itinerary:
          combinedItineraries[hash < combinedItineraries.length ? hash : 0],
        focusToPoint: this.focusToPoint,
        from,
        to,
      });
    }

    let map = this.renderMap(from, to, viaPoints);

    let earliestStartTime;
    let latestArrivalTime;

    if (this.selectedPlan?.itineraries) {
      earliestStartTime = Math.min(
        ...combinedItineraries.map(i => i.startTime),
      );
      latestArrivalTime = Math.max(...combinedItineraries.map(i => i.endTime));
    }

    const serviceTimeRange = validateServiceTimeRange(
      this.context.config.itinerary.serviceTimeRange,
      this.props.serviceTimeRange,
    );
    const loadingPublicDone =
      this.state.loading === false && (error || this.props.loading === false);
    const waitForBikeAndWalk = () =>
      planHasNoItineraries && this.state.isFetchingWalkAndBike;
    if (this.props.breakpoint === 'large') {
      let content;
      /* Should render content if
      1. Fetching public itineraries is complete
      2. Don't have to wait for walk and bike query to complete
      3. Result has non-walking itineraries OR if not, query with all modes is completed or query is made with default settings
      If all conditions don't apply, render spinner */
      if (
        loadingPublicDone &&
        !waitForBikeAndWalk() &&
        (!onlyHasWalkingItineraries ||
          (onlyHasWalkingItineraries &&
            (this.allModesQueryDone ||
              !relevantRoutingSettingsChanged(this.context.config))))
      ) {
        const activeIndex =
          hash || getActiveIndex(match.location, combinedItineraries);
        const selectedItineraries = combinedItineraries;
        const selectedItinerary = selectedItineraries
          ? selectedItineraries[activeIndex]
          : undefined;
        if (
          routeSelected(
            match.params.hash,
            match.params.secondHash,
            combinedItineraries,
          ) &&
          combinedItineraries.length > 0
        ) {
          const currentTime = {
            date: moment().valueOf(),
          };

          const itineraryTabs = selectedItineraries.map((itinerary, i) => {
            return (
              <div
                className={`swipeable-tab ${activeIndex !== i && 'inactive'}`}
                key={itinerary.key}
                aria-hidden={activeIndex !== i}
              >
                <ItineraryTab
                  hideTitle
                  plan={currentTime}
                  itinerary={itinerary}
                  focusToPoint={this.focusToPoint}
                  focusToLeg={this.focusToLeg}
                  isMobile={false}
                  toggleCarpoolDrawer={this.toggleCarpoolDrawer}
                />
              </div>
            );
          });

          content = (
            <div className="swipe-scroll-wrapper">
              <SwipeableTabs
                tabs={itineraryTabs}
                tabIndex={activeIndex}
                onSwipe={this.changeHash}
                classname="swipe-desktop-view"
                ariaFrom="swipe-summary-page"
                ariaFromHeader="swipe-summary-page-header"
              />
            </div>
          );
          return (
            <DesktopView
              title={
                <span ref={this.tabHeaderRef} tabIndex={-1}>
                  <FormattedMessage
                    id="itinerary-page.title"
                    defaultMessage="Itinerary suggestions"
                  />
                </span>
              }
              carpoolDrawer={
                <CarpoolDrawer
                  onToggleClick={this.toggleCarpoolDrawer}
                  open={this.state.carpoolOpen}
                  carLeg={carLeg}
                  mobile={false}
                />
              }
              content={content}
              map={map}
              bckBtnVisible
              bckBtnFallback="pop"
            />
          );
        }
        content = (
          <>
            <SummaryPlanContainer
              activeIndex={activeIndex}
              plan={this.selectedPlan}
              serviceTimeRange={serviceTimeRange}
              /* routingErrors={this.selectedPlan.routingErrors} */
              itineraries={selectedItineraries}
              params={match.params}
              error={error || this.state.error}
              bikeAndPublicItinerariesToShow={
                this.bikeAndPublicItinerariesToShow
              }
              bikeRentAndPublicItinerariesToShow={
                this.bikeRentAndPublicItinerariesToShow
              }
              bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
              car={showCarOptionButton}
              parkAndRide={showParkRideOptionButton}
              onDemandTaxi={showOnDemandTaxiOptionButton}
              walking={showWalkOptionButton}
              biking={showBikeOptionButton}
              showAlternativePlan={
                planHasNoItineraries &&
                hasAlternativeItineraries &&
                !onlyWalkingAlternatives
              }
              separatorPosition={this.state.separatorPosition}
              loading={this.isLoading(
                onlyHasWalkingItineraries,
                onlyWalkingAlternatives,
              )}
              onLater={this.onLater}
              onEarlier={this.onEarlier}
              onDetailsTabFocused={() => {
                this.onDetailsTabFocused();
              }}
              loadingMoreItineraries={this.state.loadingMoreItineraries}
              showSettingsChangedNotification={
                this.shouldShowSettingsChangedNotification
              }
              alternativePlan={this.state.alternativePlan}
              driving={showCarOptionButton || showParkRideOptionButton}
              onlyHasWalkingItineraries={onlyHasWalkingItineraries}
            >
              {this.props.content &&
                React.cloneElement(this.props.content, {
                  itinerary: selectedItineraries?.length && selectedItinerary,
                  focusToPoint: this.focusToPoint,
                  plan: this.selectedPlan,
                })}
            </SummaryPlanContainer>
          </>
        );
      } else {
        content = (
          <div style={{ position: 'relative', height: 200 }}>
            <Loading />
          </div>
        );
        return hash !== undefined ? (
          <DesktopView
            title={
              <FormattedMessage
                id="itinerary-page.title"
                defaultMessage="Itinerary suggestions"
              />
            }
            content={content}
            map={map}
            scrollable
            bckBtnVisible={false}
          />
        ) : (
          <DesktopView
            title={
              <FormattedMessage
                id="summary-page.title"
                defaultMessage="Itinerary suggestions"
              />
            }
            header={
              <React.Fragment>
                <SummaryNavigation params={match.params} />
                <StreetModeSelector loading />
              </React.Fragment>
            }
            content={content}
            map={map}
          />
        );
      }
      return (
        <DesktopView
          title={
            <FormattedMessage
              id="summary-page.title"
              defaultMessage="Itinerary suggestions"
            />
          }
          bckBtnFallback={
            match.params.hash === 'bikeAndVehicle' ? 'pop' : undefined
          }
          header={
            <span aria-hidden={this.getOffcanvasState()} ref={this.headerRef}>
              <SummaryNavigation
                params={match.params}
                serviceTimeRange={serviceTimeRange}
                startTime={earliestStartTime}
                endTime={latestArrivalTime}
                toggleSettings={this.toggleCustomizeSearchOffcanvas}
              />
              {error ||
              (!this.state.isFetchingWalkAndBike &&
                !showStreetModeSelector) ? null : (
                <StreetModeSelector
                  showWalkOptionButton={showWalkOptionButton}
                  showBikeOptionButton={showBikeOptionButton}
                  showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                  showCarOptionButton={showCarOptionButton}
                  showParkRideOptionButton={showParkRideOptionButton}
                  showOnDemandTaxiOptionButton={showOnDemandTaxiOptionButton}
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeAndPublicPlan}
                  bikeRentAndPublicPlan={bikeRentAndPublicPlan}
                  bikeParkPlan={bikeParkPlan}
                  carPlan={carPlan}
                  parkRidePlan={parkRidePlan}
                  onDemandTaxiPlan={onDemandTaxiPlan}
                  loading={
                    this.props.loading ||
                    this.state.isFetchingWalkAndBike ||
                    this.state.isFetchingWeather
                  }
                />
              )}
              {this.props.match.params.hash === 'parkAndRide' && (
                <div className="street-mode-info">
                  <FormattedMessage
                    id="leave-your-car-park-and-ride"
                    defaultMessage="Park your car at the Park & Ride site"
                  />
                </div>
              )}
            </span>
          }
          content={
            <span aria-hidden={this.getOffcanvasState()} ref={this.contentRef}>
              {content}
            </span>
          }
          settingsDrawer={
            <SettingsDrawer
              open={this.getOffcanvasState()}
              className="offcanvas"
            >
              <CustomizeSearch
                onToggleClick={this.toggleCustomizeSearchOffcanvas}
              />
            </SettingsDrawer>
          }
          map={map}
          scrollable
        />
      );
    }

    let content;
    let isLoading = false;

    if (
      (!error && (!this.selectedPlan || this.props.loading === true)) ||
      this.state.loading !== false
    ) {
      isLoading = true;
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <Loading />
        </div>
      );
      if (hash !== undefined) {
        return content;
      }
    }
    if (
      routeSelected(
        match.params.hash,
        match.params.secondHash,
        combinedItineraries,
      ) &&
      combinedItineraries.length > 0
    ) {
      content = (
        <MobileItineraryWrapper
          itineraries={combinedItineraries}
          params={match.params}
          focusToPoint={this.focusToPoint}
          plan={this.selectedPlan}
          serviceTimeRange={this.props.serviceTimeRange}
          focusToLeg={this.focusToLeg}
          toggleCarpoolDrawer={this.toggleCarpoolDrawer}
          onSwipe={this.changeHash}
        >
          {this.props.content &&
            combinedItineraries.map((itinerary, i) =>
              React.cloneElement(this.props.content, {
                key: i,
                itinerary,
                plan: this.selectedPlan,
                serviceTimeRange: this.props.serviceTimeRange,
              }),
            )}
        </MobileItineraryWrapper>
      );
    } else {
      map = undefined;
      if (isLoading) {
        content = (
          <div style={{ position: 'relative', height: 200 }}>
            <Loading />
          </div>
        );
      } else {
        content = (
          <>
            <SummaryPlanContainer
              activeIndex={
                hash || getActiveIndex(match.location, combinedItineraries)
              }
              plan={this.selectedPlan}
              serviceTimeRange={serviceTimeRange}
              /* routingErrors={this.selectedPlan.routingErrors} */
              itineraries={combinedItineraries}
              params={match.params}
              error={error || this.state.error}
              from={match.params.from}
              to={match.params.to}
              intermediatePlaces={viaPoints}
              bikeAndPublicItinerariesToShow={
                this.bikeAndPublicItinerariesToShow
              }
              bikeRentAndPublicItinerariesToShow={
                this.bikeRentAndPublicItinerariesToShow
              }
              bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
              car={showCarOptionButton}
              parkAndRide={showParkRideOptionButton}
              onDemandTaxi={showOnDemandTaxiOptionButton}
              walking={showWalkOptionButton}
              biking={showBikeOptionButton}
              showAlternativePlan={
                planHasNoItineraries &&
                hasAlternativeItineraries &&
                !onlyWalkingAlternatives
              }
              separatorPosition={this.state.separatorPosition}
              loading={this.isLoading(
                onlyHasWalkingItineraries,
                onlyWalkingAlternatives,
              )}
              onLater={this.onLater}
              onEarlier={this.onEarlier}
              onDetailsTabFocused={() => {
                this.onDetailsTabFocused();
              }}
              loadingMoreItineraries={this.state.loadingMoreItineraries}
              showSettingsChangedNotification={
                this.shouldShowSettingsChangedNotification
              }
              alternativePlan={this.state.alternativePlan}
              driving={showCarOptionButton || showParkRideOptionButton}
              onlyHasWalkingItineraries={onlyHasWalkingItineraries}
            />
          </>
        );
      }
    }

    return (
      <MobileView
        header={
          !routeSelected(
            match.params.hash,
            match.params.secondHash,
            combinedItineraries,
          ) ? (
            <span aria-hidden={this.getOffcanvasState()} ref={this.headerRef}>
              <SummaryNavigation
                params={match.params}
                serviceTimeRange={serviceTimeRange}
                startTime={earliestStartTime}
                endTime={latestArrivalTime}
                toggleSettings={this.toggleCustomizeSearchOffcanvas}
              />
              {error ||
              (!this.state.isFetchingWalkAndBike &&
                !showStreetModeSelector) ? null : (
                <StreetModeSelector
                  showWalkOptionButton={showWalkOptionButton}
                  showBikeOptionButton={showBikeOptionButton}
                  showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                  showCarOptionButton={showCarOptionButton}
                  showParkRideOptionButton={showParkRideOptionButton}
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeAndPublicPlan}
                  bikeRentAndPublicPlan={bikeRentAndPublicPlan}
                  bikeParkPlan={bikeParkPlan}
                  carPlan={carPlan}
                  parkRidePlan={parkRidePlan}
                  loading={
                    this.props.loading ||
                    this.state.isFetchingWalkAndBike ||
                    this.state.isFetchingWeather
                  }
                />
              )}
              {this.props.match.params.hash === 'parkAndRide' && (
                <div className="street-mode-info">
                  <FormattedMessage
                    id="leave-your-car-park-and-ride"
                    defaultMessage="Park your car at the Park & Ride site"
                  />
                </div>
              )}
            </span>
          ) : (
            false
          )
        }
        content={
          <span aria-hidden={this.getOffcanvasState()} ref={this.contentRef}>
            {content}
          </span>
        }
        map={map}
        settingsDrawer={
          <SettingsDrawer
            open={this.getOffcanvasState()}
            className="offcanvas-mobile"
          >
            <CustomizeSearch
              onToggleClick={this.toggleCustomizeSearchOffcanvas}
              mobile
            />
          </SettingsDrawer>
        }
        expandMap={this.expandMap}
        carpoolDrawer={
          <CarpoolDrawer
            onToggleClick={this.toggleCarpoolDrawer}
            open={this.state.carpoolOpen}
            carLeg={carLeg}
            mobile
          />
        }
      />
    );
  }
}

const SummaryPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <SummaryPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const SummaryPageWithStores = connectToStores(
  SummaryPageWithBreakpoint,
  ['MapLayerStore'],
  ({ getStore }) => ({
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'vehicles'],
    }),
    mapLayerOptions: getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles'],
    }),
  }),
);

const containerComponent = createRefetchContainer(
  SummaryPageWithStores,
  {
    viewer: graphql`
      fragment SummaryPage_viewer on QueryType
      @argumentDefinitions(
        fromPlace: { type: "String!" }
        toPlace: { type: "String!" }
        intermediatePlaces: { type: "[InputCoordinates!]" }
        numItineraries: { type: "Int!" }
        modes: { type: "[TransportMode!]" }
        date: { type: "String!" }
        time: { type: "String!" }
        walkReluctance: { type: "Float" }
        walkBoardCost: { type: "Int" }
        minTransferTime: { type: "Int" }
        walkSpeed: { type: "Float" }
        wheelchair: { type: "Boolean" }
        ticketTypes: { type: "[String]" }
        arriveBy: { type: "Boolean" }
        transferPenalty: { type: "Int" }
        bikeSpeed: { type: "Float" }
        optimize: { type: "OptimizeType" }
        triangle: { type: "InputTriangle" }
        itineraryFiltering: { type: "Float" }
        unpreferred: { type: "InputUnpreferred" }
        allowedVehicleRentalNetworks: { type: "[String]" }
        locale: { type: "String" }
        # useVehicleParkingAvailabilityInformation: { type: "Boolean" }
        modeWeight: { type: "InputModeWeight" }
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
          triangle: $triangle
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
          locale: $locale
          modeWeight: $modeWeight
        ) {
          ...SummaryPlanContainer_plan
          ...ItineraryTab_plan
          # The bbnavi OTP deployments don't have this feature yet.
          # todo: merge upstream OTP code, deploy, re-enable the code here
          # routingErrors {
          #   code
          #   inputField
          # }
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
    `,
    serviceTimeRange: graphql`
      fragment SummaryPage_serviceTimeRange on serviceTimeRange {
        start
        end
      }
    `,
  },
  planQuery,
);

export {
  containerComponent as default,
  SummaryPageWithBreakpoint as Component,
};
