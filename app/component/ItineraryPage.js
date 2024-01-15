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
import get from 'lodash/get';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import polyline from 'polyline-encoded';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import ItineraryPageMap from './map/ItineraryPageMap';
import ItineraryListContainer from './ItineraryListContainer';
import ItineraryPageControls from './ItineraryPageControls';
import MobileItineraryWrapper from './MobileItineraryWrapper';
import { getWeatherData } from '../util/apiUtils';
import Loading from './Loading';
import { getSummaryPath } from '../util/path';
import { boundWithMinimumArea } from '../util/geo-utils';
import {
  planQuery,
  moreItinerariesQuery,
  walkAndBikeQuery,
  allModesQuery,
  viewerQuery,
} from './ItineraryQueries';
import {
  showDetailView,
  getActiveIndex,
  getHashIndex,
  reportError,
  addFeedbackly,
  getTopicOptions,
  getBounds,
  compareItineraries,
  settingsLimitRouting,
  setCurrentTimeToURL,
  startClient,
  updateClient,
  stopClient,
  getRentalStationsToHideOnMap,
  addBikeStationMapForRentalVehicleItineraries,
  checkDayNight,
  filterItinerariesByFeedId,
} from './ItineraryPageUtils';
import withBreakpoint from '../util/withBreakpoint';
import { isIOS } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  parseLatLon,
  otpToLocation,
  getIntermediatePlaces,
} from '../util/otpStrings';
import { SettingsDrawer } from './SettingsDrawer';

import ItineraryDetails from './ItineraryDetails';
import { StreetModeSelector } from './StreetModeSelector';
import SwipeableTabs from './SwipeableTabs';
import {
  getCurrentSettings,
  preparePlanParams,
  hasStartAndDestination,
} from '../util/planParamUtil';
import { getTotalBikingDistance } from '../util/legUtils';
import {
  getBikeAndPublic,
  getDuration,
  hasItinerariesContainingPublicTransit,
} from '../util/itineraryUtils';
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

class ItineraryPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired,
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
    this.originalPlan = props.viewer?.plan;
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
      alternativePlan: undefined,
      earlierItineraries: [],
      laterItineraries: [],
      previouslySelectedPlan: props.viewer?.plan,
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
      settingsChangedRecently: false,
    };
    if (props.match.params.hash === 'walk') {
      this.selectedPlan = this.state.walkPlan;
    } else if (props.match.params.hash === 'bike') {
      this.selectedPlan = this.state.bikePlan;
    } else if (props.match.params.hash === 'bikeAndVehicle') {
      this.selectedPlan = {
        itineraries: [
          ...(this.state.bikeParkPlan?.itineraries || []),
          ...(this.state.bikeAndPublicPlan?.itineraries || []),
        ],
      };
    } else if (this.state.streetMode === 'car') {
      this.selectedPlan = this.state.carPlan;
    } else if (this.state.streetMode === 'parkAndRide') {
      this.selectedPlan = this.state.parkRidePlan;
    } else {
      this.selectedPlan = props.viewer && props.viewer.plan;
    }
    /* A query with all modes is made on page load if search settings
       ('modes', 'walkBoardCost', 'ticketTypes', 'walkReluctance') differ from defaults.
       The all modes query uses default settings. */
    if (
      settingsLimitRouting(context.config) &&
      hasStartAndDestination(props.match.params)
    ) {
      this.makeQueryWithAllModes();
    }
  }

  stopClientAndUpdateTopics() {
    stopClient(this.context);
    this.setState({ itineraryTopics: undefined });
  }

  toggleStreetMode = newStreetMode => {
    const newState = {
      ...this.props.match.location,
      state: { summaryPageSelected: 0 },
    };
    const basePath = getSummaryPath(
      this.props.match.params.from,
      this.props.match.params.to,
    );
    const indexPath = `${getSummaryPath(
      this.props.match.params.from,
      this.props.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
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

  selectFirstItinerary(newStreetMode) {
    const newState = {
      ...this.props.match.location,
      state: { summaryPageSelected: 0 },
    };

    const basePath = `${getSummaryPath(
      this.props.match.params.from,
      this.props.match.params.to,
    )}`;
    const indexPath = `${getSummaryPath(
      this.props.match.params.from,
      this.props.match.params.to,
    )}/${newStreetMode}`;

    newState.pathname = basePath;
    this.context.router.replace(newState);
    newState.pathname = indexPath;
    this.context.router.push(newState);
  }

  // this must be fixed, totally twisted logic which is corrected by some counter bugs elsewhere
  // returns true when there is an empty initerary array
  // but not if such array is not found
  planHasNoItineraries() {
    return (
      this.props.viewer?.plan?.itineraries &&
      this.props.viewer.plan.itineraries.filter(
        itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
      ).length === 0
    );
  }

  planHasNoStreetModeItineraries() {
    return (
      !this.state.bikePlan?.itineraries?.length &&
      !this.state.carPlan?.itineraries?.length &&
      !this.state.parkRidePlan?.itineraries?.length &&
      !this.state.bikeParkPlan?.itineraries?.length &&
      !this.state.bikeAndPublicPlan?.itineraries?.length
    );
  }

  paramsOrQueryHaveChanged() {
    return (
      !isEqual(this.params, this.props.match.params) ||
      !isEqual(this.query, this.props.match.location.query)
    );
  }

  setParamsAndQuery() {
    this.params = this.props.match.params;
    this.query = this.props.match.location.query;
  }

  resetItineraryPageSelection = () => {
    this.context.router.replace({
      ...this.props.match.location,
      state: {
        ...this.props.match.location.state,
        summaryPageSelected: undefined,
      },
    });
  };

  makeWalkAndBikeQueries() {
    const planParams = preparePlanParams(this.context.config, false)(
      this.props.match.params,
      this.props.match,
    );

    fetchQuery(this.props.relayEnvironment, walkAndBikeQuery, planParams)
      .toPromise()
      .then(result => {
        this.setState(
          {
            isFetchingWalkAndBike: false,
            walkPlan: result.walkPlan,
            bikePlan: result.bikePlan,
            bikeAndPublicPlan: result.bikeAndPublicPlan,
            bikeParkPlan: result.bikeParkPlan,
            carPlan: result.carPlan,
            parkRidePlan: result.parkRidePlan,
          },
          () => {
            this.makeWeatherQuery();
          },
        );
      })
      .catch(() => {
        this.setState({ isFetchingWalkAndBike: false });
      });
  }

  makeQueryWithAllModes() {
    this.setState({ loading: true });
    this.resetItineraryPageSelection();

    const planParams = preparePlanParams(this.context.config, true)(
      this.props.match.params,
      this.props.match,
    );
    fetchQuery(this.props.relayEnvironment, allModesQuery, planParams, {
      force: true,
    })
      .toPromise()
      .then(({ plan: results }) => {
        this.setState(
          {
            alternativePlan: results,
            earlierItineraries: [],
            laterItineraries: [],
            separatorPosition: undefined,
          },
          () => {
            this.setState({ loading: false });
            this.isFetching = false;
            this.setParamsAndQuery();
            this.allModesQueryDone = true;
          },
        );
      });
  }

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
      this.setState({ loading: false });
      return;
    }

    const useRelaxedRoutingPreferences =
      this.planHasNoItineraries() && this.state.alternativePlan;

    const params = preparePlanParams(
      this.context.config,
      useRelaxedRoutingPreferences,
    )(this.props.match.params, this.props.match);

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: false,
      date: latestDepartureTime.format('YYYY-MM-DD'),
      time: latestDepartureTime.format('HH:mm'),
    };

    this.setModeToParkRideIfSelected(tunedParams);

    fetchQuery(this.props.relayEnvironment, moreItinerariesQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
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
          this.resetItineraryPageSelection();
        } else {
          this.setState(prevState => {
            return {
              laterItineraries: [
                ...prevState.laterItineraries,
                ...result.itineraries,
              ],
              loadingMoreItineraries: undefined,
              routingFeedbackPosition: prevState.routingFeedbackPosition
                ? prevState.routingFeedbackPosition + result.itineraries.length
                : result.itineraries.length,
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
        /* replaceQueryParams(this.context.router, this.props.match, {
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
      this.setState({ loading: false });
      return;
    }

    const useRelaxedRoutingPreferences =
      this.planHasNoItineraries() && this.state.alternativePlan;

    const params = preparePlanParams(
      this.context.config,
      useRelaxedRoutingPreferences,
    )(this.props.match.params, this.props.match);

    const tunedParams = {
      wheelchair: null,
      ...params,
      numItineraries: 5,
      arriveBy: true,
      date: earliestArrivalTime.format('YYYY-MM-DD'),
      time: earliestArrivalTime.format('HH:mm'),
    };

    this.setModeToParkRideIfSelected(tunedParams);

    fetchQuery(this.props.relayEnvironment, moreItinerariesQuery, tunedParams)
      .toPromise()
      .then(({ plan: result }) => {
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
              routingFeedbackPosition: prevState.routingFeedbackPosition
                ? prevState.routingFeedbackPosition
                : reversedItineraries.length,
            };
          });

          this.resetItineraryPageSelection();
        }
      });
  };

  // save url-defined location to old searches
  saveUrlSearch(endpoint) {
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
  }

  updateLocalStorage(saveEndpoints) {
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
  }

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
    addFeedbackly(this.context);
    if (this.showVehicles()) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      // If user comes from eg. RoutePage, old client may not have been completely shut down yet.
      // This will prevent situation where RoutePages vehicles would appear on ItineraryPage
      if (!client) {
        const combinedItineraries = this.getCombinedItineraries();
        const itineraryTopics = getTopicOptions(
          this.context.config,
          combinedItineraries,
          this.props.match,
        );
        startClient(itineraryTopics, this.context);
        this.setState({ itineraryTopics });
      }
    }
  }

  componentWillUnmount() {
    if (this.showVehicles()) {
      stopClient(this.context);
    }
  }

  componentDidUpdate(prevProps) {
    const { hash } = this.props.match.params;
    const { state, props } = this;
    setCurrentTimeToURL(this.context.config, props.match);
    // screen reader alert when new itineraries are fetched
    if (
      hash === undefined &&
      props.viewer?.plan?.itineraries &&
      !this.secondQuerySent
    ) {
      this.showScreenreaderLoadedAlert();
    }

    const viaPoints = getIntermediatePlaces(props.match.location.query);
    if (
      ['walk', 'bike', 'bikeAndVehicle', 'car', 'parkAndRide'].includes(hash)
    ) {
      // Reset streetmode selection if intermediate places change
      if (
        !isEqual(
          getIntermediatePlaces(prevProps.match.location.query),
          viaPoints,
        )
      ) {
        const newMatchLoc = {
          ...props.match.location,
        };
        const indexPath = `${getSummaryPath(
          props.match.params.from,
          props.match.params.to,
        )}`;
        newMatchLoc.pathname = indexPath;
        this.context.router.push(newMatchLoc);
      }
    }
    if (
      props.match.location.pathname !== prevProps.match.location.pathname ||
      props.match.location.query !== prevProps.match.location.query
    ) {
      this.updateLocalStorage(false);
    }

    // Reset walk and bike suggestions when new search is made
    if (
      this.selectedPlan !== state.alternativePlan &&
      !isEqual(props.viewer?.plan, this.originalPlan) &&
      this.paramsOrQueryHaveChanged() &&
      this.secondQuerySent &&
      !state.isFetchingWalkAndBike
    ) {
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
            settingsLimitRouting(this.context.config) &&
            hasStartAndDestination(props.match.params) &&
            hasNonWalkingItinerary
          ) {
            this.makeQueryWithAllModes();
          }
        },
      );
    }

    // Public transit routes fetched, now fetch walk and bike itineraries
    if (props.viewer?.plan?.itineraries && !this.secondQuerySent) {
      this.originalPlan = props.viewer.plan;
      this.secondQuerySent = true;
      if (
        !isEqual(
          otpToLocation(props.match.params.from),
          otpToLocation(props.match.params.to),
        ) ||
        viaPoints.length
      ) {
        this.makeWalkAndBikeQueries();
      } else {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ isFetchingWalkAndBike: false });
      }
    }

    if (props.error) {
      reportError(props.error);
    }
    if (this.showVehicles()) {
      let combinedItineraries = this.getCombinedItineraries();
      if (
        combinedItineraries.length &&
        hash !== 'walk' &&
        hash !== 'bikeAndVehicle'
      ) {
        combinedItineraries = combinedItineraries.filter(
          itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
        ); // exclude itineraries that have only walking legs from the summary
      }
      const itineraryTopics = getTopicOptions(
        this.context.config,
        combinedItineraries,
        props.match,
      );
      const { client } = this.context.getStore('RealTimeInformationStore');
      // Client may not be initialized yet if there was an client before ComponentDidMount
      if (!isEqual(itineraryTopics, state.itineraryTopics) || !client) {
        updateClient(itineraryTopics, this.context);
      }
      if (!isEqual(itineraryTopics, this.state.itineraryTopics)) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ itineraryTopics });
      }
    } else if (!isEmpty(state.itineraryTopics)) {
      this.stopClientAndUpdateTopics();
    }
    if (
      hash === 'parkAndRide' &&
      !state.isFetchingWalkAndBike &&
      !Array.isArray(state.parkRidePlan?.itineraries)
    ) {
      this.toggleStreetMode(''); // go back to showing normal itineraries
    }
    if (hash === 'bikeAndVehicle') {
      const bikeParkPlan = getBikeAndPublic(state.bikeParkPlan);
      const bikeAndPublicPlan = getBikeAndPublic(state.bikeAndPublicPlan);

      const hasBikeAndPublicPlan = Array.isArray(
        bikeAndPublicPlan?.itineraries,
      );
      const hasBikeParkPlan = Array.isArray(bikeParkPlan?.itineraries);
      if (
        !state.isFetchingWalkAndBike &&
        !hasBikeAndPublicPlan &&
        !hasBikeParkPlan
      ) {
        this.toggleStreetMode(''); // go back to showing normal itineraries
      }
    }
  }

  setError(error) {
    reportError(error);
    this.setState({ error });
  }

  setMWTRef = ref => {
    this.mwtRef = ref;
  };

  // make the map to obey external navigation
  navigateMap() {
    // map sticks to user location if tracking is on, so set it off
    if (this.mwtRef?.disableMapTracking) {
      this.mwtRef.disableMapTracking();
    }
    // map will not react to location props unless they change or update is forced
    if (this.mwtRef?.forceRefresh) {
      this.mwtRef.forceRefresh();
    }
  }

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

  makeWeatherQuery() {
    const from = otpToLocation(this.props.match.params.from);
    const { walkPlan, bikePlan } = this.state;
    const bikeParkPlan = getBikeAndPublic(this.state.bikeParkPlan);
    const bikeAndPublicPlan = getBikeAndPublic(this.state.bikeAndPublicPlan);
    const itin =
      walkPlan?.itineraries?.[0] ||
      bikePlan?.itineraries?.[0] ||
      bikeAndPublicPlan?.itineraries?.[0] ||
      bikeParkPlan?.itineraries?.[0];

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
                  // Icon id's and descriptions: www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje ->  Sääsymbolien selitykset ennusteissa
                  iconId: checkDayNight(
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
              this.props.alertRef.current.innerHTML =
                this.context.intl.formatMessage({
                  id: 'itinerary-summary-page-street-mode.update-alert',
                  defaultMessage: 'Walking and biking results updated',
                });
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
      ...this.props.match.location,
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
    const detailView = showDetailView(
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
      getHashIndex(match.params) ||
      getActiveIndex(match.location, filteredItineraries);

    const mwtProps = {};
    if (this.state.bounds) {
      mwtProps.bounds = this.state.bounds;
    } else if (this.state.center) {
      mwtProps.lat = this.state.center.lat;
      mwtProps.lon = this.state.center.lon;
    } else {
      mwtProps.bounds = getBounds(filteredItineraries, from, to, viaPoints);
    }

    const onlyHasWalkingItineraries =
      this.planHasNoItineraries() &&
      (this.planHasNoStreetModeItineraries() || this.isWalkingFastest());

    const itineraryContainsDepartureFromVehicleRentalStation =
      filteredItineraries[activeIndex]?.legs.some(
        leg => leg.from?.vehicleRentalStation,
      );

    const mapLayerOptions = itineraryContainsDepartureFromVehicleRentalStation
      ? addBikeStationMapForRentalVehicleItineraries(filteredItineraries)
      : this.props.mapLayerOptions;

    const objectsToHide = getRentalStationsToHideOnMap(
      itineraryContainsDepartureFromVehicleRentalStation,
      filteredItineraries[activeIndex],
    );
    return (
      <ItineraryPageMap
        {...mwtProps}
        from={from}
        to={to}
        viaPoints={viaPoints}
        zoom={POINT_FOCUS_ZOOM}
        mapLayers={this.props.mapLayers}
        mapLayerOptions={mapLayerOptions}
        setMWTRef={this.setMWTRef}
        breakpoint={breakpoint}
        itineraries={filteredItineraries}
        topics={this.state.itineraryTopics}
        active={activeIndex}
        showActive={detailView}
        showVehicles={this.showVehicles()}
        showDurationBubble={
          onlyHasWalkingItineraries && !this.state.alternativePlan
        }
        objectsToHide={objectsToHide}
      />
    );
  }

  toggleSearchSettings = () => {
    this.showSettingsPanel(!this.state.settingsOpen);
  };

  showSettingsPanel(isOpen) {
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
        if (isOpen) {
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
      name: isOpen ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });
    if (isOpen) {
      this.setState({ settingsOpen: true });
      if (this.props.breakpoint !== 'large') {
        this.context.router.push({
          ...this.props.match.location,
          state: {
            ...this.props.match.location.state,
            customizeSearchOffcanvas: isOpen,
          },
        });
      }
      this.setState({
        settingsOnOpen: getCurrentSettings(this.context.config, ''),
      });
    } else {
      this.setState({ settingsOpen: false });
      if (this.props.breakpoint !== 'large') {
        if (
          !isEqual(
            this.state.settingsOnOpen,
            getCurrentSettings(this.context.config, ''),
          )
        ) {
          if (
            !isEqual(
              otpToLocation(this.props.match.params.from),
              otpToLocation(this.props.match.params.to),
            ) ||
            getIntermediatePlaces(this.props.match.location.query).length
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
            otpToLocation(this.props.match.params.from),
            otpToLocation(this.props.match.params.to),
          ) ||
          getIntermediatePlaces(this.props.match.location.query).length
        ) {
          this.setState(
            {
              isFetchingWalkAndBike: true,
              loading: true,
            },
            // eslint-disable-next-line func-names
            function () {
              const planParams = preparePlanParams(this.context.config, false)(
                this.props.match.params,
                this.props.match,
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
                    this.resetItineraryPageSelection();
                  },
                );
              });
            },
          );
        }
      }
    }
  }

  showVehicles() {
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
      this.context.config.showVehiclesOnItineraryPage &&
      hash !== 'walk' &&
      hash !== 'bike' &&
      hash !== 'car' &&
      (this.props.breakpoint === 'large' || hash)
    );
  }

  getCombinedItineraries() {
    const itineraries = [
      ...(this.state.earlierItineraries || []),
      ...(this.selectedPlan?.itineraries || []),
      ...(this.state.laterItineraries || []),
    ];
    return itineraries.filter(x => x !== undefined);
  }

  onDetailsTabFocused = () => {
    setTimeout(() => {
      if (this.tabHeaderRef.current) {
        this.tabHeaderRef.current.focus();
      }
    }, 500);
  };

  isWalkingFastest() {
    const walkDuration = getDuration(this.state.walkPlan);
    const bikeDuration = getDuration(this.state.bikePlan);
    const carDuration = getDuration(this.state.carPlan);
    const parkAndRideDuration = getDuration(this.state.parkRidePlan);
    const bikeParkDuration = getDuration(this.state.bikeParkPlan);
    let bikeAndPublicDuration;
    if (this.context.config.includePublicWithBikePlan) {
      bikeAndPublicDuration = getDuration(this.state.bikeAndPublicPlan);
    }
    if (
      !walkDuration ||
      (bikeDuration && bikeDuration < walkDuration) ||
      (carDuration && carDuration < walkDuration) ||
      (parkAndRideDuration && parkAndRideDuration < walkDuration) ||
      (bikeParkDuration && bikeParkDuration < walkDuration) ||
      (bikeAndPublicDuration && bikeAndPublicDuration < walkDuration)
    ) {
      return false;
    }
    return true;
  }

  isLoading(onlyWalkingItins, onlyWalkingAlternatives) {
    if (this.state.loading) {
      return true;
    }
    if (onlyWalkingItins && onlyWalkingAlternatives) {
      return false;
    }
    return false;
  }

  render() {
    const { props, context, state } = this;
    const { match, error } = props;
    const { walkPlan, bikePlan, carPlan, parkRidePlan } = state;
    const { config } = context;
    const { params } = match;
    const { hash, secondHash } = params;

    let plan;
    /* NOTE: as a temporary solution, do filtering by feedId in UI */
    if (config.feedIdFiltering) {
      plan = filterItinerariesByFeedId(props.viewer?.plan, this.context.config);
    } else {
      plan = props.viewer?.plan;
    }

    const bikeParkPlan = getBikeAndPublic(state.bikeParkPlan);
    const bikeAndPublicPlan = getBikeAndPublic(state.bikeAndPublicPlan);
    const planHasNoItineraries = this.planHasNoItineraries();
    if (
      planHasNoItineraries &&
      userHasChangedModes(config) &&
      !this.isFetching &&
      (!state.alternativePlan ||
        !isEqual(props.viewer?.plan, this.originalPlan))
    ) {
      this.originalPlan = props.viewer.plan;
      this.isFetching = true;
      this.setState({ isFetchingWalkAndBike: true });
      this.makeWalkAndBikeQueries();
    }
    const hasAlternativeItineraries =
      state.alternativePlan?.itineraries?.length > 0;

    this.bikeAndPublicItinerariesToShow = 0;
    this.bikeAndParkItinerariesToShow = 0;
    if (hash === 'walk') {
      if (state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      this.selectedPlan = walkPlan;
    } else if (hash === 'bike') {
      if (state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      this.selectedPlan = bikePlan;
    } else if (hash === 'bikeAndVehicle') {
      if (state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      const hasBikeAndPublicPlan = Array.isArray(
        bikeAndPublicPlan?.itineraries,
      );

      if (
        hasBikeAndPublicPlan &&
        hasItinerariesContainingPublicTransit(bikeAndPublicPlan) &&
        hasItinerariesContainingPublicTransit(bikeParkPlan)
      ) {
        this.selectedPlan = {
          itineraries: [
            ...bikeParkPlan.itineraries.slice(0, 3),
            ...bikeAndPublicPlan.itineraries.slice(0, 3),
          ],
        };
      } else if (
        hasBikeAndPublicPlan &&
        hasItinerariesContainingPublicTransit(bikeAndPublicPlan)
      ) {
        this.selectedPlan = bikeAndPublicPlan;
      } else if (hasItinerariesContainingPublicTransit(bikeParkPlan)) {
        this.selectedPlan = bikeParkPlan;
      }
      this.bikeAndPublicItinerariesToShow = hasBikeAndPublicPlan
        ? Math.min(bikeAndPublicPlan.itineraries.length, 3)
        : 0;
      this.bikeAndParkItinerariesToShow = hasBikeAndPublicPlan
        ? Math.min(bikeParkPlan.itineraries.length, 3)
        : 0;
    } else if (hash === 'car') {
      if (state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      this.selectedPlan = carPlan;
    } else if (hash === 'parkAndRide') {
      if (state.isFetchingWalkAndBike) {
        return <Loading />;
      }
      this.selectedPlan = parkRidePlan;
    } else if (planHasNoItineraries && hasAlternativeItineraries) {
      this.selectedPlan = state.alternativePlan;
    } else {
      this.selectedPlan = plan;
    }

    const currentSettings = getCurrentSettings(config, '');

    let itineraryWalkDistance;
    let itineraryBikeDistance;
    if (walkPlan?.itineraries?.length) {
      itineraryWalkDistance = walkPlan.itineraries[0].walkDistance;
    }
    if (bikePlan?.itineraries?.length) {
      itineraryBikeDistance = getTotalBikingDistance(bikePlan.itineraries[0]);
    }

    const showWalkOptionButton = Boolean(
      !config.hideWalkOption &&
        walkPlan?.itineraries?.length &&
        !currentSettings.accessibilityOption &&
        itineraryWalkDistance < config.suggestWalkMaxDistance,
    );

    const bikePlanContainsOnlyWalk =
      !bikePlan ||
      !bikePlan.itineraries ||
      bikePlan.itineraries.every(itinerary =>
        itinerary.legs.every(leg => leg.mode === 'WALK'),
      );
    const showBikeOptionButton = Boolean(
      bikePlan?.itineraries?.length &&
        !currentSettings.accessibilityOption &&
        currentSettings.includeBikeSuggestions &&
        !bikePlanContainsOnlyWalk &&
        itineraryBikeDistance < config.suggestBikeMaxDistance,
    );

    const bikeAndPublicPlanHasItineraries =
      hasItinerariesContainingPublicTransit(bikeAndPublicPlan);
    const bikeParkPlanHasItineraries =
      hasItinerariesContainingPublicTransit(bikeParkPlan);
    const showBikeAndPublicOptionButton = !config.includePublicWithBikePlan
      ? bikeParkPlanHasItineraries &&
        !currentSettings.accessibilityOption &&
        currentSettings.showBikeAndParkItineraries
      : (bikeAndPublicPlanHasItineraries || bikeParkPlanHasItineraries) &&
        !currentSettings.accessibilityOption &&
        currentSettings.includeBikeSuggestions;

    const hasCarItinerary = !isEmpty(get(carPlan, 'itineraries'));
    const showCarOptionButton =
      config.includeCarSuggestions &&
      currentSettings.includeCarSuggestions &&
      hasCarItinerary;

    const hasParkAndRideItineraries = !isEmpty(
      get(parkRidePlan, 'itineraries'),
    );
    const showParkRideOptionButton =
      config.includeParkAndRideSuggestions &&
      currentSettings.includeParkAndRideSuggestions &&
      hasParkAndRideItineraries;

    const showStreetModeSelector =
      (showWalkOptionButton ||
        showBikeOptionButton ||
        showBikeAndPublicOptionButton ||
        showCarOptionButton ||
        showParkRideOptionButton) &&
      hash !== 'bikeAndVehicle' &&
      hash !== 'parkAndRide';

    const hasItineraries = Array.isArray(this.selectedPlan?.itineraries);

    if (
      !this.isFetching &&
      hasItineraries &&
      (this.selectedPlan !== state.alternativePlan ||
        this.selectedPlan !== plan) &&
      !isEqual(this.selectedPlan, state.previouslySelectedPlan)
    ) {
      this.setState({
        previouslySelectedPlan: this.selectedPlan,
        separatorPosition: undefined,
        earlierItineraries: [],
        laterItineraries: [],
      });
    }
    let combinedItineraries = this.getCombinedItineraries();

    const onlyHasWalkingItineraries =
      this.planHasNoItineraries() &&
      (this.planHasNoStreetModeItineraries() || this.isWalkingFastest());

    let onlyWalkingAlternatives = false;
    // Don't show only walking alternative itineraries
    if (onlyHasWalkingItineraries && state.alternativePlan) {
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
      combinedItineraries.length &&
      hash !== 'walk' &&
      hash !== 'bikeAndVehicle' &&
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

    const itineraryIndex = getHashIndex(params);

    const from = otpToLocation(params.from);
    const to = otpToLocation(params.to);
    const viaPoints = getIntermediatePlaces(match.location.query);

    if (match.routes.some(route => route.printPage) && hasItineraries) {
      return React.cloneElement(props.content, {
        itinerary:
          combinedItineraries[
            itineraryIndex < combinedItineraries.length ? itineraryIndex : 0
          ],
        focusToPoint: this.focusToPoint,
        from,
        to,
      });
    }

    let map = this.renderMap(from, to, viaPoints);

    const loadingPublicDone =
      state.loading === false && (error || props.loading === false);
    const waitForBikeAndWalk = () =>
      planHasNoItineraries && state.isFetchingWalkAndBike;

    const showSettingsNotification =
      settingsLimitRouting(this.context.config) &&
      !state.settingsChangedRecently &&
      !planHasNoItineraries &&
      compareItineraries(
        this.selectedPlan?.itineraries,
        state.alternativePlan?.itineraries,
      );

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
        (!onlyHasWalkingItineraries ||
          (onlyHasWalkingItineraries &&
            (this.allModesQueryDone || !settingsLimitRouting(config))))
      ) {
        const activeIndex =
          itineraryIndex || getActiveIndex(match.location, combinedItineraries);
        const selectedItineraries = combinedItineraries;
        const selectedItinerary = selectedItineraries
          ? selectedItineraries[activeIndex]
          : undefined;
        if (
          showDetailView(hash, secondHash, combinedItineraries) &&
          combinedItineraries.length
        ) {
          const itineraryTabs = selectedItineraries.map((itinerary, i) => {
            return (
              <div
                className={`swipeable-tab ${activeIndex !== i && 'inactive'}`}
                key={itinerary.key}
                aria-hidden={activeIndex !== i}
              >
                <ItineraryDetails
                  hideTitle
                  itinerary={itinerary}
                  focusToPoint={this.focusToPoint}
                  focusToLeg={this.focusToLeg}
                  isMobile={false}
                  carItinerary={carPlan?.itineraries[0]}
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
              content={content}
              map={map}
              bckBtnVisible
              bckBtnFallback="pop"
            />
          );
        }
        content = (
          <ItineraryListContainer
            activeIndex={activeIndex}
            plan={this.selectedPlan}
            routingErrors={this.selectedPlan.routingErrors}
            itineraries={selectedItineraries}
            params={params}
            error={error || state.error}
            bikeAndPublicItinerariesToShow={this.bikeAndPublicItinerariesToShow}
            bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
            walking={showWalkOptionButton}
            biking={showBikeOptionButton}
            driving={showCarOptionButton || showParkRideOptionButton}
            showAlternativePlan={
              planHasNoItineraries &&
              hasAlternativeItineraries &&
              !onlyWalkingAlternatives
            }
            separatorPosition={state.separatorPosition}
            loading={this.isLoading(
              onlyHasWalkingItineraries,
              onlyWalkingAlternatives,
            )}
            onLater={this.onLater}
            onEarlier={this.onEarlier}
            onDetailsTabFocused={this.onDetailsTabFocused}
            loadingMoreItineraries={state.loadingMoreItineraries}
            settingsNotification={showSettingsNotification}
            onlyHasWalkingItineraries={onlyHasWalkingItineraries}
            routingFeedbackPosition={state.routingFeedbackPosition}
          >
            {props.content &&
              React.cloneElement(props.content, {
                itinerary: selectedItineraries?.length && selectedItinerary,
                focusToPoint: this.focusToPoint,
                plan: this.selectedPlan,
              })}
          </ItineraryListContainer>
        );
      } else {
        content = (
          <div style={{ position: 'relative', height: 200 }}>
            <Loading />
          </div>
        );
        return itineraryIndex !== undefined ? (
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
                <ItineraryPageControls params={params} />
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
          bckBtnFallback={hash === 'bikeAndVehicle' ? 'pop' : undefined}
          header={
            <span aria-hidden={this.state.settingsOpen} ref={this.headerRef}>
              <ItineraryPageControls
                params={params}
                toggleSettings={this.toggleSearchSettings}
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
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
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
              {hash === 'parkAndRide' && (
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
            <span aria-hidden={this.state.settingsOpen} ref={this.contentRef}>
              {content}
            </span>
          }
          settingsDrawer={
            <SettingsDrawer
              open={this.state.settingsOpen}
              className="offcanvas"
            >
              <CustomizeSearch onToggleClick={this.toggleSearchSettings} />
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
      (!error && (!this.selectedPlan || props.loading === true)) ||
      state.loading !== false
    ) {
      isLoading = true;
      content = (
        <div style={{ position: 'relative', height: 200 }}>
          <Loading />
        </div>
      );
      if (itineraryIndex !== undefined) {
        return content;
      }
    }
    if (
      showDetailView(hash, secondHash, combinedItineraries) &&
      combinedItineraries.length
    ) {
      content = (
        <MobileItineraryWrapper
          itineraries={combinedItineraries}
          params={params}
          focusToPoint={this.focusToPoint}
          plan={this.selectedPlan}
          serviceTimeRange={props.serviceTimeRange}
          focusToLeg={this.focusToLeg}
          onSwipe={this.changeHash}
          carItinerary={carPlan?.itineraries[0]}
          changeHash={this.changeHash}
        >
          {props.content &&
            combinedItineraries.map((itinerary, i) =>
              React.cloneElement(props.content, {
                key: i,
                itinerary,
                plan: this.selectedPlan,
                serviceTimeRange: props.serviceTimeRange,
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
          <ItineraryListContainer
            activeIndex={
              itineraryIndex ||
              getActiveIndex(match.location, combinedItineraries)
            }
            plan={this.selectedPlan}
            routingErrors={this.selectedPlan.routingErrors}
            itineraries={combinedItineraries}
            params={params}
            error={error || state.error}
            from={params.from}
            to={params.to}
            intermediatePlaces={viaPoints}
            bikeAndPublicItinerariesToShow={this.bikeAndPublicItinerariesToShow}
            bikeAndParkItinerariesToShow={this.bikeAndParkItinerariesToShow}
            walking={showWalkOptionButton}
            biking={showBikeOptionButton}
            driving={showCarOptionButton || showParkRideOptionButton}
            showAlternativePlan={
              planHasNoItineraries &&
              hasAlternativeItineraries &&
              !onlyWalkingAlternatives
            }
            separatorPosition={state.separatorPosition}
            loading={this.isLoading(
              onlyHasWalkingItineraries,
              onlyWalkingAlternatives,
            )}
            onLater={this.onLater}
            onEarlier={this.onEarlier}
            onDetailsTabFocused={this.onDetailsTabFocused()}
            loadingMoreItineraries={state.loadingMoreItineraries}
            settingsNotification={showSettingsNotification}
            onlyHasWalkingItineraries={onlyHasWalkingItineraries}
            routingFeedbackPosition={state.routingFeedbackPosition}
          />
        );
      }
    }

    return (
      <MobileView
        header={
          !showDetailView(hash, secondHash, combinedItineraries) ? (
            <span aria-hidden={this.state.settingsOpen} ref={this.headerRef}>
              <ItineraryPageControls
                params={params}
                toggleSettings={this.toggleSearchSettings}
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
                  toggleStreetMode={this.toggleStreetMode}
                  setStreetModeAndSelect={this.setStreetModeAndSelect}
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
              {hash === 'parkAndRide' && (
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
          <span aria-hidden={this.state.settingsOpen} ref={this.contentRef}>
            {content}
          </span>
        }
        map={map}
        settingsDrawer={
          <SettingsDrawer
            open={this.state.settingsOpen}
            className="offcanvas-mobile"
          >
            <CustomizeSearch onToggleClick={this.toggleSearchSettings} mobile />
          </SettingsDrawer>
        }
        expandMap={this.expandMap}
      />
    );
  }
}

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
