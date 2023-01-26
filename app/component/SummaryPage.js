/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
  useFragment,
  useLazyLoadQuery,
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
import { planQuery, moreItinerariesQuery, allModesQuery, walkAndBikeQuery } from '../util/queryUtils';
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
  if (hash === 'bikeAndVehicle' || hash === 'parkAndRide') {
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
        const feedId = leg.trip.gtfsId.split(':')[0];
        let topic;
        if (realTime && feedIds.includes(feedId)) {
          if (realTime[feedId] && realTime[feedId].useFuzzyTripMatching) {
            topic = {
              feedId,
              route: leg.route.gtfsId.split(':')[1],
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
              route: leg.route.gtfsId.split(':')[1],
              tripId: leg.trip.gtfsId.split(':')[1],
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

let secondQuerySent = false;
let allModesQueryDone = false;
let isFetching = false;

const SummaryPage = (props, context) => {
  let params, query;
  const { match } = props;

  const setParamsAndQuery = () => {
    params = context.match.params;
    query = context.match.location.query;
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

  const resetSummaryPageSelection = () => {
    context.router.replace({
      ...context.match.location,
      state: {
        ...context.match.location.state,
        summaryPageSelected: undefined,
      },
    });
  };

  setParamsAndQuery()
  let originalPlan = props.viewer && props.viewer.plan;
  let expandMap = 0;

  if (props.error) {
    reportError(props.error);
  }

  let tabHeaderRef = React.createRef(null);
  let headerRef = React.createRef();
  let contentRef = React.createRef();
  let show_vehicles_threshold_minutes = 720;
  setCurrentTimeToURL(context.config, props.match)
  let isFirstRender = React.useRef(true)
  let mwtRef;
  let pendingWeatherHash = undefined

  const [state, setState] = React.useState({
    weatherData: {},
    loading: false,
    alternativePlan: undefined,
    earlierItineraries: [],
    laterItineraries: [],
    previouslySelectedPlan: props.viewer && props.viewer.plan,
    separatorPosition: undefined,
    walkPlan: undefined,
    bikePlan: undefined,
    bikeAndPublicPlan: undefined,
    bikeParkPlan: undefined,
    carPlan: undefined,
    parkRidePlan: undefined,
    loadingMoreItineraries: undefined,
    itineraryTopics: undefined,
    isFetchingWalkAndBike: hasStartAndDestination(props.match.params),
    isFetchingWeather: true,
    settingsChangedRecently: false,
    settingsOnOpen: undefined,
  })
  const [weatherCallback, setWeatherCallback] = useState(undefined)
  const [refetchCallback, setRefetchCallback] = useState(undefined)
  const [resetSelectionCallback, setResetSelectionCallback] = useState(undefined)
  const [allModesCallback, setAllModesCallback] = useState(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetWalkAndBikeCallback, setResetWalkAndBikeCallback] = useState(undefined)
  const [screenReaderCallback, setScreenReaderCallback] = useState(undefined)

  let selectedPlan;
  if (props.match.params.hash === 'walk') {
    selectedPlan = state.walkPlan;
  } else if (props.match.params.hash === 'bike') {
    selectedPlan = state.bikePlan;
  } else if (props.match.params.hash === 'bikeAndVehicle') {
    selectedPlan = {
      itineraries: [
        ...(state.bikeParkPlan?.itineraries || []),
        ...(state.bikeAndPublicPlan?.itineraries || []),
      ],
    };
  } else if (state.streetMode === 'car') {
    selectedPlan = state.carPlan;
  } else if (state.streetMode === 'parkAndRide') {
    selectedPlan = state.parkRidePlan;
  } else {
    selectedPlan = props.viewer && props.viewer.plan;
  }

  const makeQueryWithAllModes = () => {
    setState({ ...state, loading: true })

    resetSummaryPageSelection();

    const query = allModesQuery

    const planParams = preparePlanParams(context.config, true)(
      context.match.params,
      context.match,
    );
    fetchQuery(props.relayEnvironment, query, planParams, {
      force: true,
    })
      .toPromise()
      .then(({ plan: results }) => {
        setState({
          ...state,
          alternativePlan: results,
          earlierItineraries: [],
          laterItineraries: [],
          separatorPosition: undefined,
        })
        setAllModesCallback(true)
      });
  };

  const makeWalkAndBikeQueries = () => {
    const query = walkAndBikeQuery

    const planParams = preparePlanParams(context.config, false)(
      context.match.params,
      context.match,
    );

    fetchQuery(props.relayEnvironment, query, planParams)
      .toPromise()
      .then(result => {
        setState({
          ...state,
          isFetchingWalkAndBike: false,
          loading: false,
          walkPlan: result.walkPlan,
          bikePlan: result.bikePlan,
          bikeAndPublicPlan: result.bikeAndPublicPlan,
          bikeParkPlan: result.bikeParkPlan,
          carPlan: result.carPlan,
          parkRidePlan: result.parkRidePlan,
        })
        setWeatherCallback(true)
      })
      .catch(() => {
        setState({ ...state, isFetchingWalkAndBike: false });
      });
  };

  /** EFFECTS **/
  useEffect(() => {
    updateLocalStorage(true)
    const host =
      context.headers &&
      (context.headers['x-forwarded-host'] || context.headers.host)

      if (
      get(context, 'config.showHSLTracking', false) &&
      host &&
      host.indexOf('127.0.0.1') === -1 &&
      host.indexOf('localhost') === -1
    ) {
      // eslint-disable-next-line no-unused-expressions
      import('../util/feedbackly');
    }
    if (showVehicles()) {
      const { client } = context.getStore('RealTimeInformationStore');
      // If user comes from eg. RoutePage, old client may not have been completely shut down yet.
      // This will prevent situation where RoutePages vehicles would appear on SummaryPage
      if (!client) {
        const combinedItineraries = getCombinedItineraries();
        const itineraryTopics = getTopicOptions(
          context,
          combinedItineraries,
          props.match,
        );
        startClient(itineraryTopics);
        setState({ ...state, itineraryTopics });
      }
    }
    /* A query with all modes is made on page load if relevant settings ('modes', 'walkBoardCost', 'ticketTypes', 'walkReluctance') differ from defaults. The all modes query uses default settings. */
    if (
      relevantRoutingSettingsChanged(context.config) &&
      hasStartAndDestination(context.match.params) && !allModesQueryDone
    ) {
      makeQueryWithAllModes();
    }
  }, [])

  useEffect(() => {
    // Don't make right away on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    }
    setCurrentTimeToURL(context.config, props.match)
    // screen reader alert when new itineraries are fetched
    if (
      props.match.params.hash === undefined &&
      props.viewer &&
      props.viewer.plan &&
      props.viewer.plan.itineraries &&
      !secondQuerySent
    ) {
      showScreenreaderLoadedAlert();
    }

    const viaPoints = getIntermediatePlaces(props.match.location.query);

    // Reset walk and bike suggestions when new search is made
    if (
      selectedPlan !== state.alternativePlan &&
      !isEqual(
        props.viewer && props.viewer.plan,
        originalPlan,
      ) &&
      paramsOrQueryHaveChanged() &&
      secondQuerySent &&
      !state.isFetchingWalkAndBike
    ) {
      setParamsAndQuery();
      secondQuerySent = false;
      // eslint-disable-next-line react/no-did-update-set-state
      setState({ ...state, 
        isFetchingWalkAndBike: true,
        walkPlan: undefined,
        bikePlan: undefined,
        bikeAndPublicPlan: undefined,
        bikeParkPlan: undefined,
        carPlan: undefined,
        parkRidePlan: undefined,
        earlierItineraries: [],
        laterItineraries: [],
        weatherData: {},
        separatorPosition: undefined,
        alternativePlan: undefined, 
        })
      setResetWalkAndBikeCallback(true)
      }

    // Public transit routes fetched, now fetch walk and bike itineraries
    if (
      props.viewer &&
      props.viewer.plan &&
      props.viewer.plan.itineraries &&
      !secondQuerySent
    ) {
      originalPlan = props.viewer.plan;
      secondQuerySent = true;
      if (
        !isEqual(
          otpToLocation(context.match.params.from),
          otpToLocation(context.match.params.to),
        ) ||
        viaPoints.length > 0
      ) {
        makeWalkAndBikeQueries();
      } else {
        // eslint-disable-next-line react/no-did-update-set-state
        setState({ ...state, isFetchingWalkAndBike: false });
      }
    }

    if (props.error) {
      reportError(props.error);
    }
    if (showVehicles()) {
      let combinedItineraries = getCombinedItineraries();
      if (
        combinedItineraries.length > 0 &&
        props.match.params.hash !== 'walk' &&
        props.match.params.hash !== 'bikeAndVehicle'
      ) {
        combinedItineraries = combinedItineraries.filter(
          itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
        ); // exclude itineraries that have only walking legs from the summary
      }
      const itineraryTopics = getTopicOptions(
        context,
        combinedItineraries,
        props.match,
      );
      const { client } = context.getStore('RealTimeInformationStore');
      // Client may not be initialized yet if there was an client before ComponentDidMount
      if (!isEqual(itineraryTopics, state.itineraryTopics) || !client) {
        updateClient(itineraryTopics);
      }
      if (!isEqual(itineraryTopics, state.itineraryTopics)) {
        // eslint-disable-next-line react/no-did-update-set-state
        setState({ ...state, itineraryTopics: itineraryTopics });
      }
    }
  })
  
  /** EFFECTS END **/

  /** EFFECT CALLBACKS **/

  // Make weather query after walkAndBikeQuery
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!weatherCallback) {
      return
    }
    setState({ ...state, isFetchingWalkAndBike: false })
    makeWeatherQuery()
    // Cleanup
    setWeatherCallback(undefined)
  }, [weatherCallback])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!refetchCallback) {
      return
    }
    const planParams = preparePlanParams(context.config, false)(
      context.match.params,
      context.match,
    );
    
    props.relay.refetch(planParams, null, () => {
      setState(
        {
          ...state,
          loading: false,
          earlierItineraries: [],
          laterItineraries: [],
          separatorPosition: undefined,
          alternativePlan: undefined,
          settingsChangedRecently: true,
        },
      );
      setResetSelectionCallback(true)
    });
    // Cleanup
    setRefetchCallback(undefined)
  }, [refetchCallback])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!resetSelectionCallback) {
      return
    }

    context.router.replace({
      ...context.match.location,
      state: {
        ...context.match.location.state,
        summaryPageSelected: undefined,
      },
    });

    // Clean up
    setResetSelectionCallback(undefined)
  }, [resetSelectionCallback])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!allModesCallback) {
      return
    }

    setLoading(false)
    setState({ ...state, loading: false })
    isFetching = false;
    setParamsAndQuery()
    allModesQueryDone = true

    // Clean up
    setAllModesCallback(undefined)
  }, [allModesCallback])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!resetWalkAndBikeCallback) {
      return
    }

    const hasNonWalkingItinerary = selectedPlan?.itineraries?.some(
      itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
    );
    if (
      relevantRoutingSettingsChanged(context.config) &&
      hasStartAndDestination(context.match.params) &&
      hasNonWalkingItinerary
    ) {
      makeQueryWithAllModes();
    }

    // Cleanup
    setResetWalkAndBikeCallback(undefined)
  }, [resetWalkAndBikeCallback])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return
    } else if (!screenReaderCallback) {
      return
    }

    showScreenreaderUpdatedAlert()
  }, [screenReaderCallback])

  /** EFFECT CALLBACKS END **/

  /** FUNCTIONS **/

  const setLoading = loading => {
    setState({ ...state, loading: loading });
  };

  const onlyHasWalkingItineraries = () => {
    return (
      planHasNoItineraries() &&
      (planHasNoStreetModeItineraries() || isWalkingFastest())
    );
  };

  const isWalkingFastest = () => {
    const walkDuration = getDuration(state.walkPlan);
    const bikeDuration = getDuration(state.bikePlan);
    const carDuration = getDuration(state.carPlan);
    const parkAndRideDuration = getDuration(state.parkRidePlan);
    const bikeParkDuration = getDuration(state.bikeParkPlan);
    let bikeAndPublicDuration;
    if (context.config.includePublicWithBikePlan) {
      bikeAndPublicDuration = getDuration(state.bikeAndPublicPlan);
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

  const getDuration = plan => {
    if (!plan) {
      return null;
    }
    const min = Math.min(...plan.itineraries.map(itin => itin.duration));
    return min;
  };

  const isLoading = (onlyWalkingItins, onlyWalkingAlternatives) => {
    if (state.loading) {
      return true;
    }
    if (!state.loading && onlyWalkingItins && onlyWalkingAlternatives) {
      return false;
    }
    return false;
  };

  const shouldShowSettingsChangedNotification = (plan, alternativePlan) => {
    if (
      relevantRoutingSettingsChanged(context.config) &&
      !state.settingsChangedRecently &&
      !planHasNoItineraries() &&
      compareItineraries(plan?.itineraries, alternativePlan?.itineraries)
    ) {
      return true;
    }
    return false;
  };

  const toggleStreetMode = newStreetMode => {
    const newState = {
      ...context.match.location,
      state: { summaryPageSelected: 0 },
    };
    const basePath = getSummaryPath(
      context.match.params.from,
      context.match.params.to,
    );
    const indexPath = `${getSummaryPath(
      context.match.params.from,
      context.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    context.router.replace(newState);
    newState.pathname = indexPath;
    context.router.push(newState);
  };

  const setStreetModeAndSelect = newStreetMode => {
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'OpenItineraryDetailsWithMode',
      name: newStreetMode,
    });
    selectFirstItinerary(newStreetMode);
  };

  const selectFirstItinerary = newStreetMode => {
    const newState = {
      ...context.match.location,
      state: { summaryPageSelected: 0 },
    };

    const basePath = `${getSummaryPath(
      context.match.params.from,
      context.match.params.to,
    )}`;
    const indexPath = `${getSummaryPath(
      context.match.params.from,
      context.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    context.router.replace(newState);
    newState.pathname = indexPath;
    context.router.push(newState);
  };

  const hasItinerariesContainingPublicTransit = plan => {
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

  const planHasNoItineraries = () =>
    props.viewer &&
    props.viewer.plan &&
    props.viewer.plan.itineraries &&
    props.viewer.plan.itineraries.filter(
      itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
    ).length === 0;

  const planHasNoStreetModeItineraries = () =>
    (!state.bikePlan?.itineraries ||
      state.bikePlan.itineraries.length === 0) &&
    (!state.carPlan?.itineraries ||
      state.carPlan.itineraries.length === 0) &&
    (!state.parkRidePlan?.itineraries ||
      state.parkRidePlan.itineraries.length === 0) &&
    (!state.bikeParkPlan?.itineraries ||
      state.bikeParkPlan.itineraries.length === 0) &&
    (context.config.includePublicWithBikePlan
      ? !state.bikeAndPublicPlan?.itineraries ||
        state.bikeAndPublicPlan.itineraries.length === 0
      : true);

  const configClient = itineraryTopics => {
    const { config } = context;
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

  const startClient = itineraryTopics => {
    if (itineraryTopics && !isEmpty(itineraryTopics)) {
      const clientConfig = configClient(itineraryTopics);
      context.executeAction(startRealTimeClient, clientConfig);
    }
  };

  const updateClient = itineraryTopics => {
    const { client, topics } = context.getStore(
      'RealTimeInformationStore',
    );

    if (isEmpty(itineraryTopics) && client) {
      stopClient();
      return;
    }
    if (client) {
      const clientConfig = configClient(itineraryTopics);
      if (clientConfig) {
        context.executeAction(changeRealTimeClientTopics, {
          ...clientConfig,
          client,
          oldTopics: topics,
        });
        return;
      }
      stopClient();
    }
    startClient(itineraryTopics);
  };

  const stopClient = () => {
    const { client } = context.getStore('RealTimeInformationStore');
    if (client && state.itineraryTopics) {
      context.executeAction(stopRealTimeClient, client);
      setState({ ...state, itineraryTopics: undefined });
    }
  };

  const paramsOrQueryHaveChanged = () => {
    return (
      !isEqual(params, context.match.params) ||
      !isEqual(query, context.match.location.query)
    );
  };

  const onLater = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });
    setState({ ...state, loadingMoreItineraries: reversed ? 'top' : 'bottom' });
    showScreenreaderLoadingAlert();

    const end = moment.unix(props.serviceTimeRange.end);
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
      setError('no-route-end-date-not-in-range');
      setLoading(false);
      return;
    }

    const useDefaultModes =
      planHasNoItineraries() && state.alternativePlan;

    const params = preparePlanParams(context.config, useDefaultModes)(
      context.match.params,
      context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: false,
      date: latestDepartureTime.format('YYYY-MM-DD'),
      time: latestDepartureTime.format('HH:mm'),
    };

    setModeToParkRideIfSelected(tunedParams);

    fetchQuery(props.relayEnvironment, moreItinerariesQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
        showScreenreaderLoadedAlert();
        if (reversed) {
          const reversedItineraries = result.itineraries
            .slice() // Need to copy because result is readonly
            .reverse()
            .filter(
              itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
            );
          // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
          setState(prevState => {
            return {
              ...state,
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
          resetSummaryPageSelection();
        } else {
          setState(prevState => {
            return {
              ...state,
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
            if (props.plan.date >= max) {
              newTime = moment(props.plan.date).add(5, 'minutes');
            } else {
              newTime = moment(max).add(1, 'minutes');
            }
            */
        // props.setLoading(false);
        /* replaceQueryParams(context.router, context.match, {
              time: newTime.unix(),
            }); */
      });
    // }
  };

  const onEarlier = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowEarlierItineraries',
      name: null,
    });
    setState({ ...state, loadingMoreItineraries: reversed ? 'bottom' : 'top' });
    showScreenreaderLoadingAlert();

    const start = moment.unix(props.serviceTimeRange.start);
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
      setError('no-route-start-date-too-early');
      setLoading(false);
      return;
    }

    const useDefaultModes =
      planHasNoItineraries() && state.alternativePlan;

    const params = preparePlanParams(context.config, useDefaultModes)(
      context.match.params,
      context.match,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: true,
      date: earliestArrivalTime.format('YYYY-MM-DD'),
      time: earliestArrivalTime.format('HH:mm'),
    };

    setModeToParkRideIfSelected(tunedParams);

    fetchQuery(props.relayEnvironment, moreItinerariesQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
        if (result.itineraries.length === 0) {
          // Could not find routes arriving at original departure time
          // --> cannot calculate earlier start time
          setError('no-route-start-date-too-early');
        }
        showScreenreaderLoadedAlert();
        if (reversed) {
          setState(prevState => {
            return {
              ...state,
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
          setState(prevState => {
            return {
              ...state,
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

          resetSummaryPageSelection();
        }
      });
  };

  // save url-defined location to old searches
  const saveUrlSearch = endpoint => {
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

    context.executeAction(saveSearch, {
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

  const updateLocalStorage = saveEndpoints => {
    const { location } = props.match;
    const { query } = location;
    const pathArray = decodeURIComponent(location.pathname)
      .substring(1)
      .split('/');
    // endpoints to oldSearches store
    if (saveEndpoints && isIOS && query.save) {
      if (query.save === '1' || query.save === '2') {
        saveUrlSearch(pathArray[1]); // origin
      }
      if (query.save === '1' || query.save === '3') {
        saveUrlSearch(pathArray[2]); // destination
      }
      const newLocation = { ...location };
      delete newLocation.query.save;
      context.router.replace(newLocation);
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
    context.executeAction(saveFutureRoute, itinerarySearch);
  };

  const setModeToParkRideIfSelected = (tunedParams) => {
    if (props.match.params.hash === 'parkAndRide') {
      // eslint-disable-next-line no-param-reassign
      tunedParams.modes = [
        { mode: 'CAR', qualifier: 'PARK' },
        { mode: 'TRANSIT' },
      ];
    }
  }

  const setError = error => {
    reportError(error);
    setState({ ...state, error });
  };

  const setMWTRef = ref => {
    mwtRef = ref;
  };

  // make the map to obey external navigation
  const navigateMap = () => {
    // map sticks to user location if tracking is on, so set it off
    if (mwtRef?.disableMapTracking) {
      mwtRef.disableMapTracking();
    }
    // map will not react to location props unless they change or update is forced
    if (mwtRef?.forceRefresh) {
      mwtRef.forceRefresh();
    }
  };

  const focusToPoint = (lat, lon) => {
    if (props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      expandMap += 1;
    }
    navigateMap();
    setState({ ...state, center: { lat, lon }, bounds: null });
  };

  const focusToLeg = leg => {
    if (props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      expandMap += 1;
    }
    navigateMap();
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
    setState({
      ...state,
      bounds,
      center: undefined,
    });
  };

  const checkDayNight = (iconId, timem, lat, lon) => {
    // These are icons that contains sun
    let dayNightIconIds = [1, 2, 21, 22, 23, 41, 42, 43, 61, 62, 71, 72, 73];

    const date = timem.toDate();
    const dateMillis = date.getTime();
    const sunCalcTimes = SunCalc.getTimes(date, lat, lon);
    const sunrise = sunCalcTimes.sunrise.getTime();
    const sunset = sunCalcTimes.sunset.getTime();
    if (
      (sunrise > dateMillis || sunset < dateMillis) &&
      dayNightIconIds.includes(iconId)
    ) {
      // Night icon = iconId + 100
      return iconId + 100;
    }
    return iconId;
  };

  const filterOnlyBikeAndWalk = itineraries => {
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

  const filteredbikeAndPublic = plan => {
    return {
      itineraries: filterOnlyBikeAndWalk(plan?.itineraries),
    };
  };

  const makeWeatherQuery = () => {
    const from = otpToLocation(props.match.params.from);
    const { walkPlan, bikePlan } = state;
    const bikeParkPlan = filteredbikeAndPublic(state.bikeParkPlan);
    const bikeAndPublicPlan = filteredbikeAndPublic(
      state.bikeAndPublicPlan,
    );
    const itin =
      (walkPlan && walkPlan.itineraries && walkPlan.itineraries[0]) ||
      (bikePlan && bikePlan.itineraries && bikePlan.itineraries[0]) ||
      (bikeAndPublicPlan &&
        bikeAndPublicPlan.itineraries &&
        bikeAndPublicPlan.itineraries[0]) ||
      (bikeParkPlan && bikeParkPlan.itineraries && bikeParkPlan.itineraries[0]);

    if (itin && context.config.showWeatherInformation) {
      const time = itin.startTime;
      const weatherHash = `${time}_${from.lat}_${from.lon}`;
      if (
        weatherHash !== state.weatherData.weatherHash &&
        weatherHash !== pendingWeatherHash
      ) {
        pendingWeatherHash = weatherHash;
        const timem = moment(time);
        setState({ ...state, isFetchingWeather: true });
        getWeatherData(
          context.config.URL.WEATHER_DATA,
          timem,
          from.lat,
          from.lon,
        )
          .then(res => {
            if (weatherHash === pendingWeatherHash) {
              // no cascading fetches
              pendingWeatherHash = undefined;
              let weatherData = {};
              if (Array.isArray(res) && res.length === 3) {
                weatherData = {
                  temperature: res[0].ParameterValue,
                  windSpeed: res[1].ParameterValue,
                  weatherHash,
                  time,
                  // Icon id's and descriptions: https://www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje ->  Sääsymbolien selitykset ennusteissa.
                  iconId: checkDayNight(
                    res[2].ParameterValue,
                    timem,
                    from.lat,
                    from.lon,
                  ),
                };
              }
              setState({ ...state, isFetchingWeather: false, weatherData });
            }
          })
          .catch(err => {
            pendingWeatherHash = undefined;
            setState({ ...state, isFetchingWeather: false, weatherData: { err } });
          })
          .finally(() => {
            if (props.alertRef.current) {
              props.alertRef.current.innerHTML = context.intl.formatMessage(
                {
                  id: 'itinerary-summary-page-street-mode.update-alert',
                  defaultMessage: 'Walking and biking results updated',
                },
              );
              setTimeout(() => {
                props.alertRef.current.innerHTML = null;
              }, 100);
            }
          });
      }
    }
  }

  const showScreenreaderLoadedAlert = () => {
    if (props.alertRef.current) {
      if (props.alertRef.current.innerHTML) {
        props.alertRef.current.innerHTML = null;
      }
      props.alertRef.current.innerHTML = context.intl.formatMessage({
        id: 'itinerary-page.itineraries-loaded',
        defaultMessage: 'More itineraries loaded',
      });
      setTimeout(() => {
        props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  const showScreenreaderUpdatedAlert = () => {
    if (props.alertRef.current) {
      if (props.alertRef.current.innerHTML) {
        props.alertRef.current.innerHTML = null;
      }
      props.alertRef.current.innerHTML = context.intl.formatMessage({
        id: 'itinerary-page.itineraries-updated',
        defaultMessage: 'search results updated',
      });
      setTimeout(() => {
        props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  const showScreenreaderLoadingAlert = () => {
    if (props.alertRef.current && !props.alertRef.current.innerHTML) {
      props.alertRef.current.innerHTML = context.intl.formatMessage({
        id: 'itinerary-page.loading-itineraries',
        defaultMessage: 'Loading for more itineraries',
      });
      setTimeout(() => {
        props.alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  const changeHash = index => {
    const isbikeAndVehicle = props.match.params.hash === 'bikeAndVehicle';
    const isParkAndRide = props.match.params.hash === 'parkAndRide';

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });

    const newState = {
      ...context.match.location,
      state: { summaryPageSelected: index },
    };
    const indexPath = `${getSummaryPath(
      props.match.params.from,
      props.match.params.to,
    )}${isbikeAndVehicle ? '/bikeAndVehicle' : ''}${
      isParkAndRide ? '/parkAndRide' : ''
    }/${index}`;

    newState.pathname = indexPath;
    context.router.replace(newState);
  };

  const renderMap = (from, to, viaPoints) => {
    const { match, breakpoint } = props;
    const combinedItineraries = getCombinedItineraries();
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
    if (state.bounds) {
      mwtProps.bounds = state.bounds;
    } else if (state.center) {
      mwtProps.lat = state.center.lat;
      mwtProps.lon = state.center.lon;
    } else {
      mwtProps.bounds = getBounds(filteredItineraries, from, to, viaPoints);
    }

    return (
      <ItineraryPageMap
        {...mwtProps}
        from={from}
        to={to}
        viaPoints={viaPoints}
        zoom={POINT_FOCUS_ZOOM}
        mapLayers={props.mapLayers}
        mapLayerOptions={props.mapLayerOptions}
        setMWTRef={setMWTRef}
        breakpoint={breakpoint}
        itineraries={filteredItineraries}
        topics={state.itineraryTopics}
        active={activeIndex}
        showActive={detailView}
        showVehicles={showVehicles()}
        onlyHasWalkingItineraries={onlyHasWalkingItineraries()}
      />
    );
  }

  const toggleCustomizeSearchOffcanvas = () => {
    internalSetOffcanvas(!settingsOpen);
  };

  const internalSetOffcanvas = newState => {
    if (headerRef.current && contentRef.current) {
      setTimeout(() => {
        let inputs = Array.from(
          headerRef?.current?.querySelectorAll(
            'input, button, *[role="button"]',
          ) || [],
        );
        inputs = inputs.concat(
          Array.from(
            contentRef?.current?.querySelectorAll(
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
      setState({ ...state, settingsOnOpen: getCurrentSettings(context.config, '') });
      setSettingsOpen(true)
      if (props.breakpoint !== 'large') {
        context.router.push({
          ...props.match.location,
          state: {
            ...props.match.location.state,
            customizeSearchOffcanvas: newState,
          },
        });
      }
    } else {
      setSettingsOpen(false)
      if (props.breakpoint !== 'large') {
        if (
          !isEqual(
            state.settingsOnOpen,
            getCurrentSettings(context.config, ''),
          )
        ) {
          if (
            !isEqual(
              otpToLocation(context.match.params.from),
              otpToLocation(context.match.params.to),
            ) ||
            getIntermediatePlaces(context.match.location.query).length > 0
          ) {
            context.router.go(-1);
            setState({
              ...state,
              earlierItineraries: [],
              laterItineraries: [],
              separatorPosition: undefined,
              alternativePlan: undefined,
              settingsChangedRecently: true,
            })
            setScreenReaderCallback(true)
          }
        }
      } else if (
        !isEqual(
          state.settingsOnOpen,
          getCurrentSettings(context.config, ''),
        )
      ) {
        if (
          !isEqual(
            otpToLocation(context.match.params.from),
            otpToLocation(context.match.params.to),
          ) ||
          getIntermediatePlaces(context.match.location.query).length > 0
        ) {
          setState({
            ...state,
            isFetchingWalkAndBike: true,
            loading: true,
          })
          setRefetchCallback(true)
        }
      }
    }
  };

  const showVehicles = () => {
    const now = moment();
    const startTime = moment.unix(props.match.location.query.time);
    const diff = now.diff(startTime, 'minutes');
    const { hash } = props.match.params;

    // Vehicles are typically not shown if they are not in transit. But for some quirk in mqtt, if you
    // search for a route for example tomorrow, real time vehicle would be shown.
    let inRange =
      (diff <= show_vehicles_threshold_minutes && diff >= 0) ||
      (diff >= -1 * show_vehicles_threshold_minutes && diff <= 0);

    return !!(
      inRange &&
      context.config.showVehiclesOnSummaryPage &&
      hash !== 'walk' &&
      hash !== 'bike' &&
      hash !== 'car' &&
      (props.breakpoint === 'large' || hash)
    );
  };

  const getCombinedItineraries = () => {
    const itineraries = [
      ...(state.earlierItineraries || []),
      ...(selectedPlan?.itineraries || []),
      ...(state.laterItineraries || []),
    ];
    return itineraries.filter(x => x !== undefined);
  };

  const onDetailsTabFocused = () => {
    setTimeout(() => {
      if (tabHeaderRef.current) {
        tabHeaderRef.current.focus();
      }
    }, 500);
  };

  const { error } = props;
  const { walkPlan, bikePlan, carPlan, parkRidePlan } = state;

  const plan = props.viewer && props.viewer.plan;

  const bikeParkPlan = filteredbikeAndPublic(state.bikeParkPlan);
  const bikeAndPublicPlan = filteredbikeAndPublic(
    state.bikeAndPublicPlan,
  );
  if (
    planHasNoItineraries() &&
    userHasChangedModes(context.config) &&
    !isFetching &&
    (!state.alternativePlan ||
      !isEqual(
        props.viewer && props.viewer.plan,
        originalPlan,
      ))
  ) {
    originalPlan = props.viewer.plan;
    isFetching = true;
    setState({ ...state, isFetchingWalkAndBike: true });
    makeWalkAndBikeQueries();
  }

  const hasAlternativeItineraries =
    state.alternativePlan &&
    state.alternativePlan.itineraries &&
    state.alternativePlan.itineraries.length > 0;

  let bikeAndPublicItinerariesToShow = 0;
  let bikeAndParkItinerariesToShow = 0;
  if (props.match.params.hash === 'walk') {
    stopClient();
    if (state.isFetchingWalkAndBike) {
      return (
        <>
          <Loading />
        </>
      );
    }
    selectedPlan = walkPlan;
  } else if (props.match.params.hash === 'bike') {
    stopClient();
    if (state.isFetchingWalkAndBike) {
      return (
        <>
          <Loading />
        </>
      );
    }
    selectedPlan = bikePlan;
  } else if (props.match.params.hash === 'bikeAndVehicle') {
    if (state.isFetchingWalkAndBike) {
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
      !state.isFetchingWalkAndBike &&
      !context.config.showBikeAndParkItineraries &&
      (!hasBikeAndPublicPlan || !hasBikeParkPlan)
    ) {
      toggleStreetMode(''); // go back to showing normal itineraries
      return <Loading />;
    }
    if (
      hasBikeAndPublicPlan &&
      hasItinerariesContainingPublicTransit(bikeAndPublicPlan) &&
      hasItinerariesContainingPublicTransit(bikeParkPlan)
    ) {
      selectedPlan = {
        itineraries: [
          ...bikeParkPlan.itineraries.slice(0, 3),
          ...bikeAndPublicPlan.itineraries.slice(0, 3),
        ],
      };
    } else if (
      hasBikeAndPublicPlan &&
      hasItinerariesContainingPublicTransit(bikeAndPublicPlan)
    ) {
      selectedPlan = bikeAndPublicPlan;
    } else if (hasItinerariesContainingPublicTransit(bikeParkPlan)) {
      selectedPlan = bikeParkPlan;
    }
    bikeAndPublicItinerariesToShow = hasBikeAndPublicPlan
      ? Math.min(bikeAndPublicPlan.itineraries.length, 3)
      : 0;
    bikeAndParkItinerariesToShow = hasBikeAndPublicPlan
      ? Math.min(bikeParkPlan.itineraries.length, 3)
      : 0;
  } else if (props.match.params.hash === 'car') {
    stopClient();
    if (state.isFetchingWalkAndBike) {
      return <Loading />;
    }
    selectedPlan = carPlan;
  } else if (props.match.params.hash === 'parkAndRide') {
    if (state.isFetchingWalkAndBike) {
      return <Loading />;
    }
    if (
      !state.isFetchingWalkAndBike &&
      !Array.isArray(parkRidePlan?.itineraries)
    ) {
      toggleStreetMode(''); // go back to showing normal itineraries
      return <Loading />;
    }
    selectedPlan = parkRidePlan;
  } else if (planHasNoItineraries() && hasAlternativeItineraries) {
    selectedPlan = state.alternativePlan;
  } else {
    selectedPlan = plan;
  }

  const currentSettings = getCurrentSettings(context.config, '');

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
      itineraryWalkDistance < context.config.suggestWalkMaxDistance,
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
      itineraryBikeDistance < context.config.suggestBikeMaxDistance,
  );

  const bikeAndPublicPlanHasItineraries = hasItinerariesContainingPublicTransit(
    bikeAndPublicPlan,
  );
  const bikeParkPlanHasItineraries = hasItinerariesContainingPublicTransit(
    bikeParkPlan,
  );
  const showBikeAndPublicOptionButton = !context.config
    .includePublicWithBikePlan
    ? bikeParkPlanHasItineraries &&
      !currentSettings.accessibilityOption &&
      currentSettings.showBikeAndParkItineraries
    : (bikeAndPublicPlanHasItineraries || bikeParkPlanHasItineraries) &&
      !currentSettings.accessibilityOption &&
      currentSettings.includeBikeSuggestions;

  const hasCarItinerary = !isEmpty(get(carPlan, 'itineraries'));
  const showCarOptionButton =
    context.config.includeCarSuggestions &&
    currentSettings.includeCarSuggestions &&
    hasCarItinerary;

  const hasParkAndRideItineraries = !isEmpty(
    get(parkRidePlan, 'itineraries'),
  );
  const showParkRideOptionButton =
    context.config.includeParkAndRideSuggestions &&
    currentSettings.includeParkAndRideSuggestions &&
    hasParkAndRideItineraries;

  const showStreetModeSelector =
    (showWalkOptionButton ||
      showBikeOptionButton ||
      showBikeAndPublicOptionButton ||
      showCarOptionButton ||
      showParkRideOptionButton) &&
    props.match.params.hash !== 'bikeAndVehicle' &&
    props.match.params.hash !== 'parkAndRide';

  const hasItineraries =
    selectedPlan && Array.isArray(selectedPlan.itineraries);

  if (
    !isFetching &&
    hasItineraries &&
    (selectedPlan !== state.alternativePlan ||
      selectedPlan !== plan) &&
    !isEqual(selectedPlan, state.previouslySelectedPlan)
  ) {
    setState({
      ...state,
      previouslySelectedPlan: selectedPlan,
      separatorPosition: undefined,
      earlierItineraries: [],
      laterItineraries: [],
    });
  }
  let combinedItineraries = getCombinedItineraries();
  let onlyWalkingAlternatives = false;
  // Don't show only walking alternative itineraries
  if (onlyHasWalkingItineraries() && state.alternativePlan) {
    let onlyWalkingItineraries = true;
    state.alternativePlan.itineraries.forEach(itin => {
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
    props.match.params.hash !== 'walk' &&
    props.match.params.hash !== 'bikeAndVehicle' &&
    !onlyHasWalkingItineraries()
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
    props.match.params.secondHash
      ? props.match.params.secondHash
      : props.match.params.hash,
  );

  const from = otpToLocation(match.params.from);
  const to = otpToLocation(match.params.to);
  const viaPoints = getIntermediatePlaces(match.location.query);

  if (match.routes.some(route => route.printPage) && hasItineraries) {
    return React.cloneElement(props.content, {
      itinerary:
        combinedItineraries[hash < combinedItineraries.length ? hash : 0],
      focusToPoint: focusToPoint,
      from,
      to,
    });
  }

  let map = renderMap(from, to, viaPoints);

  let earliestStartTime;
  let latestArrivalTime;

  if (selectedPlan?.itineraries) {
    earliestStartTime = Math.min(
      ...combinedItineraries.map(i => i.startTime),
    );
    latestArrivalTime = Math.max(...combinedItineraries.map(i => i.endTime));
  }

  const serviceTimeRange = validateServiceTimeRange(
    context.config.itinerary.serviceTimeRange,
    props.serviceTimeRange,
  );
  const loadingPublicDone =
    state.loading === false && (error || props.loading === false);
  const waitForBikeAndWalk = () =>
    planHasNoItineraries() && state.isFetchingWalkAndBike;
  if (props.breakpoint === 'large') {
    let content;
    /* Should render content if
    1. Fetching public itineraries is complete
    2. Don't have to wait for walk and bike query to complete
    3. Result has non-walking itineraries OR if not, query with all modes is completed or query is made with default settings
    If all conditions don't apply, render spinner */
    if (
      loadingPublicDone &&
      !waitForBikeAndWalk() &&
      (!onlyHasWalkingItineraries() ||
        (onlyHasWalkingItineraries() &&
          (allModesQueryDone ||
            !relevantRoutingSettingsChanged(context.config))))
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
                focusToPoint={focusToPoint}
                focusToLeg={focusToLeg}
                isMobile={false}
              />
            </div>
          );
        });

        content = (
          <div className="swipe-scroll-wrapper">
            <SwipeableTabs
              tabs={itineraryTabs}
              tabIndex={activeIndex}
              onSwipe={changeHash}
              classname="swipe-desktop-view"
              ariaFrom="swipe-summary-page"
              ariaFromHeader="swipe-summary-page-header"
            />
          </div>
        );
        return (
          <DesktopView
            title={
              <span ref={tabHeaderRef} tabIndex={-1}>
                <FormattedMessage
                  id="itinerary-page.title"
                  defaultMessage="Itinerary suggestions"
                />
              </span>
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
            plan={selectedPlan}
            serviceTimeRange={serviceTimeRange}
            routingErrors={selectedPlan.routingErrors}
            itineraries={selectedItineraries}
            params={match.params}
            error={error || state.error}
            bikeAndPublicItinerariesToShow={
              bikeAndPublicItinerariesToShow
            }
            bikeAndParkItinerariesToShow={bikeAndParkItinerariesToShow}
            walking={showWalkOptionButton}
            biking={showBikeOptionButton}
            showAlternativePlan={
              planHasNoItineraries() &&
              hasAlternativeItineraries &&
              !onlyWalkingAlternatives
            }
            separatorPosition={state.separatorPosition}
            loading={isLoading(
              onlyHasWalkingItineraries(),
              onlyWalkingAlternatives,
            )}
            onLater={onLater}
            onEarlier={onEarlier}
            onDetailsTabFocused={() => {
              onDetailsTabFocused();
            }}
            loadingMoreItineraries={state.loadingMoreItineraries}
            showSettingsChangedNotification={
              shouldShowSettingsChangedNotification
            }
            alternativePlan={state.alternativePlan}
            driving={showCarOptionButton || showParkRideOptionButton}
            onlyHasWalkingItineraries={onlyHasWalkingItineraries()}
          >
            {props.content &&
              React.cloneElement(props.content, {
                itinerary: selectedItineraries?.length && selectedItinerary,
                focusToPoint: focusToPoint,
                plan: selectedPlan,
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
          <span aria-hidden={settingsOpen} ref={headerRef}>
            <SummaryNavigation
              params={match.params}
              serviceTimeRange={serviceTimeRange}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
              toggleSettings={toggleCustomizeSearchOffcanvas}
            />
            {error ||
            (!state.isFetchingWalkAndBike &&
              !showStreetModeSelector) ? null : (
              <StreetModeSelector
                showWalkOptionButton={showWalkOptionButton}
                showBikeOptionButton={showBikeOptionButton}
                showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                showCarOptionButton={showCarOptionButton}
                showParkRideOptionButton={showParkRideOptionButton}
                toggleStreetMode={toggleStreetMode}
                setStreetModeAndSelect={setStreetModeAndSelect}
                weatherData={state.weatherData}
                walkPlan={walkPlan}
                bikePlan={bikePlan}
                bikeAndPublicPlan={bikeAndPublicPlan}
                bikeParkPlan={bikeParkPlan}
                carPlan={carPlan}
                parkRidePlan={parkRidePlan}
                loading={
                  props.loading ||
                  state.isFetchingWalkAndBike ||
                  state.isFetchingWeather
                }
              />
            )}
            {props.match.params.hash === 'parkAndRide' && (
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
          <span aria-hidden={settingsOpen} ref={contentRef}>
            {content}
          </span>
        }
        settingsDrawer={
          <SettingsDrawer
            open={settingsOpen}
            className="offcanvas"
          >
            <CustomizeSearch
              onToggleClick={toggleCustomizeSearchOffcanvas}
            />
          </SettingsDrawer>
        }
        map={map}
        scrollable
      />
    );
  }

  let content;
  let loading = false;

  if (
    (!error && (!selectedPlan || props.loading === true)) ||
    state.loading !== false
  ) {
    loading = true;
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
        focusToPoint={focusToPoint}
        plan={selectedPlan}
        serviceTimeRange={props.serviceTimeRange}
        focusToLeg={focusToLeg}
        onSwipe={changeHash}
      >
        {props.content &&
          combinedItineraries.map((itinerary, i) =>
            React.cloneElement(props.content, {
              key: i,
              itinerary,
              plan: selectedPlan,
              serviceTimeRange: props.serviceTimeRange,
            }),
          )}
      </MobileItineraryWrapper>
    );
  } else {
    map = undefined;
    if (loading) {
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
            plan={selectedPlan}
            serviceTimeRange={serviceTimeRange}
            routingErrors={selectedPlan.routingErrors}
            itineraries={combinedItineraries}
            params={match.params}
            error={error || state.error}
            from={match.params.from}
            to={match.params.to}
            intermediatePlaces={viaPoints}
            bikeAndPublicItinerariesToShow={
              bikeAndPublicItinerariesToShow
            }
            bikeAndParkItinerariesToShow={bikeAndParkItinerariesToShow}
            walking={showWalkOptionButton}
            biking={showBikeOptionButton}
            showAlternativePlan={
              planHasNoItineraries() &&
              hasAlternativeItineraries &&
              !onlyWalkingAlternatives
            }
            separatorPosition={state.separatorPosition}
            loading={isLoading(
              onlyHasWalkingItineraries(),
              onlyWalkingAlternatives,
            )}
            onLater={onLater}
            onEarlier={onEarlier}
            onDetailsTabFocused={() => {
              onDetailsTabFocused();
            }}
            loadingMoreItineraries={state.loadingMoreItineraries}
            showSettingsChangedNotification={
              shouldShowSettingsChangedNotification
            }
            alternativePlan={state.alternativePlan}
            driving={showCarOptionButton || showParkRideOptionButton}
            onlyHasWalkingItineraries={onlyHasWalkingItineraries()}
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
          <span aria-hidden={settingsOpen} ref={headerRef}>
            <SummaryNavigation
              params={match.params}
              serviceTimeRange={serviceTimeRange}
              startTime={earliestStartTime}
              endTime={latestArrivalTime}
              toggleSettings={toggleCustomizeSearchOffcanvas}
            />
            {error ||
            (!state.isFetchingWalkAndBike &&
              !showStreetModeSelector) ? null : (
              <StreetModeSelector
                showWalkOptionButton={showWalkOptionButton}
                showBikeOptionButton={showBikeOptionButton}
                showBikeAndPublicOptionButton={showBikeAndPublicOptionButton}
                showCarOptionButton={showCarOptionButton}
                showParkRideOptionButton={showParkRideOptionButton}
                toggleStreetMode={toggleStreetMode}
                setStreetModeAndSelect={setStreetModeAndSelect}
                weatherData={state.weatherData}
                walkPlan={walkPlan}
                bikePlan={bikePlan}
                bikeAndPublicPlan={bikeAndPublicPlan}
                bikeParkPlan={bikeParkPlan}
                carPlan={carPlan}
                parkRidePlan={parkRidePlan}
                loading={
                  props.loading ||
                  state.isFetchingWalkAndBike ||
                  state.isFetchingWeather
                }
              />
            )}
            {props.match.params.hash === 'parkAndRide' && (
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
        <span aria-hidden={settingsOpen} ref={contentRef}>
          {content}
        </span>
      }
      map={map}
      settingsDrawer={
        <SettingsDrawer
          open={settingsOpen}
          className="offcanvas-mobile"
        >
          <CustomizeSearch
            onToggleClick={toggleCustomizeSearchOffcanvas}
            mobile
          />
        </SettingsDrawer>
      }
      expandMap={expandMap}
    />
  );
  
}

SummaryPage.contextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func.isRequired,
  headers: PropTypes.object.isRequired,
  getStore: PropTypes.func,
  router: routerShape.isRequired, // DT-3358
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

SummaryPage.propTypes = {
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

SummaryPage.defaultProps = {
  map: undefined,
  error: undefined,
  loading: false,
};

// const SummaryPageWithBreakpoint = withBreakpoint(props => (
//   <ReactRelayContext.Consumer>
//     {({ environment }) => (
//       <SummaryPage {...props} relayEnvironment={environment} />
//     )}
//   </ReactRelayContext.Consumer>
// ));

const SummaryPageWithStores = connectToStores(
  SummaryPage,
  ['MapLayerStore'],
  ({ getStore }) => ({
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles'],
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
        unpreferred: { type: "InputUnpreferred" }
        allowedBikeRentalNetworks: { type: "[String]" }
        modeWeight: { type: "InputModeWeight" }
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
          modeWeight: $modeWeight
        ) {
          ...SummaryPlanContainer_plan
          ...ItineraryTab_plan
          routingErrors {
            code
            inputField
          }
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
  // SummaryPage as Component,
};
