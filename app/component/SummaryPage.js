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
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import polyline from 'polyline-encoded';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import SunCalc from 'suncalc';
import BackButton from './BackButton';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import MapContainer from './map/MapContainer';
import SummaryPlanContainer from './SummaryPlanContainer';
import SummaryNavigation from './SummaryNavigation';
import ItineraryLine from './map/ItineraryLine';
import LocationMarker from './map/LocationMarker';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import { getWeatherData } from '../util/apiUtils';
import Loading from './Loading';
import { getSummaryPath } from '../util/path';
import {
  validateServiceTimeRange,
  getStartTimeWithColon,
} from '../util/timeUtils';
import {
  planQuery,
  setIntermediatePlaces,
  updateItinerarySearch,
  moreItinerariesQuery,
} from '../util/queryUtils';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import exampleData from './data/SummaryPage.ExampleData';
import { isBrowser, isIOS } from '../util/browser';
import { itineraryHasCancelation } from '../util/alertUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  parseLatLon,
  locationToOTP,
  otpToLocation,
  getIntermediatePlaces,
} from '../util/otpStrings';
import { SettingsDrawer } from './SettingsDrawer';

import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import ItineraryTab from './ItineraryTab';
import { StreetModeSelector } from './StreetModeSelector';
import SwipeableTabs from './SwipeableTabs';
import { getCurrentSettings, preparePlanParams } from '../util/planParamUtil';
import { getTotalBikingDistance } from '../util/legUtils';
import { userHasChangedModes } from '../util/modeUtils';
import { addViaPoint } from '../action/ViaPointActions';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { saveSearch } from '../action/SearchActions';

const MAX_ZOOM = 16; // Maximum zoom available for the bounds.
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
    if (hash === 'walk' || hash === 'bike') {
      return 0;
    }
    return Number(hash);
  }
  return undefined;
};

export const routeSelected = (hash, secondHash, itineraries) => {
  if (hash === 'bikeAndVehicle') {
    if (secondHash && secondHash < itineraries.length) {
      return true;
    }
    return false;
  }
  if (
    (hash && hash < itineraries.length) ||
    hash === 'walk' ||
    hash === 'bike'
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
        const feedId = leg.trip.gtfsId.split(':')[0];
        let topic;
        if (realTime && feedIds.includes(feedId)) {
          if (realTime[feedId] && realTime[feedId].useFuzzyTripMatching) {
            topic = {
              feedId,
              route: leg.route.gtfsId.split(':')[1],
              mode: leg.mode.toLowerCase(),
              direction: Number(leg.trip.directionId),
              tripStartTime: getStartTimeWithColon(
                leg.trip.stoptimesForDate[0].scheduledDeparture,
              ),
            };
          } else if (realTime[feedId]) {
            topic = {
              feedId,
              route: leg.route.gtfsId.split(':')[1],
              tripId: leg.trip.gtfsId.split(':')[1],
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

class SummaryPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired, // DT-3358
    match: matchShape.isRequired,
  };

  static propTypes = {
    match: matchShape.isRequired,
    viewer: PropTypes.shape({
      plan: PropTypes.shape({
        itineraries: PropTypes.array,
      }),
    }).isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    content: PropTypes.node,
    map: PropTypes.shape({
      type: PropTypes.func.isRequired,
    }),
    breakpoint: PropTypes.string.isRequired,
    error: PropTypes.object,
    loading: PropTypes.bool,
    loadingPosition: PropTypes.bool,
    relayEnvironment: PropTypes.object,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    map: undefined,
    error: undefined,
    loading: false,
    loadingPosition: false,
  };

  constructor(props, context) {
    super(props, context);
    this.isFetching = false;
    this.secondQuerySent = false;
    this.setParamsAndQuery();
    this.originalPlan = this.props.viewer && this.props.viewer.plan;
    // *** TODO: Hotfix variables for temporary use only
    this.justMounted = true;
    this.useFitBounds = true;
    this.mapLoaded = false;
    this.origin = undefined;
    this.destination = undefined;
    this.mapCenterToggle = undefined;
    // Terrible hack to get walking and cycling walks to respond correctly with bounds
    this.fooAgain = undefined;
    this.fooCount = 0;
    // ****     ****
    if (props.error) {
      reportError(props.error);
    }
    this.resultsUpdatedAlertRef = React.createRef();
    this.itinerariesLoadingAlertRef = React.createRef();
    this.itinerariesLoadedAlertRef = React.createRef();

    // DT-4161: Threshold to determine should vehicles be shown if search is made in the future
    this.show_vehicles_threshold_minutes = 720;

    this.state = {
      weatherData: {},
      center: null,
      loading: false,
      settingsOpen: false,
      bounds: null,
      alternativePlan: undefined,
      earlierItineraries: [],
      laterItineraries: [],
      previouslySelectedPlan: this.props.viewer && this.props.viewer.plan,
      separatorPosition: undefined,
      walkPlan: undefined,
      bikePlan: undefined,
      bikeAndPublicPlan: undefined,
      bikeParkPlan: undefined,
      scrolled: false,
      loadingMoreItineraries: undefined,
      zoomLevel: -1,
      isFetchingWalkAndBike: true,
    };
    if (this.props.match.params.hash === 'walk') {
      this.selectedPlan = this.state.walkPlan;
    } else if (this.props.match.params.hash === 'bike') {
      this.selectedPlan = this.state.bikePlan;
    } else if (this.props.match.params.hash === 'bikeAndVehicle') {
      this.selectedPlan = {
        itineraries: [
          ...this.state.bikeParkPlan?.itineraries,
          ...this.state.bikeAndPublicPlan?.itineraries,
        ],
      };
    } else {
      this.selectedPlan = this.props.viewer && this.props.viewer.plan;
    }
  }

  // When user goes straight to itinerary view with url, map cannot keep up and renders a while after everything else
  // This helper function ensures that lat lon values are sent to the map, thus preventing set center and zoom first error.
  mapReady() {
    this.mapLoaded = true;
  }

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
    this.context.router.push(newState);
  };

  setStreetModeAndSelect = newStreetMode => {
    this.justMounted = true;
    this.useFitBounds = true;
    this.mapLoaded = false;
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
    this.context.router.push(newState);
  };

  hasItinerariesContainingPublicTransit = plan => {
    if (
      plan &&
      Array.isArray(plan.itineraries) &&
      plan.itineraries.length > 0
    ) {
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
    this.itineraryTopics = itineraryTopics;
    if (itineraryTopics && !isEmpty(itineraryTopics)) {
      const clientConfig = this.configClient(itineraryTopics);
      this.context.executeAction(startRealTimeClient, clientConfig);
    }
  };

  updateClient = itineraryTopics => {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );
    this.itineraryTopics = itineraryTopics;
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
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
      this.itineraryTopics = undefined;
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
        $bikeAndPublicMaxWalkDistance: Float
        $wheelchair: Boolean
        $ticketTypes: [String]
        $bikeandPublicDisableRemainingWeightHeuristic: Boolean
        $arriveBy: Boolean
        $transferPenalty: Int
        $bikeSpeed: Float
        $optimize: OptimizeType
        $itineraryFiltering: Float
        $unpreferred: InputUnpreferred
        $locale: String
        $shouldMakeWalkQuery: Boolean!
        $shouldMakeBikeQuery: Boolean!
        $showBikeAndPublicItineraries: Boolean!
        $showBikeAndParkItineraries: Boolean!
        $bikeAndPublicModes: [TransportMode!]
        $bikeParkModes: [TransportMode!]
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
          maxWalkDistance: $bikeAndPublicMaxWalkDistance
          allowedTicketTypes: $ticketTypes
          disableRemainingWeightHeuristic: $bikeandPublicDisableRemainingWeightHeuristic
          arriveBy: $arriveBy
          transferPenalty: $transferPenalty
          bikeSpeed: $bikeSpeed
          optimize: $optimize
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
          intermediatePlaces: $intermediatePlaces
          numItineraries: 6
          transportModes: $bikeParkModes
          date: $date
          time: $time
          walkReluctance: $walkReluctance
          walkBoardCost: $walkBoardCost
          minTransferTime: $minTransferTime
          walkSpeed: $walkSpeed
          maxWalkDistance: $bikeAndPublicMaxWalkDistance
          allowedTicketTypes: $ticketTypes
          disableRemainingWeightHeuristic: $bikeandPublicDisableRemainingWeightHeuristic
          arriveBy: $arriveBy
          transferPenalty: $transferPenalty
          bikeSpeed: $bikeSpeed
          optimize: $optimize
          itineraryFiltering: $itineraryFiltering
          unpreferred: $unpreferred
          locale: $locale
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
            isFetchingWeather: true,
            walkPlan: result.walkPlan,
            bikePlan: result.bikePlan,
            bikeAndPublicPlan: result.bikeAndPublicPlan,
            bikeParkPlan: result.bikeParkPlan,
          },
          () => {
            this.makeWeatherQuery();
          },
        );
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
                }
                pattern {
                  ...RouteLine_pattern
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
    if (this.itinerariesLoadingAlertRef.current) {
      // eslint-disable-next-line no-self-assign
      this.itinerariesLoadingAlertRef.current.innerHTML = this.itinerariesLoadingAlertRef.current.innerHTML;
    }

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

    fetchQuery(
      this.props.relayEnvironment,
      moreItinerariesQuery,
      tunedParams,
    ).then(({ plan: result }) => {
      if (this.itinerariesLoadedAlertRef.current) {
        // eslint-disable-next-line no-self-assign
        this.itinerariesLoadedAlertRef.current.innerHTML = this.itinerariesLoadedAlertRef.current.innerHTML;
      }
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
    if (this.itinerariesLoadingAlertRef.current) {
      // eslint-disable-next-line no-self-assign
      this.itinerariesLoadingAlertRef.current.innerHTML = this.itinerariesLoadingAlertRef.current.innerHTML;
    }

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
      if (this.itinerariesLoadedAlertRef.current) {
        // eslint-disable-next-line no-self-assign
        this.itinerariesLoadedAlertRef.current.innerHTML = this.itinerariesLoadedAlertRef.current.innerHTML;
      }
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
      }
    }
  }

  componentWillUnmount() {
    if (this.showVehicles()) {
      this.stopClient();
    }
    this.justMounted = true;
    this.useFitBounds = true;
    this.mapLoaded = false;
    //  alert screen reader when search results appear
    if (this.resultsUpdatedAlertRef.current) {
      // eslint-disable-next-line no-self-assign
      this.resultsUpdatedAlertRef.current.innerHTML = this.resultsUpdatedAlertRef.current.innerHTML;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !this.props.match.params.hash &&
      !isEqual(this.props.match.params.hash, prevProps.match.params.hash)
    ) {
      this.justMounted = true;
      this.mapCenterToggle = undefined;
      this.fooCount = 0;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        center: undefined,
        bounds: undefined,
      });
    }
    if (
      this.props.match.params.hash &&
      (this.props.match.params.hash === 'walk' ||
        this.props.match.params.hash === 'bike' ||
        this.props.match.params.hash === 'bikeAndVehicle')
    ) {
      // Reset streetmode selection if intermediate places change
      if (
        !isEqual(
          getIntermediatePlaces(prevProps.match.location.query),
          getIntermediatePlaces(this.props.match.location.query),
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
      this.setParamsAndQuery();
      this.secondQuerySent = false;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isFetchingWalkAndBike: true,
        walkPlan: undefined,
        bikePlan: undefined,
        bikeAndPublicPlan: undefined,
        bikeParkPlan: undefined,
        earlierItineraries: [],
        laterItineraries: [],
        weatherData: {},
        separatorPosition: undefined,
        alternativePlan: undefined,
      });
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
        getIntermediatePlaces(this.context.match.location.query).length > 0
      ) {
        this.makeWalkAndBikeQueries();
      } else {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ isFetchingWalkAndBike: false });
      }
    }

    if (
      this.resultsUpdatedAlertRef.current &&
      this.selectedPlan.itineraries &&
      JSON.stringify(prevProps.match.location) !==
        JSON.stringify(this.props.match.location)
    ) {
      // refresh content to trigger the alert
      // eslint-disable-next-line no-self-assign
      this.resultsUpdatedAlertRef.current.innerHTML = this.resultsUpdatedAlertRef.current.innerHTML;
    }
    if (this.props.error) {
      reportError(this.props.error);
    }
    if (this.showVehicles()) {
      let combinedItineraries = this.getCombinedItineraries();
      if (
        combinedItineraries &&
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
      if (!isEqual(itineraryTopics, this.itineraryTopics) || !client) {
        this.updateClient(itineraryTopics);
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

  updateCenter = (lat, lon) => {
    if (this.props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.setMapCenterToggle();
    }
    this.justMounted = true;
    this.setState({ center: { lat, lon }, bounds: null });
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

  filteredbikeAndPublic = plan => {
    return {
      itineraries: this.filterOnlyBikeAndWalk(plan?.itineraries),
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
          });
      }
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

  changeHash = index => {
    const isbikeAndVehicle = this.props.match.params.hash === 'bikeAndVehicle';

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
    )}${isbikeAndVehicle ? '/bikeAndVehicle/' : '/'}${index}`;

    newState.pathname = indexPath;
    this.context.router.replace(newState);
  };

  setMapZoomToLeg = leg => {
    if (this.props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.setMapCenterToggle();
    }
    // this.justMounted = true;
    // this.setState({ bounds: [] });
    const bounds = []
      .concat(
        [
          [leg.from.lat, leg.from.lon],
          [leg.to.lat, leg.to.lon],
        ],
        polyline.decode(leg.legGeometry.points),
      )
      .filter(a => a[0] && a[1]);
    this.useFitBounds = true;
    this.setState({
      bounds,
      center: undefined,
    });
  };

  endZoom = element => {
    // eslint-disable-next-line no-underscore-dangle
    const mapZoomLevel = element.target._zoom;
    this.mapZoomLevel = mapZoomLevel;
    if (this.state.zoomLevel !== this.mapZoomLevel) {
      this.setState({
        zoomLevel: mapZoomLevel,
      });
    }
  };

  selectLocation = (item, id) => {
    const { match } = this.context;
    if (id === 'via') {
      const viaPoints = getIntermediatePlaces(match.location.query)
        .concat([item])
        .map(locationToOTP);
      this.context.executeAction(addViaPoint, item);
      setIntermediatePlaces(this.context.router, match, viaPoints);
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
      this.context.router,
      match.location,
      this.context.executeAction,
    );
  };

  renderMap() {
    const { match, breakpoint } = this.props;
    this.justMounted = true;
    this.useFitBounds = false;
    // don't render map on mobile
    if (breakpoint !== 'large') {
      this.justMounted = true;
      this.useFitBounds = true;
      return undefined;
    }
    const {
      config: { defaultEndpoint },
    } = this.context;

    const combinedItineraries = this.getCombinedItineraries();
    let filteredItineraries;
    if (combinedItineraries && combinedItineraries.length > 0) {
      filteredItineraries = combinedItineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      );
    } else {
      filteredItineraries = [];
    }

    const activeIndex =
      getHashNumber(
        match.params.secondHash ? match.params.secondHash : match.params.hash,
      ) || getActiveIndex(match.location, filteredItineraries);
    const from = otpToLocation(match.params.from);
    const to = otpToLocation(match.params.to);

    let leafletObjs = [];

    if (filteredItineraries && filteredItineraries.length > 0) {
      const onlyActive =
        activeIndex < filteredItineraries.length
          ? filteredItineraries[activeIndex]
          : filteredItineraries[0];
      leafletObjs = filteredItineraries
        .filter(itinerary => itinerary !== onlyActive)
        .map((itinerary, i) => (
          <ItineraryLine
            key={i}
            hash={i}
            legs={itinerary.legs}
            passive
            showIntermediateStops={false}
          />
        ));
      const nextId = leafletObjs.length + 1;
      leafletObjs.push(
        <ItineraryLine
          key={nextId}
          hash={nextId}
          legs={onlyActive.legs}
          passive={false}
          showIntermediateStops
        />,
      );
    }

    if (from.lat && from.lon) {
      leafletObjs.push(
        <LocationMarker
          key="fromMarker"
          position={from}
          type="from"
          streetMode={this.props.match.params.hash}
        />,
      );
    }

    if (to.lat && to.lon) {
      leafletObjs.push(
        <LocationMarker
          key="toMarker"
          position={to}
          type="to"
          streetMode={this.props.match.params.hash}
        />,
      );
    }

    getIntermediatePlaces(match.location.query).forEach(
      (intermediatePlace, i) => {
        leafletObjs.push(
          <LocationMarker key={`via_${i}`} position={intermediatePlace} />,
        );
      },
    );

    // Decode all legs of all itineraries into latlong arrays,
    // and concatenate into one big latlong array

    const bounds = []
      .concat(
        [
          [from.lat, from.lon],
          [to.lat, to.lon],
        ],
        ...filteredItineraries.map(itinerary =>
          [].concat(
            ...itinerary.legs.map(leg =>
              polyline.decode(leg.legGeometry.points),
            ),
          ),
        ),
      )
      .filter(a => a[0] && a[1]);

    const centerPoint = {
      lat: from.lat || to.lat || defaultEndpoint.lat,
      lon: from.lon || to.lon || defaultEndpoint.lon,
    };
    const delta = 0.0269; // this is roughly equal to 3 km
    const defaultBounds = [
      [centerPoint.lat - delta, centerPoint.lon - delta],
      [centerPoint.lat + delta, centerPoint.lon + delta],
    ];

    if (this.showVehicles()) {
      leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
    }
    const locationPopup = // max 5 viapoints
      getIntermediatePlaces(this.context.match.location.query).length < 5
        ? 'all'
        : 'origindestination';

    this.boundsZoom = this.map
      ? this.map.getBoundsZoom(bounds.length > 1 ? bounds : defaultBounds)
      : this.boundsZoom;

    const zoomLevel = this.getZoomLevel(
      this.state.zoomLevel,
      this.mapZoomLevel,
      this.boundsZoom,
    );
    return (
      <MapContainer
        className="summary-map"
        leafletObjs={leafletObjs}
        fitBounds
        bounds={bounds.length > 1 ? bounds : defaultBounds}
        zoom={MAX_ZOOM}
        showScaleBar
        leafletEvents={{
          onZoomend: this.endZoom,
        }}
        geoJsonZoomLevel={zoomLevel}
        locationPopup={locationPopup}
        onSelectLocation={this.selectLocation}
      />
    );
  }

  getOffcanvasState = () => this.state.settingsOpen;

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  internalSetOffcanvas = newState => {
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
            this.setState({
              earlierItineraries: [],
              laterItineraries: [],
              separatorPosition: undefined,
              alternativePlan: undefined,
            });
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
                  },
                  () => {
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

    // Vehicles are typically not shown if they are not in transit. But for some quirk in mqtt, if you
    // search for a route for example tomorrow, real time vehicle would be shown.
    this.inRange =
      (diff <= this.show_vehicles_threshold_minutes && diff >= 0) ||
      (diff >= -1 * this.show_vehicles_threshold_minutes && diff <= 0);

    return (
      this.inRange &&
      this.context.config.showNewMqtt &&
      this.context.config.showVehiclesOnSummaryPage &&
      (this.props.breakpoint === 'large' || this.props.match.params.hash)
    );
  };

  handleScroll = event => {
    const { scrollTop } = event.target;
    const scrolled = scrollTop > 0;
    if (scrolled !== this.state.scrolled) {
      this.setState({ scrolled });
    }
  };

  getCombinedItineraries = () => {
    const itineraries = [
      ...(this.state.earlierItineraries || []),
      ...(this.selectedPlan?.itineraries || []),
      ...(this.state.laterItineraries || []),
    ];
    return itineraries.filter(x => x !== undefined);
  };

  setMapCenterToggle = () => {
    if (!this.mapCenterToggle) {
      this.mapCenterToggle = true;
    } else {
      this.mapCenterToggle = !this.mapCenterToggle;
    }
  };

  getZoomLevel = (stateZoom, mapZoom, boundsZoom) => {
    if (stateZoom === -1) {
      if (mapZoom === -1) {
        return boundsZoom;
      }
      return mapZoom;
    }
    return stateZoom;
  };

  render() {
    const { match, error } = this.props;
    const { walkPlan, bikePlan } = this.state;

    const plan = this.props.viewer && this.props.viewer.plan;

    const bikeParkPlan = this.filteredbikeAndPublic(this.state.bikeParkPlan);
    const bikeAndPublicPlan = this.filteredbikeAndPublic(
      this.state.bikeAndPublicPlan,
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
      this.makeQueryWithAllModes();
      this.makeWalkAndBikeQueries();
    }
    const hasAlternativeItineraries =
      this.state.alternativePlan &&
      this.state.alternativePlan.itineraries &&
      this.state.alternativePlan.itineraries.length > 0;

    this.bikeAndPublicItinerariesToShow = 0;
    this.bikeAndParkItinerariesToShow = 0;
    if (this.props.match.params.hash === 'walk') {
      this.stopClient();
      if (!walkPlan) {
        return <Loading />;
      }
      this.selectedPlan = walkPlan;
    } else if (this.props.match.params.hash === 'bike') {
      this.stopClient();
      if (!bikePlan) {
        return <Loading />;
      }
      this.selectedPlan = bikePlan;
    } else if (this.props.match.params.hash === 'bikeAndVehicle') {
      if (
        !bikeAndPublicPlan ||
        !Array.isArray(bikeAndPublicPlan.itineraries) ||
        !bikeParkPlan ||
        !Array.isArray(bikeParkPlan.itineraries)
      ) {
        return <Loading />;
      }
      if (
        this.hasItinerariesContainingPublicTransit(bikeAndPublicPlan) &&
        this.hasItinerariesContainingPublicTransit(bikeParkPlan)
      ) {
        this.selectedPlan = {
          itineraries: [
            ...bikeParkPlan.itineraries.slice(0, 3),
            ...bikeAndPublicPlan.itineraries.slice(0, 3),
          ],
        };
      } else if (
        this.hasItinerariesContainingPublicTransit(bikeAndPublicPlan)
      ) {
        this.selectedPlan = bikeAndPublicPlan;
      } else if (this.hasItinerariesContainingPublicTransit(bikeParkPlan)) {
        this.selectedPlan = bikeParkPlan;
      }
      this.bikeAndPublicItinerariesToShow = Math.min(
        bikeAndPublicPlan.itineraries.length,
        3,
      );
      this.bikeAndParkItinerariesToShow = Math.min(
        bikeParkPlan.itineraries.length,
        3,
      );
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
    const bikeParkPlanHasItineraries = this.hasItinerariesContainingPublicTransit(
      bikeParkPlan,
    );
    const showBikeAndPublicOptionButton =
      (bikeAndPublicPlanHasItineraries || bikeParkPlanHasItineraries) &&
      !currentSettings.accessibilityOption &&
      currentSettings.includeBikeSuggestions;

    const showStreetModeSelector =
      (showWalkOptionButton ||
        showBikeOptionButton ||
        showBikeAndPublicOptionButton) &&
      this.props.match.params.hash !== 'bikeAndVehicle';

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

    if (
      combinedItineraries &&
      combinedItineraries.length > 0 &&
      this.props.match.params.hash !== 'walk' &&
      this.props.match.params.hash !== 'bikeAndVehicle'
    ) {
      combinedItineraries = combinedItineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      ); // exclude itineraries that have only walking legs from the summary
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
    if (match.routes.some(route => route.printPage) && hasItineraries) {
      return React.cloneElement(this.props.content, {
        itinerary:
          combinedItineraries[hash < combinedItineraries.length ? hash : 0],
        focus: this.updateCenter,
        from,
        to: otpToLocation(match.params.to),
      });
    }
    let bounds;
    let center;
    let sameOriginDestination = false;
    if (!this.state.bounds && !this.state.center) {
      const origin = otpToLocation(match.params.from);
      const destination = otpToLocation(match.params.to);
      if (
        isEqual(origin, this.origin) &&
        isEqual(destination, this.destination)
      ) {
        sameOriginDestination = true;
      }
      if (!sameOriginDestination || this.justMounted) {
        this.origin = origin;
        this.destination = destination;
        bounds = [
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ];

        if (
          hash !== undefined &&
          (combinedItineraries[hash] || combinedItineraries[hash])
        ) {
          const legGeometry = [].concat(
            ...combinedItineraries[hash].legs.map(leg =>
              polyline.decode(leg.legGeometry.points),
            ),
          );
          bounds = []
            .concat(bounds)
            .concat(legGeometry)
            .filter(a => a[0] && a[1]);
          this.useFitBounds = true;
        }
        center = { lat: origin.lat, lon: origin.lon };
      } else if (
        (hash !== undefined && this.props.match.params.hash === 'walk') ||
        this.props.match.params.hash === 'bike'
      ) {
        bounds = [].concat(
          ...combinedItineraries[hash].legs.map(leg =>
            polyline.decode(leg.legGeometry.points),
          ),
        );
        if (isEqual(this.fooAgain, bounds) && this.fooCount > 3) {
          this.useFitBounds = false;
        } else {
          this.useFitBounds = true;
          this.fooAgain = bounds;
          // eslint-disable-next-line no-plusplus
          this.fooCount++;
        }
      }
    } else {
      center = this.state.bounds ? undefined : this.state.center;
      bounds = this.state.center ? undefined : this.state.bounds;
    }

    // Call props.map directly in order to render to same map instance
    let map;
    if (
      this.props.match.params.hash === 'bikeAndVehicle' &&
      !routeSelected(
        match.params.hash,
        match.params.secondHash,
        combinedItineraries,
      )
    ) {
      map = this.renderMap();
    } else {
      map = this.props.map
        ? this.props.map.type(
            {
              itinerary: combinedItineraries && combinedItineraries[hash],
              center,
              bounds,
              showVehicles: this.inRange,
              forceCenter: this.justMounted,
              streetMode: this.state.streetMode,
              fitBounds: this.useFitBounds,
              mapReady: this.mapReady.bind(this),
              mapLoaded: this.mapLoaded,
              ...this.props,
              leafletEvents: {
                onZoomend: this.endZoom,
              },
            },
            this.context,
          )
        : this.renderMap();
      if (this.props.map) {
        this.justMounted = false;
        this.useFitBounds = false;
      }
    }

    let earliestStartTime;
    let latestArrivalTime;

    if (this.selectedPlan?.itineraries && combinedItineraries) {
      earliestStartTime = Math.min(
        ...combinedItineraries.map(i => i.startTime),
      );
      latestArrivalTime = Math.max(...combinedItineraries.map(i => i.endTime));
    }

    const intermediatePlaces = getIntermediatePlaces(match.location.query);

    const loadingStreeModeSelector =
      this.props.loading ||
      this.state.isFetchingWalkAndBike ||
      (!this.state.weatherData.temperature && !this.state.weatherData.err);

    const screenReaderWalkAndBikeUpdateAlert = (
      <span className="sr-only" role="alert">
        <FormattedMessage
          id="itinerary-summary-page-street-mode.update-alert"
          defaultMessage="Walking and biking results updated"
        />
      </span>
    );
    const screenReaderAlert = (
      <>
        <span
          className="sr-only"
          role="alert"
          ref={this.itinerariesLoadedAlertRef}
        >
          <FormattedMessage
            id="itinerary-page.itineraries-loaded"
            defaultMessage="More itineraries loaded"
          />
        </span>
        <span
          className="sr-only"
          role="alert"
          ref={this.itinerariesLoadingAlertRef}
        >
          <FormattedMessage
            id="itinerary-page.loading-itineraries"
            defaultMessage="Loading for more itineraries"
          />
        </span>
        <span
          className="sr-only"
          role="alert"
          ref={this.resultsUpdatedAlertRef}
        >
          <FormattedMessage
            id="itinerary-page.update-alert"
            defaultMessage="Search results updated"
          />
        </span>
      </>
    );

    // added config.itinerary.serviceTimeRange parameter (DT-3175)
    const serviceTimeRange = validateServiceTimeRange(
      this.context.config.itinerary.serviceTimeRange,
      this.props.serviceTimeRange,
    );
    if (this.props.breakpoint === 'large') {
      let content;
      if (
        this.state.loading === false &&
        this.props.loadingPosition === false &&
        (error || (combinedItineraries && this.props.loading === false))
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

          const itineraryTabs = selectedItineraries.map(itinerary => {
            return (
              <div key={itinerary.key}>
                <ItineraryTab
                  hideTitle
                  plan={currentTime}
                  itinerary={itinerary}
                  focus={this.updateCenter}
                  setMapZoomToLeg={this.setMapZoomToLeg}
                  isMobile={false}
                />
              </div>
            );
          });

          content = (
            <div>
              {screenReaderAlert}
              <div className="desktop-title" key="header">
                <div className="title-container h2">
                  <BackButton
                    title={
                      <FormattedMessage
                        id="itinerary-page.title"
                        defaultMessage="Itinerary suggestions"
                      />
                    }
                    icon="icon-icon_arrow-collapse--left"
                    iconClassName="arrow-icon"
                    popFallback
                  />
                </div>
              </div>
              <SwipeableTabs
                tabs={itineraryTabs}
                tabIndex={activeIndex}
                onSwipe={this.changeHash}
                classname="swipe-desktop-view"
              />
            </div>
          );
          return (
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
          );
        }
        content = (
          <>
            {screenReaderAlert}
            <SummaryPlanContainer
              activeIndex={activeIndex}
              plan={this.selectedPlan}
              serviceTimeRange={serviceTimeRange}
              itineraries={selectedItineraries}
              params={match.params}
              error={error || this.state.error}
              bikeAndPublicItinerariesToShow={
                this.bikeAndPublicItinerariesToShow
              }
              bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
              walking={showWalkOptionButton}
              biking={showBikeOptionButton}
              showAlternativePlan={
                planHasNoItineraries && hasAlternativeItineraries
              }
              separatorPosition={this.state.separatorPosition}
              loading={this.state.isFetchingWalkAndBike && !error}
              onLater={this.onLater}
              onEarlier={this.onEarlier}
              loadingMoreItineraries={this.state.loadingMoreItineraries}
            >
              {this.props.content &&
                React.cloneElement(this.props.content, {
                  itinerary: selectedItineraries?.length && selectedItinerary,
                  focus: this.updateCenter,
                  plan: this.selectedPlan,
                })}
            </SummaryPlanContainer>
          </>
        );
      } else {
        this.justMounted = true;
        this.useFitBounds = true;
        this.mapLoaded = false;
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
            <React.Fragment>
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
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeAndPublicPlan}
                  bikeParkPlan={bikeParkPlan}
                  loading={
                    this.props.loading ||
                    this.state.isFetchingWalkAndBike ||
                    this.state.isFetchingWeather
                  }
                />
              )}
              {!loadingStreeModeSelector && screenReaderWalkAndBikeUpdateAlert}
            </React.Fragment>
          }
          content={content}
          settingsDrawer={
            <SettingsDrawer
              open={this.getOffcanvasState()}
              onToggleClick={this.toggleCustomizeSearchOffcanvas}
            />
          }
          map={map}
          scrollable
          scrolled={this.state.scrolled}
          onScroll={this.handleScroll}
        />
      );
    }

    let content;
    let isLoading = false;

    if (
      (!error && (!this.selectedPlan || this.props.loading === true)) ||
      this.state.loading !== false ||
      this.props.loadingPosition === true
    ) {
      this.justMounted = true;
      this.useFitBounds = true;
      this.mapLoaded = false;
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
          focus={this.updateCenter}
          plan={this.selectedPlan}
          serviceTimeRange={this.props.serviceTimeRange}
          setMapZoomToLeg={this.setMapZoomToLeg}
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
              itineraries={combinedItineraries}
              params={match.params}
              error={error || this.state.error}
              from={match.params.from}
              to={match.params.to}
              intermediatePlaces={intermediatePlaces}
              bikeAndPublicItinerariesToShow={
                this.bikeAndPublicItinerariesToShow
              }
              bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
              walking={showWalkOptionButton}
              biking={showBikeOptionButton}
              showAlternativePlan={
                planHasNoItineraries && hasAlternativeItineraries
              }
              separatorPosition={this.state.separatorPosition}
              loading={this.state.isFetchingWalkAndBike && !error}
              onLater={this.onLater}
              onEarlier={this.onEarlier}
              loadingMoreItineraries={this.state.loadingMoreItineraries}
            />
            {screenReaderAlert}
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
            <React.Fragment>
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
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeAndPublicPlan}
                  bikeParkPlan={bikeParkPlan}
                  loading={
                    this.props.loading ||
                    this.state.isFetchingWalkAndBike ||
                    this.state.isFetchingWeather
                  }
                />
              )}
              {!loadingStreeModeSelector && screenReaderWalkAndBikeUpdateAlert}
            </React.Fragment>
          ) : (
            false
          )
        }
        content={content}
        map={map}
        settingsDrawer={
          <SettingsDrawer
            open={this.getOffcanvasState()}
            onToggleClick={this.toggleCustomizeSearchOffcanvas}
            mobile
          />
        }
        mapCenterToggle={this.mapCenterToggle}
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

SummaryPageWithBreakpoint.description = (
  <ComponentUsageExample isFullscreen>
    {isBrowser && <SummaryPageWithBreakpoint {...exampleData} />}
  </ComponentUsageExample>
);

const containerComponent = createRefetchContainer(
  SummaryPageWithBreakpoint,
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
        maxWalkDistance: { type: "Float" }
        wheelchair: { type: "Boolean" }
        ticketTypes: { type: "[String]" }
        disableRemainingWeightHeuristic: { type: "Boolean" }
        arriveBy: { type: "Boolean" }
        transferPenalty: { type: "Int" }
        bikeSpeed: { type: "Float" }
        optimize: { type: "OptimizeType" }
        itineraryFiltering: { type: "Float" }
        unpreferred: { type: "InputUnpreferred" }
        allowedBikeRentalNetworks: { type: "[String]" }
        locale: { type: "String" }
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
