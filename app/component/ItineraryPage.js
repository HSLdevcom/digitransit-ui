/* eslint-disable react/no-array-index-key */
/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef, cloneElement } from 'react';
import { fetchQuery } from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import polyline from 'polyline-encoded';
import { relayShape, configShape, mapLayerOptionsShape } from '../util/shapes';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import ItineraryPageMap from './map/ItineraryPageMap';
import ItineraryListContainer from './ItineraryListContainer';
import { spinnerPosition } from './ItineraryList';
import ItineraryPageControls from './ItineraryPageControls';
import ItineraryTabs from './ItineraryTabs';
import { getWeatherData } from '../util/apiUtils';
import Loading from './Loading';
import { getItineraryPagePath, streetHash } from '../util/path';
import { boundWithMinimumArea } from '../util/geo-utils';
import planConnection from './PlanConnection';
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
  transitEdges,
  filterWalk,
  mergeBikeTransitPlans,
} from './ItineraryPageUtils';
import { isIOS } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  parseLatLon,
  otpToLocation,
  getIntermediatePlaces,
} from '../util/otpStrings';
import AlternativeItineraryBar from './AlternativeItineraryBar';
import {
  PLANTYPE,
  getSettings,
  getPlanParams,
  planQueryNeeded,
} from '../util/planParamUtil';
import { timeStr } from '../util/timeUtils';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { saveSearch } from '../action/SearchActions';
import CustomizeSearch from './CustomizeSearch';
import { mapLayerShape } from '../store/MapLayerStore';

const MAX_QUERY_COUNT = 3; // number of attempts to collect enough itineraries

const streetHashes = [
  streetHash.walk,
  streetHash.bike,
  streetHash.bikeAndVehicle,
  streetHash.car,
  streetHash.parkAndRide,
];
const altTransitHash = [streetHash.bikeAndVehicle, streetHash.parkAndRide];
const noTransitHash = [streetHash.walk, streetHash.bike, streetHash.car];

const ALT_STATE = {
  UNSET: 'unset',
  LOADING: 'loading',
  DONE: 'done',
};

const showVehiclesThresholdMinutes = 720;

const emptyState = {
  earlierEdges: [],
  laterEdges: [],
  plan: {},
  separatorPosition: undefined,
  routingFeedbackPosition: undefined,
  error: undefined,
  topNote: undefined,
  bottomNote: undefined,
  loading: false,
  startCursor: undefined,
  endCursor: undefined,
};

const emptyPlan = { plan: {}, loading: false };

export default function ItineraryPage(props, context) {
  const headerRef = useRef(null);
  const mwtRef = useRef();
  const expandMapRef = useRef(0);
  const ariaRef = useRef('summary-page.title');

  const [state, setState] = useState(emptyState);
  const [relaxState, setRelaxState] = useState(emptyPlan);

  const unset = { plan: {}, loading: ALT_STATE.UNSET };
  const altStates = {
    [PLANTYPE.WALK]: useState(unset),
    [PLANTYPE.BIKE]: useState(unset),
    [PLANTYPE.CAR]: useState(unset),
    [PLANTYPE.BIKEPARK]: useState(unset),
    [PLANTYPE.BIKETRANSIT]: useState(unset),
    [PLANTYPE.PARKANDRIDE]: useState(unset),
  };
  // combination of bikePark and bikeTransit
  const [bikePublicState, setBikePublicState] = useState({ plan: {} });

  const [settingsState, setSettingsState] = useState({
    settingsOpen: false,
    settingsChanged: 0,
  });
  const [weatherState, setWeatherState] = useState({ loading: false });
  const [topicsState, setTopicsState] = useState(null);
  const [mapState, setMapState] = useState({});

  const { config, router } = context;
  const { match, breakpoint } = props;
  const { params, location } = match;
  const { hash, secondHash } = params;
  const { query } = location;

  function altLoading() {
    return Object.values(altStates).some(
      st => st[0].loading === ALT_STATE.LOADING,
    );
  }

  function altLoadingDone() {
    return Object.values(altStates).every(
      st => st[0].loading === ALT_STATE.DONE,
    );
  }

  function stopClientAndUpdateTopics() {
    stopClient(context);
    setTopicsState(null);
  }

  const selectStreetMode = newStreetMode => {
    const newLocationState = {
      ...location,
      state: { selectedItineraryIndex: 0 },
    };
    const basePath = getItineraryPagePath(params.from, params.to);
    let pagePath = basePath;
    if (newStreetMode) {
      pagePath = `${pagePath}/${newStreetMode}`;
    }
    newLocationState.pathname = basePath;
    router.replace(newLocationState);
    newLocationState.pathname = pagePath;
    router.push(newLocationState);
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
    if (location.state?.selectedItineraryIndex) {
      router.replace({
        ...location,
        state: {
          ...location.state,
          selectedItineraryIndex: 0,
        },
      });
    }
  };

  function mapHashToPlan() {
    switch (hash) {
      case streetHash.walk:
        return altStates[PLANTYPE.WALK][0].plan;
      case streetHash.bike:
        return altStates[PLANTYPE.BIKE][0].plan;
      case streetHash.car:
        return altStates[PLANTYPE.CAR][0].plan;
      case streetHash.bikeAndVehicle:
        return bikePublicState.plan;
      case streetHash.parkAndRide:
        return altStates[PLANTYPE.PARKANDRIDE][0].plan;
      default:
        if (
          !filterWalk(state.plan?.edges).length &&
          !settingsState.settingsChanged &&
          relaxState.plan?.edges?.length > 0
        ) {
          return relaxState.plan;
        }
        return state.plan;
    }
  }

  function makeWeatherQuery() {
    const from = otpToLocation(params.from);
    const time = query.time * 1000;
    setWeatherState({ ...weatherState, loading: true });
    const newState = { loading: false, weatherData: undefined };
    getWeatherData(config.URL.WEATHER_DATA, time, from.lat, from.lon)
      .then(res => {
        if (Array.isArray(res) && res.length === 3) {
          const temperature = Number(res[0].ParameterValue);
          const windSpeed = Number(res[1].ParameterValue);
          const iconIndex = parseInt(res[2].ParameterValue, 10);
          if (
            !Number.isNaN(temperature) &&
            !Number.isNaN(windSpeed) &&
            !Number.isNaN(iconIndex)
          ) {
            newState.weatherData = {
              temperature,
              windSpeed,
              // Icon spec: www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje -> Sääsymbolien selitykset ennusteissa
              iconId: checkDayNight(iconIndex, time, from.lat, from.lon),
              time: timeStr(time),
            };
          }
        }
        setWeatherState(newState);
      })
      .catch(() => {
        setWeatherState(newState);
      });
  }

  async function iterateQuery(planParams, reps) {
    let plan;
    const trials = reps || (planParams.modes.directOnly ? 1 : MAX_QUERY_COUNT);
    const arriveBy = !!planParams.datetime.latestArrival;
    for (let i = 0; i < trials; i++) {
      // eslint-disable-next-line no-await-in-loop
      const result = await fetchQuery(
        props.relayEnvironment,
        planConnection,
        planParams,
        {
          force: true,
        },
      ).toPromise();
      if (!plan) {
        plan = result.plan;
      } else if (arriveBy) {
        plan = {
          ...plan,
          pageInfo: {
            ...plan.pageInfo,
            startCursor: result.plan.pageInfo.startCursor,
          },
          edges: plan.edges.concat(result.plan.edges),
        };
      } else {
        plan = {
          ...plan,
          pageInfo: {
            ...plan.pageInfo,
            endCursor: result.plan.pageInfo.endCursor,
          },
          edges: plan.edges.concat(result.plan.edges),
        };
      }
      if (plan.edges.length >= planParams.numItineraries) {
        return plan;
      }
      if (arriveBy) {
        if (!plan.pageInfo.startCursor) {
          break;
        }
        planParams.before = plan.pageInfo.startCursor; // eslint-disable-line no-param-reassign
        planParams.last = planParams.numItineraries - plan.edges.length; // eslint-disable-line no-param-reassign
      } else {
        if (!plan.pageInfo.endCursor) {
          break;
        }
        planParams.after = plan.pageInfo.endCursor; // eslint-disable-line no-param-reassign
        planParams.first = planParams.numItineraries - plan.edges.length; // eslint-disable-line no-param-reassign
      }
    }
    return plan;
  }

  async function makeAltQuery(planType) {
    const altState = altStates[planType];
    if (!planQueryNeeded(config, match, planType)) {
      altState[1]({ plan: {}, loading: ALT_STATE.DONE });
      return;
    }
    altState[1]({ loading: ALT_STATE.LOADING });
    const planParams = getPlanParams(config, match, planType);
    try {
      const plan = await iterateQuery(planParams);
      altState[1]({ plan, loading: ALT_STATE.DONE });
    } catch (error) {
      altState[1]({ plan: {}, loading: ALT_STATE.DONE });
    }
  }

  async function makeRelaxedQuery() {
    if (!planQueryNeeded(config, match, PLANTYPE.TRANSIT, true)) {
      setRelaxState(emptyPlan);
      return;
    }
    setRelaxState({ loading: true });
    const planParams = getPlanParams(config, match, PLANTYPE.TRANSIT, true);
    try {
      const plan = await iterateQuery(planParams);
      setRelaxState({ plan, loading: false });
    } catch (error) {
      setRelaxState(emptyPlan);
    }
  }

  async function makeMainQuery() {
    if (!planQueryNeeded(config, match, PLANTYPE.TRANSIT)) {
      setState(emptyState);
      resetItineraryPageSelection();
      return;
    }
    ariaRef.current = 'itinerary-page.loading-itineraries';
    setState({ ...emptyState, loading: true });
    const planParams = getPlanParams(config, match, PLANTYPE.TRANSIT);
    try {
      const plan = await iterateQuery(planParams);
      setState({ ...emptyState, plan, loading: false });
      resetItineraryPageSelection();
      ariaRef.current = 'itinerary-page.itineraries-loaded';
    } catch (error) {
      reportError(error);
      setState(emptyPlan);
    }
  }

  const onLater = async () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });

    const relaxed =
      filterWalk(state.plan?.edges).length === 0 &&
      relaxState.plan?.edges?.length > 0;
    const origPlan = relaxed ? relaxState.plan : state.plan;

    const planParams = getPlanParams(config, match, PLANTYPE.TRANSIT, relaxed);
    const arriveBy = !!planParams.datetime.latestArrival;

    planParams.after = state.endCursor || origPlan.pageInfo.endCursor;
    if (!planParams.after) {
      const newState = arriveBy
        ? { topNote: 'no-more-route-msg' }
        : { bottomNote: 'no-more-route-msg' };
      setState({ ...state, ...newState, loadingMore: undefined });
      return;
    }
    planParams.first = planParams.numItineraries;
    planParams.transitOnly = true;

    setState({
      ...state,
      loadingMore: arriveBy ? spinnerPosition.top : spinnerPosition.bottom,
    });
    ariaRef.current = 'itinerary-page.loading-itineraries';

    let plan;
    try {
      plan = await iterateQuery(planParams, 1);
    } catch (error) {
      setState({ ...state, loadingMore: undefined });
      return;
    }
    const { edges } = plan;
    if (edges.length === 0) {
      const newState = arriveBy
        ? { topNote: 'no-more-route-msg' }
        : { bottomNote: 'no-more-route-msg' };
      setState({ ...state, ...newState, loadingMore: undefined });
      return;
    }
    ariaRef.current = 'itinerary-page.itineraries-loaded';

    const newState = {
      ...state,
      loadingMore: undefined,
      endCursor: plan.pageInfo.endCursor,
    };
    // place separators. First click sets feedback button to place
    // where user clicked before/after button. Further clicks above the itinerary list
    // set a separator line there and clicks below the list move feedback button down
    if (arriveBy) {
      // user clicked button above itinerary list
      const separators = state.routingFeedbackPosition
        ? {
            separatorPosition: edges.length,
            routingFeedbackPosition:
              state.routingFeedbackPosition + edges.length,
          }
        : { routingFeedbackPosition: edges.length };
      setState({
        ...newState,
        ...separators,
        earlierEdges: [...edges, ...state.earlierEdges],
      });
    } else {
      // user clicked button below itinerary list
      setState({
        ...newState,
        routingFeedbackPosition:
          origPlan.edges.length +
          state.earlierEdges.length +
          state.laterEdges.length,
        laterEdges: [...state.laterEdges, ...edges],
      });
    }
  };

  const onEarlier = async () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'ShowLaterItineraries',
      name: null,
    });

    const relaxed =
      filterWalk(state.plan?.edges).length === 0 &&
      relaxState.plan?.edges?.length > 0;
    const origPlan = relaxed ? relaxState.plan : state.plan;

    const planParams = getPlanParams(config, match, PLANTYPE.TRANSIT, relaxed);
    const arriveBy = !!planParams.datetime.latestArrival;

    planParams.before = state.startCursor || origPlan.pageInfo.startCursor;
    if (!planParams.before) {
      const newState = arriveBy
        ? { bottomNote: 'no-more-route-msg' }
        : { topNote: 'no-more-route-msg' };
      setState({ ...state, ...newState, loadingMore: undefined });
      return;
    }
    planParams.last = planParams.numItineraries;
    planParams.transitOnly = true;

    setState({
      ...state,
      loadingMore: arriveBy ? spinnerPosition.bottom : spinnerPosition.top,
    });
    ariaRef.current = 'itinerary-page.loading-itineraries';

    let plan;
    try {
      plan = await iterateQuery(planParams, 1);
    } catch (error) {
      setState({ ...state, loadingMore: undefined });
      return;
    }
    const { edges } = plan;
    if (edges.length === 0) {
      const newState = arriveBy
        ? { bottomNote: 'no-more-route-msg' }
        : { topNote: 'no-more-route-msg' };
      setState({ ...state, ...newState, loadingMore: undefined });
      return;
    }
    ariaRef.current = 'itinerary-page.itineraries-loaded';

    const newState = {
      ...state,
      loadingMore: undefined,
      startCursor: plan.pageInfo.startCursor,
    };
    if (arriveBy) {
      // user clicked button below itinerary list
      setState({
        ...newState,
        routingFeedbackPosition:
          origPlan.edges.length +
          state.earlierEdges.length +
          state.laterEdges.length,
        laterEdges: [...state.laterEdges, ...edges],
      });
    } else {
      // user clicked button above itinerary list
      const separators = state.routingFeedbackPosition
        ? {
            separatorPosition: edges.length,
            routingFeedbackPosition:
              state.routingFeedbackPosition + edges.length,
          }
        : { routingFeedbackPosition: edges.length };
      setState({
        ...newState,
        ...separators,
        earlierEdges: [...edges, ...state.earlierEdges],
      });
    }
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
      router.replace(newLocation);
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
    const now = new Date().getTime() / 1000;
    const startTime = query.time;
    const diff = Math.abs(now - startTime / 60);

    // Vehicles are typically not shown if they are not in transit. But for some quirk in mqtt, if you
    // search for a route for example tomorrow, real time vehicle would be shown.
    const inRange = diff <= showVehiclesThresholdMinutes;

    return !!(
      inRange &&
      config.showVehiclesOnItineraryPage &&
      !noTransitHash.includes(hash) &&
      (breakpoint === 'large' || hash)
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

  function getCombinedPlanEdges() {
    return [
      ...(state.earlierEdges || []),
      ...(mapHashToPlan()?.edges || []),
      ...(state.laterEdges || []),
    ];
  }

  useEffect(() => {
    setCurrentTimeToURL(config, match);
    updateLocalStorage(true);
    addFeedbackly(context);
    return () => {
      if (showVehicles()) {
        stopClient(context);
      }
    };
  }, []);

  useEffect(() => {
    makeMainQuery();
    Object.keys(altStates).forEach(key => makeAltQuery(key));

    if (settingsLimitRouting(config) && !settingsState.settingsChanged) {
      makeRelaxedQuery();
    }
  }, [
    settingsState.settingsChanged,
    params.from,
    params.to,
    query.time,
    query.arriveBy,
  ]);

  useEffect(() => {
    navigateMap();
    setMapState({ center: undefined, bounds: undefined });

    if (altTransitHash.includes(hash) ? secondHash : hash) {
      // in detail view
      // If itinerary is not found in detail view, go back to summary view
      if (altLoadingDone() && !mapHashToPlan()?.edges?.length) {
        selectStreetMode(); // back to root view
      }
    }
  }, [hash, secondHash]);

  useEffect(() => {
    // update stored future searches
    updateLocalStorage(false);
  }, [location.pathname, query]);

  useEffect(() => {
    // vehicles on map
    if (showVehicles()) {
      const combinedEdges = transitEdges(getCombinedPlanEdges());
      const itineraryTopics = getTopics(config, combinedEdges, match);
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
    hash,
    state.plan,
    relaxState.plan,
    bikePublicState.plan,
    altStates[PLANTYPE.PARKANDRIDE][0].plan,
    location.state?.selectedItineraryIndex,
  ]);

  useEffect(() => {
    if (config.showWeatherInformation) {
      makeWeatherQuery();
    }
  }, [params.from, query.time]);

  // merge two separate bike + transit plans into one
  useEffect(() => {
    if (
      altStates[PLANTYPE.BIKEPARK][0].loading === ALT_STATE.DONE &&
      altStates[PLANTYPE.BIKETRANSIT][0].loading === ALT_STATE.DONE
    ) {
      const plan = mergeBikeTransitPlans(
        altStates[PLANTYPE.BIKEPARK][0].plan,
        altStates[PLANTYPE.BIKETRANSIT][0].plan,
      );
      setBikePublicState({ plan });
    }
  }, [
    altStates[PLANTYPE.BIKEPARK][0].plan,
    altStates[PLANTYPE.BIKETRANSIT][0].plan,
  ]);

  const setMWTRef = ref => {
    mwtRef.current = ref;
  };

  const focusToPoint = (lat, lon) => {
    if (breakpoint !== 'large') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      expandMapRef.current += 1;
    }
    navigateMap();
    setMapState({ center: { lat, lon }, bounds: null });
  };

  const focusToLeg = leg => {
    if (breakpoint !== 'large') {
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
    const subPath = altTransitHash.includes(hash) ? `/${hash}` : '';

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });

    const newLocationState = {
      ...location,
      state: { selectedItineraryIndex: index },
    };
    const pagePath = `${getItineraryPagePath(
      params.from,
      params.to,
    )}${subPath}/${index}`;

    newLocationState.pathname = pagePath;
    router.replace(newLocationState);
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
        ...settingsState,
        settingsOpen: true,
        settingsOnOpen: getSettings(config),
      });
      if (breakpoint !== 'large') {
        router.push({
          ...location,
          state: {
            ...location.state,
            itinerarySettingsOpen: true,
          },
        });
      }
      return;
    }

    const settingsChanged = !isEqual(
      settingsState.settingsOnOpen,
      getSettings(config),
    )
      ? settingsState.settingsChanged + 1
      : settingsState.settingsChanged;
    setSettingsState({
      ...settingsState,
      settingsOpen: false,
      settingsChanged,
    });

    if (breakpoint !== 'large') {
      router.go(-1);
    }
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

  function renderMap(from, to, viaPoints, planEdges, activeIndex, detailView) {
    const mwtProps = {};
    if (mapState.bounds) {
      mwtProps.bounds = mapState.bounds;
    } else if (mapState.center) {
      mwtProps.lat = mapState.center.lat;
      mwtProps.lon = mapState.center.lon;
    } else {
      mwtProps.bounds = getBounds(planEdges, from, to, viaPoints);
    }

    const itineraryContainsDepartureFromVehicleRentalStation = planEdges?.[
      activeIndex
    ]?.node.legs.some(leg => leg.from?.vehicleRentalStation);

    const mapLayerOptions = itineraryContainsDepartureFromVehicleRentalStation
      ? addBikeStationMapForRentalVehicleItineraries(planEdges)
      : props.mapLayerOptions;

    const objectsToHide = getRentalStationsToHideOnMap(
      itineraryContainsDepartureFromVehicleRentalStation,
      planEdges?.[activeIndex]?.node,
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
        breakpoint={breakpoint}
        planEdges={planEdges}
        topics={topicsState}
        active={activeIndex}
        showActive={!!detailView}
        showVehicles={showVehicles()}
        showDurationBubble={planEdges?.[0]?.node.legs?.length === 1}
        objectsToHide={objectsToHide}
      />
    );
  }

  const walkPlan = altStates[PLANTYPE.WALK][0].plan;
  const bikePlan = altStates[PLANTYPE.BIKE][0].plan;
  const carPlan = altStates[PLANTYPE.CAR][0].plan;
  const parkRidePlan = altStates[PLANTYPE.PARKANDRIDE][0].plan;
  const bikePublicPlan = bikePublicState.plan;

  const hasNoTransitItineraries = filterWalk(state.plan?.edges).length === 0;
  const settings = getSettings(config);

  let plan = mapHashToPlan();
  const showRelaxedPlanNotifier = plan === relaxState.plan;

  /* NOTE: as a temporary solution, do filtering by feedId in UI */
  if (config.feedIdFiltering && plan) {
    plan = filterItinerariesByFeedId(plan, config);
  }
  let combinedEdges;
  // Remove old itineraries if new query cannot find a route
  if (state.error) {
    combinedEdges = [];
  } else if (streetHashes.includes(hash)) {
    combinedEdges = plan?.edges || [];
  } else {
    combinedEdges = getCombinedPlanEdges();
    if (!hasNoTransitItineraries) {
      // don't show plain walking in transit itinerary list
      combinedEdges = filterWalk(combinedEdges);
    }
  }
  const selectedIndex = getSelectedItineraryIndex(location, combinedEdges);
  const from = otpToLocation(params.from);
  const to = otpToLocation(params.to);
  const viaPoints = getIntermediatePlaces(query);

  const hasItineraries = combinedEdges.length > 0;
  if (hasItineraries && match.routes.some(route => route.printPage)) {
    return cloneElement(props.content, {
      itinerary: combinedEdges[selectedIndex],
      focusToPoint,
      from,
      to,
    });
  }

  const searchTime = plan?.searchDateTime
    ? Date.parse(plan.searchDateTime)
    : query.time
      ? query.time * 1000
      : new Date().getTime();

  const detailView = altTransitHash.includes(hash) ? secondHash : hash;

  // no map on mobile summary view
  const map =
    !detailView && breakpoint !== 'large'
      ? null
      : renderMap(
          from,
          to,
          viaPoints,
          combinedEdges,
          selectedIndex,
          detailView,
        );

  const desktop = breakpoint === 'large';
  // must wait alternatives to render correct notifier
  const loadingAlt = altLoading();
  const waitAlternatives = hasNoTransitItineraries && loadingAlt;
  const loading =
    state.loading ||
    (relaxState.loading && hasNoTransitItineraries) ||
    waitAlternatives ||
    (streetHashes.includes(hash) && loadingAlt); // viewing unfinished alt plan

  const settingsDrawer =
    !detailView && settingsState.settingsOpen ? (
      <div className={desktop ? 'offcanvas' : 'offcanvas-mobile'}>
        <CustomizeSearch onToggleClick={toggleSettings} mobile={!desktop} />
      </div>
    ) : null;

  // in mobile, settings drawer hides other content
  const panelHidden = !desktop && settingsDrawer !== null;
  let content; // bottom content of itinerary panel
  if (panelHidden) {
    content = null;
  } else if (loading) {
    content = (
      <div style={{ position: 'relative', height: 200 }}>
        <Loading />
      </div>
    );
  } else if (detailView) {
    content = (
      <ItineraryTabs
        isMobile={!desktop}
        tabIndex={selectedIndex}
        changeHash={changeHash}
        plan={plan}
        planEdges={combinedEdges}
        focusToPoint={focusToPoint}
        focusToLeg={focusToLeg}
        carItinerary={carPlan?.edges?.[0]}
        bikeAndPublicItineraryCount={bikePublicPlan.bikePublicItineraryCount}
      />
    );
  } else {
    const settingsNotification =
      !showRelaxedPlanNotifier && // show only on notifier about limitations
      settingsLimitRouting(config) &&
      !isEqualItineraries(state.plan?.edges, relaxState.plan?.edges) &&
      relaxState.plan?.edges?.length > 0 &&
      !settingsState.settingsChanged &&
      !hash; // no notifier on p&r or bike&public lists

    content = (
      <ItineraryListContainer
        activeIndex={selectedIndex}
        planEdges={combinedEdges}
        params={params}
        bikeParkItineraryCount={bikePublicPlan.bikeParkItineraryCount}
        showRelaxedPlanNotifier={showRelaxedPlanNotifier}
        separatorPosition={state.separatorPosition}
        onLater={onLater}
        onEarlier={onEarlier}
        focusToHeader={focusToHeader}
        loading={loading}
        loadingMore={state.loadingMore}
        settingsNotification={settingsNotification}
        routingFeedbackPosition={
          hash ? undefined : state.routingFeedbackPosition
        }
        topNote={state.topNote}
        bottomNote={state.bottomNote}
        searchTime={searchTime}
        routingErrors={plan?.routingErrors}
        from={from}
        to={to}
        error={state.error}
        walking={walkPlan?.edges?.length > 0}
        biking={bikePlan?.edges?.length > 0 || !!bikePublicPlan?.edges?.length}
        driving={
          (settings.includeCarSuggestions && carPlan?.edges?.length > 0) ||
          !!parkRidePlan?.edges?.length
        }
      />
    );
  }

  const showAltBar =
    !detailView &&
    !panelHidden &&
    !streetHashes.includes(hash) &&
    (loadingAlt || // show shimmer
      walkPlan?.edges?.length ||
      bikePlan?.edges?.length ||
      bikePublicPlan?.edges?.length ||
      parkRidePlan?.edges?.length ||
      (settings.includeCarSuggestions && carPlan?.edges?.length));

  const alternativeItineraryBar = showAltBar ? (
    <AlternativeItineraryBar
      selectStreetMode={selectStreetMode}
      setStreetModeAndSelect={setStreetModeAndSelect}
      weatherData={weatherState.weatherData}
      walkPlan={walkPlan}
      bikePlan={bikePlan}
      bikePublicPlan={bikePublicPlan}
      parkRidePlan={parkRidePlan}
      carPlan={settings.includeCarSuggestions ? carPlan : undefined}
      loading={loading || loadingAlt || weatherState.loading}
    />
  ) : null;

  const header = !detailView && !panelHidden && (
    <>
      <div role="status" className="sr-only" id="status" aria-live="polite">
        <FormattedMessage id={ariaRef.current} />
      </div>
      <ItineraryPageControls params={params} toggleSettings={toggleSettings} />
      {alternativeItineraryBar}
    </>
  );

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
        content={content}
        settingsDrawer={settingsDrawer}
        map={map}
        scrollable
      />
    );
  }

  return (
    <MobileView
      header={header}
      content={content}
      settingsDrawer={settingsDrawer}
      map={map}
      expandMap={expandMapRef.current}
    />
  );
}

ItineraryPage.contextTypes = {
  config: configShape,
  executeAction: PropTypes.func.isRequired,
  headers: PropTypes.objectOf(PropTypes.string),
  getStore: PropTypes.func,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

ItineraryPage.propTypes = {
  match: matchShape.isRequired,
  content: PropTypes.node,
  map: PropTypes.shape({ type: PropTypes.func.isRequired }),
  breakpoint: PropTypes.string.isRequired,
  relayEnvironment: relayShape.isRequired,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
};

ItineraryPage.defaultProps = {
  content: undefined,
  map: undefined,
};
