/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import moment from 'moment';
import React, { useEffect, useState, useRef, cloneElement } from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import polyline from 'polyline-encoded';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import ItineraryPageMap from './map/ItineraryPageMap';
import ItineraryListContainer from './ItineraryListContainer';
import { spinnerPosition } from './ItineraryList/ItineraryList';
import ItineraryPageControls from './ItineraryPageControls';
import ItineraryTabs from './ItineraryTabs';
import { getWeatherData } from '../util/apiUtils';
import Loading from './Loading';
import { getItineraryPagePath, streetHash } from '../util/path';
import { boundWithMinimumArea } from '../util/geo-utils';
import {
  planQuery,
  moreQuery,
  alternativeQuery,
  viewerQuery,
} from './ItineraryQueries';
import {
  getSelectedItineraryIndex,
  reportError,
  addFeedbackly,
  getTopics,
  getBounds,
  isEqualItineraries,
  settingsLimitRouting,
  setCurrentTimeToURL,
  updateClient,
  stopClient,
  getRentalStationsToHideOnMap,
  addBikeStationMapForRentalVehicleItineraries,
  checkDayNight,
  filterItinerariesByFeedId,
  transitItineraries,
  filterItineraries,
} from './ItineraryPageUtils';
import withBreakpoint from '../util/withBreakpoint';
import { isIOS } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  parseLatLon,
  otpToLocation,
  getIntermediatePlaces,
} from '../util/otpStrings';
import AlternativeItineraryBar from './AlternativeItineraryBar';
import {
  getSettings,
  getPlanParams,
  hasStartAndDestination,
} from '../util/planParamUtil';
import { mapLayerOptionsShape } from '../util/shapes';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { saveSearch } from '../action/SearchActions';
import CustomizeSearch from './CustomizeSearch';
import { mapLayerShape } from '../store/MapLayerStore';
import { getMapLayerOptions } from '../util/mapLayerUtils';
import ItineraryShape from '../prop-types/ItineraryShape';
import ErrorShape from '../prop-types/ErrorShape';
import RoutingErrorShape from '../prop-types/RoutingErrorShape';

const streetHashes = [
  streetHash.walk,
  streetHash.bike,
  streetHash.bikeAndVehicle,
  streetHash.car,
  streetHash.parkAndRide,
];
const altTransitHash = [streetHash.bikeAndVehicle, streetHash.parkAndRide];
const noTransitHash = [streetHash.walk, streetHash.bike, streetHash.car];

const ALT_LOADING_STATES = {
  UNSET: 'unset',
  LOADING: 'loading',
  DONE: 'done',
};

const showVehiclesThresholdMinutes = 720;
const emptyPlans = {
  walkPlan: undefined,
  bikePlan: undefined,
  bikeTransitPlan: undefined,
  carPlan: undefined,
  parkRidePlan: undefined,
};

const emptyState = {
  earlierItineraries: [],
  laterItineraries: [],
  separatorPosition: undefined,
  routingFeedbackPosition: undefined,
  loading: false,
  error: undefined,
  topNote: undefined,
  bottomNote: undefined,
};

function ItineraryPage(props, context) {
  const headerRef = useRef(null);
  const mwtRef = useRef();
  const expandMapRef = useRef(0);
  const ariaRef = useRef('summary-page.title');
  const pendingWeatherHash = useRef();

  const [state, setState] = useState({
    ...emptyState,
  });
  const [altState, setAltState] = useState({
    ...emptyPlans,
    loading: ALT_LOADING_STATES.UNSET,
  });
  const [relaxState, setRelaxState] = useState({ loading: false });
  const [settingsState, setSettingsState] = useState({ settingsOpen: false });
  const [weatherState, setWeatherState] = useState({ loading: false });
  const [topicsState, setTopicsState] = useState(null);
  const [mapState, setMapState] = useState({});

  function stopClientAndUpdateTopics() {
    stopClient(context);
    setTopicsState(null);
  }

  const selectStreetMode = newStreetMode => {
    const newLocationState = {
      ...props.match.location,
      state: { selectedItineraryIndex: 0 },
    };
    const basePath = getItineraryPagePath(
      props.match.params.from,
      props.match.params.to,
    );
    let pagePath = basePath;
    if (newStreetMode) {
      pagePath = `${pagePath}/${newStreetMode}`;
    }
    newLocationState.pathname = basePath;
    context.router.replace(newLocationState);
    newLocationState.pathname = pagePath;
    context.router.push(newLocationState);
  };

  const setStreetModeAndSelect = newStreetMode => {
    addAnalyticsEvent({
      category: 'Itinerary',
      action: 'OpenItineraryDetailsWithMode',
      name: newStreetMode,
    });
    selectStreetMode(newStreetMode);
  };

  const resetItineraryPageSelection = () => {
    context.router.replace({
      ...props.match.location,
      state: {
        ...props.match.location.state,
        selectedItineraryIndex: 0,
      },
    });
  };

  function hasValidFromTo() {
    const { params } = props.match;
    return (
      hasStartAndDestination(params) &&
      (!isEqual(otpToLocation(params.from), otpToLocation(params.to)) ||
        getIntermediatePlaces(props.match.location.query).length)
    );
  }

  function mapHashToPlan(hash) {
    switch (hash) {
      case streetHash.walk:
        return altState.walkPlan;
      case streetHash.bike:
        return altState.bikePlan;
      case streetHash.bikeAndVehicle:
        return altState.bikeTransitPlan;
      case streetHash.car:
        return altState.carPlan;
      case streetHash.parkAndRide:
        return altState.parkRidePlan;
      default:
        if (
          !transitItineraries(props.viewer?.plan?.itineraries).length &&
          !state.settingsChanged &&
          relaxState.relaxedPlan?.itineraries?.length > 0
        ) {
          return relaxState.relaxedPlan;
        }
        return props.viewer.plan;
    }
  }

  function makeWeatherQuery() {
    const from = otpToLocation(props.match.params.from);
    const { walkPlan, bikePlan, bikeTransitPlan } = altState;
    const itinerary =
      walkPlan?.itineraries?.[0] ||
      bikePlan?.itineraries?.[0] ||
      bikeTransitPlan?.itineraries?.[0];
    if (!itinerary) {
      return;
    }
    const time = itinerary.startTime;
    const weatherHash = `${time}_${from.lat}_${from.lon}`;
    if (
      weatherHash !== weatherState.weatherData?.weatherHash &&
      weatherHash !== pendingWeatherHash.current
    ) {
      pendingWeatherHash.current = weatherHash;
      const momentTime = moment(time);
      setWeatherState({ ...weatherState, loading: true });
      getWeatherData(
        context.config.URL.WEATHER_DATA,
        momentTime,
        from.lat,
        from.lon,
      )
        .then(res => {
          if (weatherHash === pendingWeatherHash.current) {
            // no cascading fetches
            pendingWeatherHash.current = undefined;
            let weatherData;
            if (Array.isArray(res) && res.length === 3) {
              const temperature = Number(res[0].ParameterValue);
              const windSpeed = Number(res[1].ParameterValue);
              const iconIndex = parseInt(res[2].ParameterValue, 10);

              if (
                !Number.isNaN(temperature) &&
                !Number.isNaN(windSpeed) &&
                !Number.isNaN(iconIndex)
              ) {
                weatherData = {
                  weatherHash,
                  time,
                  temperature,
                  windSpeed,
                  // Icon spec: www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje -> Sääsymbolien selitykset ennusteissa
                  iconId: checkDayNight(
                    iconIndex,
                    momentTime,
                    from.lat,
                    from.lon,
                  ),
                };
              }
            }
            setWeatherState({ loading: false, weatherData });
          }
        })
        .catch(() => {
          pendingWeatherHash.current = undefined;
          setWeatherState({ loading: false, weatherData: undefined });
        });
    }
  }

  function makeAlternativeQuery() {
    if (!hasValidFromTo() || altState.loading === ALT_LOADING_STATES.LOADING) {
      return;
    }
    setAltState({
      ...altState,
      ...emptyPlans,
      loading: ALT_LOADING_STATES.LOADING,
    });
    const planParams = getPlanParams(context.config, props.match);

    fetchQuery(props.relayEnvironment, alternativeQuery, planParams)
      .toPromise()
      .then(result => {
        // filter plain walking / biking away
        const bikeParkItineraries = transitItineraries(
          result.bikeParkPlan?.itineraries,
        );
        const bikePublicItineraries = transitItineraries(
          result.bikeAndPublicPlan?.itineraries,
        );

        // show 6 bike + transit itineraries, preferably 3 of both kind.
        // If there is not enough of a kind, take more from the other kind
        let n1 = bikeParkItineraries.length;
        let n2 = bikePublicItineraries.length;
        if (n1 < 3) {
          n2 = Math.min(6 - n1, n2);
        } else if (n2 < 3) {
          n1 = Math.min(6 - n2, n1);
        } else {
          n1 = 3;
          n2 = 3;
        }
        const bikeTransitPlan = {
          ...result.bikeParkPlan,
          itineraries: [
            ...bikeParkItineraries.slice(0, n1),
            ...bikePublicItineraries.slice(0, 3),
          ],
        };

        const bikePlan = {
          ...result.bikePlan,
          itineraries: filterItineraries(result.bikePlan?.itineraries, [
            'BICYCLE',
          ]),
        };

        setAltState({
          ...altState,
          bikeAndParkItineraryCount: n1,
          loading: ALT_LOADING_STATES.DONE,
          walkPlan: result.walkPlan,
          bikePlan,
          bikeTransitPlan,
          carPlan: result.carPlan,
          parkRidePlan: result.parkRidePlan,
        });
        if (context.config.showWeatherInformation) {
          makeWeatherQuery();
        }
      })
      .catch(() => {
        setAltState({ ...altState, loading: ALT_LOADING_STATES.DONE });
      });
  }

  function makeRelaxedQuery() {
    if (!hasValidFromTo() || relaxState.loading) {
      return;
    }
    setRelaxState({ relaxedPlan: {}, loading: true });
    const planParams = getPlanParams(context.config, props.match, true);
    fetchQuery(props.relayEnvironment, moreQuery, planParams, {
      force: true,
    })
      .toPromise()
      .then(result => {
        const relaxedPlan = {
          ...result.plan,
          itineraries: transitItineraries(result.plan.itineraries),
        };
        setRelaxState({
          relaxedPlan,
          loading: false,
        });
      });
  }

  const onLater = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });
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
      const newState = reversed
        ? { topNote: 'no-route-end-date-not-in-range' }
        : { bottomNote: 'no-route-end-date-not-in-range' };
      // Departure time is going beyond available time range
      setState({ ...state, ...newState });
      return;
    }

    const useRelaxedRoutingPreferences =
      transitItineraries(props.viewer?.plan?.itineraries).length === 0 &&
      relaxState.relaxedPlan?.itineraries?.length > 0;

    const params = getPlanParams(
      context.config,
      props.match,
      useRelaxedRoutingPreferences,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: false,
      date: latestDepartureTime.format('YYYY-MM-DD'),
      time: latestDepartureTime.format('HH:mm'),
    };

    setState({ ...state, loadingMore: reversed ? 'top' : 'bottom' });
    ariaRef.current = 'itinerary-page.loading-itineraries';

    fetchQuery(props.relayEnvironment, moreQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
        const newItineraries = transitItineraries(result.itineraries);
        if (newItineraries.length === 0) {
          const newState = reversed
            ? { topNote: 'no-more-route-msg' }
            : { bottomNote: 'no-more-route-msg' };
          setState({ ...state, ...newState });
          return;
        }
        ariaRef.current = 'itinerary-page.itineraries-loaded';
        if (reversed) {
          // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
          setState({
            ...state,
            earlierItineraries: [
              ...newItineraries.reverse(),
              ...state.earlierItineraries,
            ],
            loadingMore: undefined,
            separatorPosition: state.separatorPosition
              ? state.separatorPosition + newItineraries.length
              : newItineraries.length,
          });
        } else {
          setState({
            ...state,
            laterItineraries: [...state.laterItineraries, ...newItineraries],
            loadingMore: undefined,
            routingFeedbackPosition: state.routingFeedbackPosition
              ? state.routingFeedbackPosition + newItineraries.length
              : newItineraries.length,
          });
        }
      });
  };

  const onEarlier = (itineraries, reversed) => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowEarlierItineraries',
      name: null,
    });

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
      const newState = reversed
        ? { bottomNote: 'no-route-start-date-too-early' }
        : { topNote: 'no-route-start-date-too-early' };
      setState({ ...state, ...newState });
      return;
    }

    const useRelaxedRoutingPreferences =
      transitItineraries(props.viewer?.plan?.itineraries).length === 0 &&
      relaxState.relaxedPlan?.itineraries?.length > 0;

    const params = getPlanParams(
      context.config,
      props.match,
      useRelaxedRoutingPreferences,
    );

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: true,
      date: earliestArrivalTime.format('YYYY-MM-DD'),
      time: earliestArrivalTime.format('HH:mm'),
    };
    setState({
      ...state,
      loadingMore: reversed ? spinnerPosition.bottom : spinnerPosition.top,
    });
    ariaRef.current = 'itinerary-page.loading-itineraries';

    fetchQuery(props.relayEnvironment, moreQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
        const newItineraries = transitItineraries(result.itineraries);
        if (newItineraries.length === 0) {
          // Could not find routes arriving at original departure time
          // --> cannot calculate earlier start time
          const newState = reversed
            ? { bottomNote: 'no-more-route-msg' }
            : { topNote: 'no-more-route-msg' };
          setState({ ...state, ...newState });
          return;
        }
        ariaRef.current = 'itinerary-page.itineraries-loaded';
        if (reversed) {
          setState({
            ...state,
            laterItineraries: [...state.laterItineraries, ...newItineraries],
            loadingMore: undefined,
          });
        } else {
          // Reverse the results so that route suggestions are in ascending order
          setState({
            ...state,
            earlierItineraries: [
              ...newItineraries.reverse(),
              ...state.earlierItineraries,
            ],
            loadingMore: undefined,
            separatorPosition: state.separatorPosition
              ? state.separatorPosition + newItineraries.length
              : newItineraries.length,
            routingFeedbackPosition: state.routingFeedbackPosition
              ? state.routingFeedbackPosition
              : newItineraries.length,
          });
          resetItineraryPageSelection();
        }
      });
  };

  // save url-defined location to old searches
  function saveUrlSearch(endpoint) {
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
  }

  function updateLocalStorage(saveEndpoints) {
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
  }

  function showVehicles() {
    const now = moment();
    const startTime = moment.unix(props.match.location.query.time);
    const diff = now.diff(startTime, 'minutes');
    const { hash } = props.match.params;

    // Vehicles are typically not shown if they are not in transit. But for some quirk in mqtt, if you
    // search for a route for example tomorrow, real time vehicle would be shown.
    const inRange =
      (diff <= showVehiclesThresholdMinutes && diff >= 0) ||
      (diff >= -1 * showVehiclesThresholdMinutes && diff <= 0);

    return !!(
      inRange &&
      context.config.showVehiclesOnItineraryPage &&
      !noTransitHash.includes(hash) &&
      (props.breakpoint === 'large' || hash)
    );
  }

  // make the map to obey external navigation
  function navigateMap() {
    // map sticks to user location if tracking is on, so set it off
    if (mwtRef.current?.disableMapTracking) {
      mwtRef.current.disableMapTracking();
    }
    // map will not react to location props unless they change or update is forced
    if (mwtRef.current?.forceRefresh) {
      mwtRef.current.forceRefresh();
    }
  }

  function getCombinedItineraries() {
    return [
      ...(state.earlierItineraries || []),
      ...(mapHashToPlan(props.match.params.hash)?.itineraries || []),
      ...(state.laterItineraries || []),
    ];
  }

  useEffect(() => {
    setCurrentTimeToURL(context.config, props.match);
    updateLocalStorage(true);
    addFeedbackly(context);

    return () => {
      if (showVehicles()) {
        stopClient(context);
      }
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react/no-did-update-set-state
    setState({ ...state, ...emptyState });
    if (!props.loading) {
      ariaRef.current = 'itinerary-page.itineraries-loaded';
      if (settingsLimitRouting(context.config) && !state.settingsChanged) {
        makeRelaxedQuery();
      }
      makeAlternativeQuery();
    } else {
      ariaRef.current = 'itinerary-page.loading-itineraries';
    }
    if (props.error) {
      reportError(props.error);
    }
  }, [props.viewer?.plan]);

  useEffect(() => {
    const { params } = props.match;
    const { hash, secondHash } = params;

    navigateMap();
    setMapState({ center: undefined, bounds: undefined });

    if (altTransitHash.includes(hash) ? secondHash : hash) {
      // in detail view
      // If itinerary is not found in detail view, go back to summary view
      if (
        // loading is first undefined, then true and finally false
        altState.loading === ALT_LOADING_STATES.DONE &&
        !mapHashToPlan(hash)?.itineraries?.length
      ) {
        selectStreetMode(); // back to root view
      }
    }
  }, [props.match.params.hash, props.match.params.secondHash]);

  useEffect(() => {
    // update stored future searches
    updateLocalStorage(false);
  }, [props.match.location.pathname, props.match.location.query]);

  useEffect(() => {
    // vehicles on map
    const { config } = context;
    if (showVehicles()) {
      const combinedItineraries = transitItineraries(getCombinedItineraries());
      const itineraryTopics = getTopics(
        config,
        combinedItineraries,
        props.match,
      );
      const { client } = context.getStore('RealTimeInformationStore');
      // Client may not be initialized yet if there was an client before ComponentDidMount
      if (!isEqual(itineraryTopics, topicsState) || !client) {
        updateClient(itineraryTopics, context);
      }
      if (!isEqual(itineraryTopics, topicsState)) {
        // eslint-disable-next-line react/no-did-update-set-state
        setTopicsState(itineraryTopics);
      }
    } else if (!isEmpty(topicsState)) {
      stopClientAndUpdateTopics();
    }
  }, [
    props.match.params.hash,
    props.viewer?.plan,
    altState.bikeTransitPlan,
    altState.parkRidePlan,
    relaxState.relaxedPlan,
    props.match.location.state?.selectedItineraryIndex,
  ]);

  const setMWTRef = ref => {
    mwtRef.current = ref;
  };

  const focusToPoint = (lat, lon) => {
    if (props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      expandMapRef.current += 1;
    }
    navigateMap();
    setMapState({ center: { lat, lon }, bounds: null });
  };

  const focusToLeg = leg => {
    if (props.breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      expandMapRef.current += 1;
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
    setMapState({ bounds, center: undefined });
  };

  const changeHash = index => {
    const { hash } = props.match.params;
    const subPath = altTransitHash.includes(hash) ? `/${hash}` : '';

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });

    const newLocationState = {
      ...props.match.location,
      state: { selectedItineraryIndex: index },
    };
    const pagePath = `${getItineraryPagePath(
      props.match.params.from,
      props.match.params.to,
    )}${subPath}/${index}`;

    newLocationState.pathname = pagePath;
    context.router.replace(newLocationState);
  };

  function showSettingsPanel(open) {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ExtraSettingsPanelClick',
      name: open ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });

    if (open) {
      setSettingsState({
        settingsOpen: true,
        settingsOnOpen: getSettings(context.config),
      });
      if (props.breakpoint !== 'large') {
        context.router.push({
          ...props.match.location,
          state: {
            ...props.match.location.state,
            itinerarySettingsOpen: true,
          },
        });
      }
      return;
    }

    setSettingsState({ ...settingsState, settingsOpen: false });
    if (props.breakpoint !== 'large') {
      context.router.go(-1);
    }
    const settingsChanged = !isEqual(
      settingsState.settingsOnOpen,
      getSettings(context.config),
    );
    if (!settingsChanged || !hasValidFromTo()) {
      return;
    }
    ariaRef.current = 'itinerary-page.loading-itineraries';
    const planParams = getPlanParams(context.config, props.match);
    setState({
      ...state,
      earlierItineraries: [],
      laterItineraries: [],
      separatorPosition: undefined,
      settingsChanged: true,
      loading: true,
    });
    props.relay.refetch(planParams, null, () => {
      resetItineraryPageSelection();
    });
  }

  const toggleSettings = () => {
    showSettingsPanel(!settingsState.settingsOpen);
  };

  const focusToHeader = () => {
    setTimeout(() => {
      if (headerRef.current) {
        headerRef.current.focus();
      }
    }, 500);
  };

  function renderMap(
    from,
    to,
    viaPoints,
    itineraries,
    activeIndex,
    detailView,
  ) {
    const mwtProps = {};
    if (mapState.bounds) {
      mwtProps.bounds = mapState.bounds;
    } else if (mapState.center) {
      mwtProps.lat = mapState.center.lat;
      mwtProps.lon = mapState.center.lon;
    } else {
      mwtProps.bounds = getBounds(itineraries, from, to, viaPoints);
    }

    const itineraryContainsDepartureFromVehicleRentalStation = itineraries[
      activeIndex
    ]?.legs.some(leg => leg.from?.vehicleRentalStation);

    const mapLayerOptions = itineraryContainsDepartureFromVehicleRentalStation
      ? addBikeStationMapForRentalVehicleItineraries(itineraries)
      : props.mapLayerOptions;

    const objectsToHide = getRentalStationsToHideOnMap(
      itineraryContainsDepartureFromVehicleRentalStation,
      itineraries[activeIndex],
    );
    return (
      <ItineraryPageMap
        {...mwtProps}
        from={from}
        to={to}
        viaPoints={viaPoints}
        mapLayers={props.mapLayers}
        mapLayerOptions={mapLayerOptions}
        setMWTRef={setMWTRef}
        breakpoint={props.breakpoint}
        itineraries={itineraries}
        topics={topicsState}
        active={activeIndex}
        showActive={!!detailView}
        showVehicles={showVehicles()}
        showDurationBubble={itineraries[0]?.legs?.length === 1}
        objectsToHide={objectsToHide}
      />
    );
  }

  const { match, error, breakpoint } = props;
  const { walkPlan, bikePlan, bikeTransitPlan, carPlan, parkRidePlan } =
    altState;
  const { config } = context;
  const { params } = match;
  const { hash, secondHash } = params;

  const hasNoTransitItineraries =
    transitItineraries(props.viewer?.plan?.itineraries).length === 0;

  const settings = getSettings(config);

  let selectedPlan = mapHashToPlan(hash);

  /* NOTE: as a temporary solution, do filtering by feedId in UI */
  if (config.feedIdFiltering) {
    selectedPlan = filterItinerariesByFeedId(selectedPlan, config);
  }
  let combinedItineraries;
  // Remove old itineraries if new query cannot find a route
  if (error) {
    combinedItineraries = [];
  } else if (streetHashes.includes(hash)) {
    combinedItineraries = selectedPlan?.itineraries || [];
  } else {
    combinedItineraries = getCombinedItineraries();
    if (!hasNoTransitItineraries) {
      // don't show plain walking in transit itinerary list
      combinedItineraries = transitItineraries(combinedItineraries);
    }
  }

  const selectedIndex = getSelectedItineraryIndex(
    match.location,
    combinedItineraries,
  );
  const from = otpToLocation(params.from);
  const to = otpToLocation(params.to);
  const viaPoints = getIntermediatePlaces(match.location.query);

  const hasItineraries = combinedItineraries.length > 0;
  if (hasItineraries && match.routes.some(route => route.printPage)) {
    return cloneElement(props.content, {
      itinerary: combinedItineraries[selectedIndex],
      focusToPoint,
      from,
      to,
    });
  }
  const detailView = altTransitHash.includes(hash) ? secondHash : hash;

  // no map on mobile summary view
  const map =
    !detailView && breakpoint !== 'large'
      ? null
      : renderMap(
          from,
          to,
          viaPoints,
          combinedItineraries,
          selectedIndex,
          detailView,
        );

  // must wait alternatives to render correct notifier
  const waitAlternatives =
    hasNoTransitItineraries && altState.loading === ALT_LOADING_STATES.LOADING;
  const loading =
    (props.loading ||
      state.loading ||
      (relaxState.loading && hasNoTransitItineraries) ||
      waitAlternatives ||
      (streetHashes.includes(hash) &&
        altState.loading === ALT_LOADING_STATES.LOADING)) && // viewing unfinished alt plan
    !error;

  const showRelaxedPlanNotifier = selectedPlan === relaxState.relaxedPlan;
  const settingsNotification =
    !showRelaxedPlanNotifier && // show only on notifier about limitations
    settingsLimitRouting(context.config) &&
    !isEqualItineraries(
      props.viewer?.plan?.itineraries,
      relaxState.relaxedPlan?.itineraries,
    ) &&
    relaxState.relaxedPlan?.itineraries?.length > 0 &&
    !state.settingsChanged &&
    !hash; // no notifier on p&r or bike&public lists

  const itineraryList = !detailView && (
    <span aria-hidden={settingsState.settingsOpen}>
      <ItineraryListContainer
        activeIndex={selectedIndex}
        plan={selectedPlan}
        routingErrors={selectedPlan?.routingErrors}
        itineraries={combinedItineraries}
        params={params}
        error={error || state.error}
        walking={walkPlan?.itineraries?.length > 0}
        biking={
          bikePlan?.itineraries?.length > 0 ||
          !!bikeTransitPlan?.itineraries?.length
        }
        driving={
          (settings.includeCarSuggestions &&
            carPlan?.itineraries?.length > 0) ||
          !!parkRidePlan?.itineraries?.length
        }
        bikeAndParkItineraryCount={altState.bikeAndParkItineraryCount}
        showRelaxedPlanNotifier={showRelaxedPlanNotifier}
        separatorPosition={state.separatorPosition}
        onLater={onLater}
        onEarlier={onEarlier}
        focusToHeader={focusToHeader}
        loading={loading}
        loadingMore={state.loadingMore}
        settingsNotification={settingsNotification}
        routingFeedbackPosition={state.routingFeedbackPosition}
        topNote={state.topNote}
        bottomNote={state.bottomNote}
      />
    </span>
  );

  const showAltBar =
    !streetHashes.includes(hash) &&
    (altState.loading === ALT_LOADING_STATES.LOADING || // show shimmer
      walkPlan?.itineraries?.length ||
      bikePlan?.itineraries?.length ||
      bikeTransitPlan?.itineraries?.length ||
      parkRidePlan?.itineraries?.length ||
      (settings.includeCarSuggestions && carPlan?.itineraries?.length));

  const alternativeItineraryBar = showAltBar && (
    <AlternativeItineraryBar
      selectStreetMode={selectStreetMode}
      setStreetModeAndSelect={setStreetModeAndSelect}
      weatherData={weatherState.weatherData}
      walkPlan={walkPlan}
      bikePlan={bikePlan}
      bikeTransitPlan={bikeTransitPlan}
      parkRidePlan={parkRidePlan}
      carPlan={settings.includeCarSuggestions ? carPlan : undefined}
      loading={
        loading ||
        altState.loading === ALT_LOADING_STATES.LOADING ||
        weatherState.loading
      }
    />
  );

  const desktop = breakpoint === 'large';
  const detailTabs = detailView && (
    <ItineraryTabs
      isMobile={!desktop}
      tabIndex={selectedIndex}
      changeHash={changeHash}
      plan={selectedPlan}
      itineraries={combinedItineraries}
      focusToPoint={focusToPoint}
      focusToLeg={focusToLeg}
      carItinerary={carPlan?.itineraries[0]}
    />
  );

  const spinner = loading && (
    <div style={{ position: 'relative', height: 200 }}>
      <Loading />
    </div>
  );

  const settingsDrawer =
    !detailView && settingsState.settingsOpen ? (
      <div className={desktop ? 'offcanvas' : 'offcanvas-mobile'}>
        <CustomizeSearch onToggleClick={toggleSettings} mobile={!desktop} />
      </div>
    ) : null;

  const header = !detailView && (
    <span aria-hidden={settingsState.settingsOpen}>
      <div role="status" className="sr-only" id="status" aria-live="polite">
        <FormattedMessage id={ariaRef.current} />
      </div>
      <ItineraryPageControls params={params} toggleSettings={toggleSettings} />
      {alternativeItineraryBar}
    </span>
  );

  const content = detailView ? detailTabs : itineraryList;

  if (desktop) {
    const title = (
      <span ref={headerRef} tabIndex={-1}>
        <FormattedMessage
          id={detailView ? 'itinerary-page.title' : 'summary-page.title'}
          defaultMessage="Itinerary suggestions"
        />
      </span>
    );
    // in detail view or parkride and bike+public, back button should pop out last path segment
    const bckBtnFallback =
      detailView || altTransitHash.includes(hash) ? 'pop' : undefined;

    return (
      <DesktopView
        title={title}
        header={header}
        bckBtnFallback={bckBtnFallback}
        content={loading ? spinner : content}
        settingsDrawer={settingsDrawer}
        map={map}
        scrollable
      />
    );
  }

  // mobile view
  return (
    <MobileView
      header={header}
      content={loading ? spinner : content}
      settingsDrawer={settingsDrawer}
      map={map}
      expandMap={expandMapRef.current}
    />
  );
}

ItineraryPage.contextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func.isRequired,
  headers: PropTypes.object.isRequired,
  getStore: PropTypes.func,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

ItineraryPage.propTypes = {
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
  content: PropTypes.node,
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
};

ItineraryPage.defaultProps = {
  content: undefined,
  map: undefined,
  error: undefined,
  loading: false,
};

const ItineraryPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <ItineraryPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const ItineraryPageWithStores = connectToStores(
  ItineraryPageWithBreakpoint,
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
  ItineraryPageWithStores,
  {
    viewer: viewerQuery,
    serviceTimeRange: graphql`
      fragment ItineraryPage_serviceTimeRange on serviceTimeRange {
        start
        end
      }
    `,
  },
  planQuery,
);

export {
  containerComponent as default,
  ItineraryPageWithBreakpoint as Component,
};
