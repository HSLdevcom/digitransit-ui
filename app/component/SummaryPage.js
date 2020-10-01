import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import moment from 'moment';
import React from 'react';
import {
  createFragmentContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import polyline from 'polyline-encoded';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import { connectToStores } from 'fluxible-addons-react';
import isEmpty from 'lodash/isEmpty';
import storeOrigin from '../action/originActions';
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
import { getRoutePath } from '../util/path';
import {
  validateServiceTimeRange,
  getStartTime,
  getStartTimeWithColon,
} from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import ComponentUsageExample from './ComponentUsageExample';
import exampleData from './data/SummaryPage.ExampleData';
import { isBrowser } from '../util/browser';
import { itineraryHasCancelation } from '../util/alertUtils';
import triggerMessage from '../util/messageUtils';
import MessageStore from '../store/MessageStore';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  otpToLocation,
  addressToItinerarySearch,
  getIntermediatePlaces,
} from '../util/otpStrings';
import { startLocationWatch } from '../action/PositionActions';
import { SettingsDrawer } from './SettingsDrawer';

import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import ItineraryTab from './ItineraryTab';
import { StreetModeSelector } from './StreetModeSelector';
import { getCurrentSettings, preparePlanParams } from '../util/planParamUtil';
import { getTotalBikingDistance } from '../util/legUtils';
import { userHasChangedModes } from '../util/modeUtils';

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

export const routeSelected = (hash, secondHash) => {
  if (hash === 'bikeAndPublic') {
    if (secondHash) {
      return true;
    }
    return false;
  }
  if (hash) {
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

const getTopicOptions = (context, plan, match) => {
  const { config } = context;
  const { realTime, feedIds } = config;

  const itineraries = (plan && plan.itineraries) || [];
  const activeIndex = getActiveIndex(match.location, itineraries);
  const itineraryTopics = [];

  if (itineraries.length > 0) {
    itineraries[activeIndex].legs.forEach(leg => {
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
    plan: PropTypes.shape({
      itineraries: PropTypes.array,
    }).isRequired,
    walkPlan: PropTypes.shape({
      itineraries: PropTypes.array,
    }),
    bikePlan: PropTypes.shape({
      itineraries: PropTypes.array,
    }),
    bikeAndPublicPlan: PropTypes.shape({
      itineraries: PropTypes.array,
    }),
    bikeParkPlan: PropTypes.shape({
      itineraries: PropTypes.array,
    }),
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
  };

  static defaultProps = {
    map: undefined,
    error: undefined,
    loading: false,
    loadingPosition: false,
    walkPlan: undefined,
    bikePlan: undefined,
    bikeAndPublicPlan: undefined,
    bikeParkPlan: undefined,
  };

  constructor(props, context) {
    super(props, context);
    this.isFetching = false;
    this.params = this.context.match.params;
    context.executeAction(storeOrigin, otpToLocation(props.match.params.from));
    if (props.error) {
      reportError(props.error);
    }
    this.resultsUpdatedAlertRef = React.createRef();

    // set state correctly if user enters the page from a link
    let existingStreetMode;
    if (this.props.match.location && this.props.match.location.state) {
      existingStreetMode = this.props.match.location.state.streetMode;
    } else if (
      this.props.match.params &&
      this.props.match.params.hash &&
      (this.props.match.params.hash === 'walk' ||
        this.props.match.params.hash === 'bike' ||
        this.props.match.params.hash === 'bikeAndPublic')
    ) {
      existingStreetMode = this.props.match.params.hash;
    } else {
      existingStreetMode = '';
    }

    this.state = {
      weatherData: null,
      center: null,
      loading: false,
      settingsOpen: false,
      bounds: null,
      streetMode: existingStreetMode,
      alternativePlan: undefined,
    };

    if (this.state.streetMode === 'walk') {
      this.selectedPlan = this.props.walkPlan;
    } else if (this.state.streetMode === 'bike') {
      this.selectedPlan = this.props.bikePlan;
    } else if (this.state.streetMode === 'bikeAndPublic') {
      this.selectedPlan = this.props.bikeAndPublicPlan;
    } else {
      this.selectedPlan = this.props.plan;
    }

    if (this.showVehicles()) {
      const itineraryTopics = getTopicOptions(
        this.context,
        this.selectedPlan,
        this.props.match,
      );
      if (itineraryTopics && itineraryTopics.length > 0) {
        this.startClient(itineraryTopics);
      }
    }
  }

  toggleStreetMode = newStreetMode => {
    if (this.state.streetMode === newStreetMode) {
      this.setState({ streetMode: '' }, () => {
        const newState = {
          ...this.context.match.location,
          state: { streetMode: '' },
        };
        const indexPath = `${getRoutePath(
          this.context.match.params.from,
          this.context.match.params.to,
        )}`;
        newState.pathname = indexPath;
        this.context.router.push(newState);
      });
    } else {
      this.setState({ streetMode: newStreetMode }, () => {
        const newState = {
          ...this.context.match.location,
          state: { streetMode: newStreetMode },
        };
        const basePath = getRoutePath(
          this.context.match.params.from,
          this.context.match.params.to,
        );
        const indexPath = `${getRoutePath(
          this.context.match.params.from,
          this.context.match.params.to,
        )}/${newStreetMode}/`;

        newState.pathname = basePath;
        this.context.router.replace(newState);
        newState.pathname = indexPath;
        this.context.router.push(newState);
      });
    }
  };

  setStreetModeAndSelect = newStreetMode => {
    this.setState(
      { streetMode: newStreetMode },
      this.selectFirstItinerary(newStreetMode),
    );
  };

  setStreetMode = newStreetMode => {
    this.setState({ streetMode: newStreetMode });
  };

  resetStreetMode = () => {
    this.setState({ streetMode: '' });
  };

  selectFirstItinerary = newStreetMode => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: 0,
    });
    const newState = {
      ...this.context.match.location,
      state: { summaryPageSelected: 0, streetMode: newStreetMode },
    };

    const indexPath = `${getRoutePath(
      this.context.match.params.from,
      this.context.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = indexPath;
    this.context.router.push(newState);
  };

  planContainsOnlyBiking = plan => {
    if (plan && plan.itineraries && plan.itineraries.length < 2) {
      const legsWithPublic = plan.itineraries[0].legs.filter(
        obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE',
      );
      if (legsWithPublic.length === 0) {
        return true;
      }
      return false;
    }
    return false;
  };

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
    const { storedItineraryTopics } = this.context.getStore(
      'RealTimeInformationStore',
    );
    if (
      itineraryTopics &&
      !isEmpty(itineraryTopics) &&
      !storedItineraryTopics
    ) {
      const clientConfig = this.configClient(itineraryTopics);
      this.context.executeAction(startRealTimeClient, clientConfig);
      this.context.getStore(
        'RealTimeInformationStore',
      ).storedItineraryTopics = itineraryTopics;
    }
  };

  updateClient = itineraryTopics => {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );

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

    if (!isEmpty(itineraryTopics)) {
      this.startClient(itineraryTopics);
    }
  };

  stopClient = () => {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
      this.context.getStore(
        'RealTimeInformationStore',
      ).storedItineraryTopics = undefined;
      this.context.getStore(
        'RealTimeInformationStore',
      ).storedItineraryVehicleInfos = undefined;
    }
  };

  paramsHaveChanged = () => {
    return this.params !== this.context.match.params;
  };

  makeQueryWithAllModes = () => {
    this.setLoading(true);

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
        $ignoreRealtimeUpdates: Boolean
        $maxPreTransitTime: Int
        $walkOnStreetReluctance: Float
        $waitReluctance: Float
        $bikeSpeed: Float
        $bikeSwitchTime: Int
        $bikeSwitchCost: Int
        $optimize: OptimizeType
        $triangle: InputTriangle
        $maxTransfers: Int
        $waitAtBeginningFactor: Float
        $heuristicStepsPerMainStep: Int
        $compactLegsByReversedSearch: Boolean
        $itineraryFiltering: Float
        $modeWeight: InputModeWeight
        $preferred: InputPreferred
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
          ignoreRealtimeUpdates: $ignoreRealtimeUpdates
          maxPreTransitTime: $maxPreTransitTime
          walkOnStreetReluctance: $walkOnStreetReluctance
          waitReluctance: $waitReluctance
          bikeSpeed: $bikeSpeed
          bikeSwitchTime: $bikeSwitchTime
          bikeSwitchCost: $bikeSwitchCost
          optimize: $optimize
          triangle: $triangle
          maxTransfers: $maxTransfers
          waitAtBeginningFactor: $waitAtBeginningFactor
          heuristicStepsPerMainStep: $heuristicStepsPerMainStep
          compactLegsByReversedSearch: $compactLegsByReversedSearch
          itineraryFiltering: $itineraryFiltering
          modeWeight: $modeWeight
          preferred: $preferred
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
            ...PrintableItinerary_itinerary
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

    const planParams = preparePlanParams(this.context.config)(
      this.context.match.params,
      this.context.match,
    );
    const variables = {
      ...planParams,
      modes: [
        { mode: 'WALK' },
        { mode: 'BUS' },
        { mode: 'TRAM' },
        { mode: 'SUBWAY' },
        { mode: 'RAIL' },
        { mode: 'FERRY' },
      ],
    };
    fetchQuery(this.props.relayEnvironment, query, variables).then(
      ({ plan: results }) => {
        this.setState({ alternativePlan: results }, () => {
          this.setLoading(false);
          this.isFetching = false;
          this.params = this.context.match.params;
        });
      },
    );
  };

  componentDidMount() {
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
  }

  componentWillUnmount() {
    if (this.showVehicles()) {
      this.stopClient();
    }
    //  alert screen reader when search results appear
    if (this.resultsUpdatedAlertRef.current) {
      // eslint-disable-next-line no-self-assign
      this.resultsUpdatedAlertRef.current.innerHTML = this.resultsUpdatedAlertRef.current.innerHTML;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.hash &&
      (this.props.match.params.hash === 'walk' ||
        this.props.match.params.hash === 'bike' ||
        this.props.match.params.hash === 'bikeAndPublic')
    ) {
      // Reset url and thus streetmode if intermediate places change
      if (
        !isEqual(
          getIntermediatePlaces(prevProps.match.location.query),
          getIntermediatePlaces(this.props.match.location.query),
        )
      ) {
        const newState = {
          ...this.context.match.location,
          state: { streetMode: '' },
        };
        const indexPath = `${getRoutePath(
          this.context.match.params.from,
          this.context.match.params.to,
        )}`;
        newState.pathname = indexPath;
        this.context.router.push(newState);
      }
      if (this.state.streetMode !== this.props.match.params.hash) {
        this.setStreetMode(this.props.match.params.hash);
      }
    } else if (
      !this.props.match.params ||
      !this.props.match.params.hash ||
      (this.props.match.params.hash === '' &&
        (!this.props.match.params.secondHash ||
          this.props.match.params.secondHash === ''))
    ) {
      if (this.state.streetMode !== '' && !this.state.summaryPageSelected) {
        this.resetStreetMode();
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
      const itineraryTopics = getTopicOptions(
        this.context,
        this.selectedPlan,
        this.props.match,
      );
      if (itineraryTopics && itineraryTopics.length > 0) {
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
    }
    this.setState({ center: { lat, lon }, bounds: null });
  };

  // These are icons that contains sun
  dayNightIconIds = [1, 2, 21, 22, 23, 41, 42, 43, 61, 62, 71, 72, 73];

  checkDayNight = (iconId, hour) => {
    // Show night icons between 00.00 and 06.59
    if (hour >= 0 && hour < 7 && this.dayNightIconIds.includes(iconId)) {
      // Night icon = iconId + 100
      return iconId + 100;
    }
    return iconId;
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const from = otpToLocation(this.props.match.params.from);

    let time;
    if (
      nextProps.plan &&
      nextProps.plan.itineraries &&
      nextProps.plan.itineraries[0] &&
      nextProps.plan.itineraries[0].startTime &&
      time !== nextProps.plan.itineraries[0].startTime
    ) {
      time = nextProps.plan.itineraries[0].startTime;
    } else if (
      this.props.plan.itineraries &&
      this.props.plan.itineraries[0] &&
      this.props.plan.itineraries[0].startTime
    ) {
      time = this.props.plan.itineraries[0].startTime;
    }
    const timem = moment(time);
    if (
      this.context.config.showWeatherInformation &&
      !nextProps.match.params.hash
    ) {
      getWeatherData(
        this.context.config.URL.WEATHER_DATA,
        timem,
        from.lat,
        from.lon,
      ).then(res => {
        if (!Array.isArray(res) || res.length !== 3) {
          return;
        }
        // Icon id's and descriptions: https://www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje ->  Sääsymbolien selitykset ennusteissa.
        const iconId = this.checkDayNight(res[2].ParameterValue, timem.hour());

        this.setState({
          weatherData: {
            temperature: res[0].ParameterValue,
            windSpeed: res[1].ParameterValue,
            iconId,
            weatherId: `${timem}_${from.lat}_{from.lon}`,
          },
        });
      });
    }
    if (!isEqual(nextProps.match.params.from, this.props.match.params.from)) {
      this.context.executeAction(storeOrigin, nextProps.match.params.from);
    }

    if (nextProps.breakpoint === 'large' && this.state.center) {
      this.setState({ center: null });
    }
  }

  setMapZoomToLeg = leg => {
    if (this.props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    this.setState({ bounds: [] });
    const bounds = []
      .concat(
        [
          [leg.from.lat, leg.from.lon],
          [leg.to.lat, leg.to.lon],
        ],
        polyline.decode(leg.legGeometry.points),
      )
      .filter(a => a[0] && a[1]);

    this.setState({
      bounds,
      center: null,
    });
  };

  renderMap() {
    const { match, breakpoint } = this.props;
    // don't render map on mobile
    if (breakpoint !== 'large') {
      return undefined;
    }
    const {
      config: { defaultEndpoint },
    } = this.context;

    const itineraries =
      (this.selectedPlan &&
        this.selectedPlan.itineraries &&
        this.selectedPlan.itineraries.filter(
          itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
        )) ||
      [];

    const activeIndex = getActiveIndex(match.location, itineraries);
    const from = otpToLocation(match.params.from);
    const to = otpToLocation(match.params.to);

    triggerMessage(
      from.lat,
      from.lon,
      this.context,
      this.context.getStore(MessageStore).getMessages(),
    );

    triggerMessage(
      to.lat,
      to.lon,
      this.context,
      this.context.getStore(MessageStore).getMessages(),
    );

    const leafletObjs = sortBy(
      itineraries.map((itinerary, i) => (
        <ItineraryLine
          key={i}
          hash={i}
          legs={itinerary.legs}
          passive={i !== activeIndex}
          showIntermediateStops={i === activeIndex}
        />
      )),
      // Make sure active line isn't rendered over
      i => i.props.passive === false,
    );

    if (from.lat && from.lon) {
      leafletObjs.push(
        <LocationMarker
          key="fromMarker"
          position={from}
          type="from"
          streetMode={this.state.streetMode}
        />,
      );
    }

    if (to.lat && to.lon) {
      leafletObjs.push(
        <LocationMarker
          key="toMarker"
          position={to}
          type="to"
          streetMode={this.state.streetMode}
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
        ...itineraries.map(itinerary =>
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

    let itineraryVehicles = {};
    const gtfsIdsOfRouteAndDirection = [];
    const gtfsIdsOfTrip = [];
    const startTimes = [];

    if (itineraries.length > 0) {
      itineraries[activeIndex].legs.forEach(leg => {
        if (leg.transitLeg && leg.trip) {
          gtfsIdsOfTrip.push(leg.trip.gtfsId);
          startTimes.push(
            getStartTime(leg.trip.stoptimesForDate[0].scheduledDeparture),
          );
          gtfsIdsOfRouteAndDirection.push(
            `${leg.route.gtfsId}_${leg.trip.directionId}`,
          );
        }
      });
    }
    if (startTimes.length > 0) {
      itineraryVehicles = {
        gtfsIdsOfTrip,
        gtfsIdsOfRouteAndDirection,
        startTimes,
      };
    }
    this.context.getStore(
      'RealTimeInformationStore',
    ).storedItineraryVehicleInfos = itineraryVehicles;

    if (!isEmpty(itineraryVehicles)) {
      leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
    }

    return (
      <MapContainer
        className="summary-map"
        leafletObjs={leafletObjs}
        fitBounds
        bounds={bounds.length > 1 ? bounds : defaultBounds}
        showScaleBar
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
      } else {
        this.setState({
          settingsOnOpen: getCurrentSettings(this.context.config, ''),
        });
      }
    } else {
      this.setState({ settingsOpen: newState });
      if (this.props.breakpoint !== 'large') {
        this.context.router.go(-1);
      } else {
        this.setState(
          {
            settingsOnClose: getCurrentSettings(this.context.config, ''),
          },
          // eslint-disable-next-line func-names
          function () {
            if (
              !isEqual(this.state.settingsOnOpen, this.state.settingsOnClose)
            ) {
              window.location.reload();
            }
          },
        );
      }
    }
  };

  showVehicles = () => {
    return (
      this.context.config.showVehiclesOnSummaryPage &&
      (this.props.breakpoint === 'large' || this.props.match.params.hash)
    );
  };

  render() {
    const {
      match,
      error,
      plan,
      walkPlan,
      bikePlan,
      bikeAndPublicPlan,
      bikeParkPlan,
    } = this.props;
    const planHasNoItineraries =
      this.props.plan &&
      this.props.plan.itineraries &&
      this.props.plan.itineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      ).length === 0;
    if (
      planHasNoItineraries &&
      userHasChangedModes(this.context.config) &&
      !this.isFetching &&
      (!this.state.alternativePlan || this.paramsHaveChanged())
    ) {
      this.isFetching = true;
      this.makeQueryWithAllModes();
    }
    const hasAlternativeItineraries =
      this.state.alternativePlan &&
      this.state.alternativePlan.itineraries &&
      this.state.alternativePlan.itineraries.length > 0;

    this.onlyBikeParkItineraries = false;
    this.bikeAndPublicItinerariesToShow = 0;
    this.bikeAndParkItinerariesToShow = 0;
    if (this.state.streetMode === 'walk') {
      this.stopClient();
      this.selectedPlan = walkPlan;
    } else if (this.state.streetMode === 'bike') {
      this.stopClient();
      this.selectedPlan = bikePlan;
    } else if (this.state.streetMode === 'bikeAndPublic') {
      if (
        bikeAndPublicPlan &&
        bikeAndPublicPlan.itineraries &&
        bikeAndPublicPlan.itineraries.length > 0 &&
        !this.planContainsOnlyBiking(bikeAndPublicPlan) &&
        bikeParkPlan &&
        bikeParkPlan.itineraries &&
        bikeParkPlan.itineraries.length > 0
      ) {
        this.bikeAndPublicItinerariesToShow = Math.min(
          bikeParkPlan.itineraries.length,
          3,
        );
        this.bikeAndParkItinerariesToShow = Math.min(
          bikeParkPlan.itineraries.length,
          3,
        );
        const selectedItineraries = [
          ...bikeParkPlan.itineraries.slice(
            0,
            this.bikeAndPublicItinerariesToShow,
          ),
          ...bikeAndPublicPlan.itineraries.slice(
            0,
            this.bikeAndParkItinerariesToShow,
          ),
        ];
        this.selectedPlan = {
          ...bikeAndPublicPlan,
          ...{ itineraries: selectedItineraries },
        };
      } else if (
        bikeAndPublicPlan &&
        bikeAndPublicPlan.itineraries &&
        bikeAndPublicPlan.itineraries.length > 0 &&
        !this.planContainsOnlyBiking(bikeAndPublicPlan)
      ) {
        this.selectedPlan = bikeAndPublicPlan;
      } else {
        this.selectedPlan = bikeParkPlan;
        this.onlyBikeParkItineraries = true;
      }
    } else if (
      planHasNoItineraries &&
      hasAlternativeItineraries &&
      !this.paramsHaveChanged()
    ) {
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
        currentSettings.usingWheelchair !== 1 &&
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
        currentSettings.usingWheelchair !== 1 &&
        currentSettings.includeBikeSuggestions &&
        !bikePlanContainsOnlyWalk &&
        itineraryBikeDistance < this.context.config.suggestBikeMaxDistance,
    );

    const bikeAndPublicPlanHasItineraries =
      bikeAndPublicPlan &&
      bikeAndPublicPlan.itineraries &&
      bikeAndPublicPlan.itineraries.length > 0 &&
      bikeAndPublicPlan.itineraries[0].legs.filter(
        obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE',
      ).length > 0;
    const bikeParkPlanHasItineraries =
      bikeParkPlan &&
      bikeParkPlan.itineraries &&
      bikeParkPlan.itineraries.length > 0 &&
      bikeParkPlan.itineraries[0].legs.filter(
        obj => obj.mode !== 'WALK' && obj.mode !== 'BICYCLE',
      ).length > 0;
    const showBikeAndPublicOptionButton =
      (bikeAndPublicPlanHasItineraries || bikeParkPlanHasItineraries) &&
      currentSettings.usingWheelchair !== 1 &&
      currentSettings.includeBikeSuggestions;

    const showStreetModeSelector =
      (showWalkOptionButton ||
        showBikeOptionButton ||
        showBikeAndPublicOptionButton) &&
      this.state.streetMode !== 'bikeAndPublic';

    const hasItineraries =
      this.selectedPlan && Array.isArray(this.selectedPlan.itineraries);

    let itineraries = hasItineraries ? this.selectedPlan.itineraries : [];

    // Remove old itineraries if new query cannot find a route
    if (error && hasItineraries) {
      itineraries = [];
    }
    // filter out walk only itineraries from main results
    if (this.state.streetMode !== 'walk' && this.state.streetMode !== 'bike') {
      itineraries = itineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      );
    }

    const hash = getHashNumber(
      this.props.match.params.secondHash
        ? this.props.match.params.secondHash
        : this.props.match.params.hash,
    );

    const from = otpToLocation(match.params.from);
    if (match.routes.some(route => route.printPage) && hasItineraries) {
      return React.cloneElement(this.props.content, {
        itinerary: itineraries[hash],
        focus: this.updateCenter,
        from,
        to: otpToLocation(match.params.to),
      });
    }
    let bounds;
    let center;
    if (!this.state.bounds && !this.state.center) {
      center = { lat: from.lat, lon: from.lon };
    } else {
      center = this.state.bounds ? undefined : this.state.center;
      bounds = this.state.center ? undefined : this.state.bounds;
    }
    // Call props.map directly in order to render to same map instance
    let map;
    if (
      this.state.streetMode === 'bikeAndPublic' &&
      !routeSelected(match.params.hash, match.params.secondHash)
    ) {
      map = this.renderMap();
    } else {
      map = this.props.map
        ? this.props.map.type(
            {
              itinerary: itineraries && itineraries[hash],
              center,
              bounds,
              streetMode: this.state.streetMode,
              fitBounds: Boolean(bounds),
              ...this.props,
            },
            this.context,
          )
        : this.renderMap();
    }

    let earliestStartTime;
    let latestArrivalTime;

    if (hasItineraries) {
      earliestStartTime = Math.min(...itineraries.map(i => i.startTime));
      latestArrivalTime = Math.max(...itineraries.map(i => i.endTime));
    }

    const intermediatePlaces = getIntermediatePlaces(match.location.query);

    const screenReaderUpdateAlert = (
      <span className="sr-only" role="alert" ref={this.resultsUpdatedAlertRef}>
        <FormattedMessage
          id="itinerary-page.update-alert"
          defaultMessage="Search results updated"
        />
      </span>
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
        this.props.loading === false &&
        (error || this.selectedPlan)
      ) {
        if (
          routeSelected(match.params.hash, match.params.secondHash) &&
          itineraries.length > 0
        ) {
          content = (
            <>
              {screenReaderUpdateAlert}
              <ItineraryTab
                key={hash.toString()}
                activeIndex={getActiveIndex(match.location, itineraries)}
                plan={this.selectedPlan}
                serviceTimeRange={serviceTimeRange}
                itinerary={
                  itineraries[getActiveIndex(match.location, itineraries)]
                }
                params={match.params}
                error={error || this.state.error}
                setLoading={this.setLoading}
                setError={this.setError}
                focus={this.updateCenter}
                setMapZoomToLeg={this.setMapZoomToLeg}
                resetStreetMode={this.resetStreetMode}
              />
            </>
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
            {screenReaderUpdateAlert}
            <SummaryPlanContainer
              activeIndex={getActiveIndex(match.location, itineraries)}
              plan={this.selectedPlan}
              serviceTimeRange={serviceTimeRange}
              itineraries={itineraries}
              params={match.params}
              error={error || this.state.error}
              setLoading={this.setLoading}
              setError={this.setError}
              toggleSettings={this.toggleCustomizeSearchOffcanvas}
              bikeAndPublicItinerariesToShow={
                this.bikeAndPublicItinerariesToShow
              }
              bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
              walking={showWalkOptionButton}
              biking={showBikeOptionButton}
              showAlternativePlan={
                planHasNoItineraries && hasAlternativeItineraries
              }
            >
              {this.props.content &&
                React.cloneElement(this.props.content, {
                  itinerary: hasItineraries && itineraries[hash],
                  focus: this.updateCenter,
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
      }
      return (
        <DesktopView
          title={
            <FormattedMessage
              id="summary-page.title"
              defaultMessage="Itinerary suggestions"
            />
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
              {showStreetModeSelector && (
                <StreetModeSelector
                  showWalkOptionButton={showWalkOptionButton}
                  showBikeOptionButton={showBikeOptionButton}
                  showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeParkPlan || bikeAndPublicPlan}
                />
              )}
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
          bckBtnColor={this.context.config.colors.primary}
        />
      );
    }

    let content;

    if (
      (!error && !this.selectedPlan) ||
      this.state.loading !== false ||
      this.props.loading !== false ||
      this.props.loadingPosition === true
    ) {
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <Loading />
        </div>
      );
    } else if (
      routeSelected(match.params.hash, match.params.secondHash) &&
      itineraries.length > 0
    ) {
      content = (
        <MobileItineraryWrapper
          itineraries={itineraries}
          params={match.params}
          focus={this.updateCenter}
          plan={this.props.plan}
          serviceTimeRange={this.props.serviceTimeRange}
          setMapZoomToLeg={this.setMapZoomToLeg}
        >
          {this.props.content &&
            itineraries.map((itinerary, i) =>
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
      content = (
        <>
          <SummaryPlanContainer
            activeIndex={getActiveIndex(match.location, itineraries)}
            plan={this.selectedPlan}
            serviceTimeRange={serviceTimeRange}
            itineraries={itineraries}
            params={match.params}
            error={error || this.state.error}
            setLoading={this.setLoading}
            setError={this.setError}
            from={match.params.from}
            to={match.params.to}
            intermediatePlaces={intermediatePlaces}
            toggleSettings={this.toggleCustomizeSearchOffcanvas}
            bikeAndPublicItinerariesToShow={this.bikeAndPublicItinerariesToShow}
            bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
            showAlternativePlan={
              planHasNoItineraries && hasAlternativeItineraries
            }
          />
          {screenReaderUpdateAlert}
        </>
      );
    }

    return (
      <MobileView
        header={
          !routeSelected(match.params.hash, match.params.secondHash) ? (
            <React.Fragment>
              <SummaryNavigation
                params={match.params}
                serviceTimeRange={serviceTimeRange}
                startTime={earliestStartTime}
                endTime={latestArrivalTime}
                toggleSettings={this.toggleCustomizeSearchOffcanvas}
              />
              {showStreetModeSelector && (
                <StreetModeSelector
                  showWalkOptionButton={showWalkOptionButton}
                  showBikeOptionButton={showBikeOptionButton}
                  showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
                  weatherData={this.state.weatherData}
                  walkPlan={walkPlan}
                  bikePlan={bikePlan}
                  bikeAndPublicPlan={bikeParkPlan || bikeAndPublicPlan}
                />
              )}
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

// Handle geolocationing when url contains POS as origin/destination
const PositioningWrapper = connectToStores(
  SummaryPageWithBreakpoint,
  ['PositionStore'],
  (context, props) => {
    const { from, to } = props.match.params;
    if (from !== 'POS' && to !== 'POS') {
      return props;
    }

    const locationState = context.getStore('PositionStore').getLocationState();
    if (locationState.locationingFailed) {
      // Error message is displayed by locationing message bar
      return { ...props, loadingPosition: false };
    }

    if (
      locationState.isLocationingInProgress ||
      locationState.isReverseGeocodingInProgress
    ) {
      return { ...props, loadingPosition: true };
    }

    if (locationState.hasLocation) {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === 'POS' ? locationForUrl : from;
      const newTo = to === 'POS' ? locationForUrl : to;
      const newLocation = {
        ...props.match.location,
        pathname: getRoutePath(newFrom, newTo),
      };
      props.router.replace(newLocation);
      return { ...props, loadingPosition: false };
    }

    // locationing not started...
    context.executeAction(startLocationWatch);
    return { ...props, loadingPosition: true };
  },
);

PositioningWrapper.contextTypes = {
  ...PositioningWrapper.contextTypes,
  executeAction: PropTypes.func.isRequired,
};

const containerComponent = createFragmentContainer(PositioningWrapper, {
  plan: graphql`
    fragment SummaryPage_plan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
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
  `,
  walkPlan: graphql`
    fragment SummaryPage_walkPlan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        walkDistance
        duration
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
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
  `,
  bikePlan: graphql`
    fragment SummaryPage_bikePlan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
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
  `,
  bikeAndPublicPlan: graphql`
    fragment SummaryPage_bikeAndPublicPlan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
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
  `,
  bikeParkPlan: graphql`
    fragment SummaryPage_bikeParkPlan on Plan {
      ...SummaryPlanContainer_plan
      ...ItineraryTab_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryTab_itinerary
        ...PrintableItinerary_itinerary
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
  `,
  serviceTimeRange: graphql`
    fragment SummaryPage_serviceTimeRange on serviceTimeRange {
      start
      end
    }
  `,
});

export {
  containerComponent as default,
  SummaryPageWithBreakpoint as Component,
};
