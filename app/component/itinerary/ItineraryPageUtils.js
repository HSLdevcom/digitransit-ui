import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import get from 'lodash/get';
import polyline from 'polyline-encoded';
import SunCalc from 'suncalc';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { getStartTimeWithColon } from '../../util/timeUtils';
import { getSettings, getDefaultSettings } from '../../util/planParamUtil';
import { PlannerMessageType } from '../../constants';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../../action/realTimeClientAction';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import { getTotalBikingDistance, compressLegs } from '../../util/legUtils';

/**
 * Returns the index of selected itinerary. Attempts to look for
 * the information in the location's state and pathname, respectively.
 * Otherwise, pre-selects the first non-cancelled itinerary or, failing that,
 * defaults to the index 0.
 *
 * @param {{ pathname: string, state: * }} location the current location object.
 * @param {*} edges the itineraries retrieved from OTP.
 * @param {number} defaultValue the default value, defaults to 0.
 */
export function getSelectedItineraryIndex(
  { pathname, state } = {},
  edges = [],
  defaultValue = 0,
) {
  if (state?.selectedItineraryIndex !== undefined) {
    if (state.selectedItineraryIndex < edges.length) {
      return state.selectedItineraryIndex;
    }
    return defaultValue;
  }

  /*
   * If state does not exist, for example when accessing the summary
   * page by an external link, we check if an itinerary selection is
   * supplied in URL and make that the selection.
   */
  const lastURLSegment = Number(pathname?.split('/').pop());
  if (!Number.isNaN(lastURLSegment)) {
    if (lastURLSegment >= edges.length) {
      return defaultValue;
    }
    return lastURLSegment;
  }

  return 0;
}

/**
 * Report any errors that happen when showing summary
 *
 * @param {Error|string|any} error
 */
export function reportError(error) {
  addAnalyticsEvent({
    category: 'Itinerary',
    action: 'ErrorLoading',
    name: 'ItineraryPage',
    message: error.message || error,
    stack: error.stack || null,
  });
}

export function addFeedbackly(context) {
  const host = context.headers['x-forwarded-host'] || context.headers.host;
  if (
    get(context, 'config.showHSLTracking', false) &&
    host?.indexOf('127.0.0.1') === -1 &&
    host?.indexOf('localhost') === -1
  ) {
    // eslint-disable-next-line no-unused-expressions
    import('../../util/feedbackly');
  }
}

export function getTopics(config, edges, match) {
  const itineraryTopics = [];

  if (edges.length) {
    const { realTime, feedIds } = config;
    const selected = edges[getSelectedItineraryIndex(match.location, edges)];

    selected.node.legs.forEach(leg => {
      if (leg.transitLeg && leg.trip) {
        const feedId = leg.trip.gtfsId.split(':')[0];
        let topic;
        if (realTime && feedIds.includes(feedId)) {
          const routeProps = {
            route: leg.route.gtfsId.split(':')[1],
            shortName: leg.route.shortName,
            type: leg.route.type,
          };
          if (realTime[feedId]?.useFuzzyTripMatching) {
            topic = {
              ...routeProps,
              feedId,
              mode: leg.mode.toLowerCase(),
              direction: Number(leg.trip.directionId),
              tripStartTime: getStartTimeWithColon(
                leg.trip.stoptimesForDate[0].scheduledDeparture,
              ),
            };
          } else if (realTime[feedId]) {
            topic = {
              ...routeProps,
              feedId,
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
}

export function getBounds(edges, from, to, viaPoints) {
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
        ...edges.map(e =>
          [].concat(
            ...e.node.legs.map(leg => polyline.decode(leg.legGeometry.points)),
          ),
        ),
      )
      .filter(a => a[0] && a[1]),
  );
}

/**
 * Compare two itinerary lists. If identical, return true
 *
 * @param {*} edges1
 * @param {*} edges2
 */
const legProperties = [
  'mode',
  'from.lat',
  'from.lon',
  'to.lat',
  'to.lon',
  'from.stop.gtfsId',
  'to.stop.gtfsId',
  'trip.gtfsId',
];

export function isEqualItineraries(itins, itins2) {
  if (!itins && !itins2) {
    return true;
  }
  if (!itins || !itins2 || itins.length !== itins2.length) {
    return false;
  }
  for (let i = 0; i < itins.length; i++) {
    if (itins[i].node.legs.length !== itins2[i].node.legs.length) {
      return false;
    }
    for (let j = 0; j < itins[i].node.legs.length; j++) {
      if (
        !isEqual(
          pick(itins[i].node.legs[j], legProperties),
          pick(itins2[i].node.legs[j], legProperties),
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

export function filterItinerariesByFeedId(plan, config) {
  if (!plan?.edges) {
    return plan;
  }
  const newEdges = [];
  plan.edges.forEach(edge => {
    let skip = false;
    for (let i = 0; i < edge.node.legs.length; i++) {
      const feedId = edge.node.legs[i].route?.gtfsId?.split(':')[0];

      if (
        feedId && // if feedId is undefined, leg  is non transit -> don't drop
        !config.feedIds.includes(feedId) // feedId is not allowed
      ) {
        skip = true;
        break;
      }
    }
    if (!skip) {
      newEdges.push(edge);
    }
  });
  return { ...plan, edges: newEdges };
}

const settingsToCompare = ['walkBoardCost', 'ticketTypes', 'walkReluctance'];
export function settingsLimitRouting(config) {
  const defaultSettings = getDefaultSettings(config);
  const currentSettings = getSettings(config);
  const defaultSettingsToCompare = pick(defaultSettings, settingsToCompare);
  const currentSettingsToCompare = pick(currentSettings, settingsToCompare);

  return !(
    isEqual(defaultSettingsToCompare, currentSettingsToCompare) &&
    defaultSettings.modes.every(m => currentSettings.modes.includes(m))
  );
}

export function setCurrentTimeToURL(config, match) {
  if (config.NODE_ENV !== 'test' && !match.location?.query?.time) {
    const newLocation = {
      ...match.location,
      query: {
        ...match.location.query,
        time: Math.floor(Date.now() / 1000),
      },
    };
    match.router.replace(newLocation);
  }
}

function configClient(itineraryTopics, config) {
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
      feedId,
      options: itineraryTopics.length ? itineraryTopics : null,
    };
  }
  return null;
}

export function stopClient(context) {
  const { client } = context.getStore('RealTimeInformationStore');
  if (client) {
    context.executeAction(stopRealTimeClient, client);
  }
}

export function startClient(itineraryTopics, context) {
  if (!isEmpty(itineraryTopics)) {
    const clientConfig = configClient(itineraryTopics, context.config);
    context.executeAction(startRealTimeClient, clientConfig);
  }
}

export function updateClient(itineraryTopics, context) {
  const { client, topics } = context.getStore('RealTimeInformationStore');

  if (isEmpty(itineraryTopics)) {
    stopClient(context);
    return;
  }
  if (client) {
    const clientConfig = configClient(itineraryTopics, context.config);
    if (clientConfig) {
      context.executeAction(changeRealTimeClientTopics, {
        ...clientConfig,
        client,
        oldTopics: topics,
      });
      return;
    }
    stopClient(context);
  }
  startClient(itineraryTopics, context);
}

export function addBikeStationMapForRentalVehicleItineraries() {
  return getMapLayerOptions({
    lockedMapLayers: ['vehicles', 'citybike', 'stop'],
    selectedMapLayers: ['vehicles', 'citybike'],
  });
}

/**
 * Return an object containing key vehicleRentalStations that is a list of rental
 * station ids to hide on map.
 *
 * @param {Boolean} hasVehicleRentalStation if there are rental stations.
 * @param {*} selectedItinerary itinerary which can contain rental stations.
 */
export function getRentalStationsToHideOnMap(
  hasVehicleRentalStation,
  selectedItinerary,
) {
  const objectsToHide = { vehicleRentalStations: [] };
  if (hasVehicleRentalStation) {
    objectsToHide.vehicleRentalStations = selectedItinerary?.legs
      ?.filter(leg => leg.from?.vehicleRentalStation)
      .map(station => station.from?.vehicleRentalStation.stationId);
  }
  return objectsToHide;
}

// These are icons that contains sun
const dayNightIconIds = [1, 2, 21, 22, 23, 41, 42, 43, 61, 62, 71, 72, 73];

export function checkDayNight(iconId, time, lat, lon) {
  const date = new Date(time);
  const sunCalcTimes = SunCalc.getTimes(date, lat, lon);
  const sunrise = sunCalcTimes.sunrise.getTime();
  const sunset = sunCalcTimes.sunset.getTime();
  if ((sunrise > time || sunset < time) && dayNightIconIds.includes(iconId)) {
    // Night icon = iconId + 100
    return iconId + 100;
  }
  return iconId;
}

const STREET_LEG_MODES = ['WALK', 'BICYCLE', 'CAR', 'SCOOTER'];

/**
 * Filters away itineraries that don't use transit
 */
export function transitEdges(edges) {
  if (!edges) {
    return [];
  }
  return edges.filter(
    edge => !edge.node.legs.every(leg => STREET_LEG_MODES.includes(leg.mode)),
  );
}

/**
 * Filters away plain walk
 */
export function filterWalk(edges) {
  if (!edges) {
    return [];
  }
  return edges.filter(
    edge => !edge.node.legs.every(leg => leg.mode === 'WALK'),
  );
}

/**
 * Filters itineraries that don't use given mode
 */
export function filterItineraries(edges, modes) {
  if (!edges) {
    return [];
  }
  return edges.filter(edge =>
    edge.node.legs.some(leg => modes.includes(leg.mode)),
  );
}

/**
 * Pick combination of itineraries for bike and transit
 */
export function mergeBikeTransitPlans(bikeParkPlan, bikeTransitPlan) {
  // filter plain walking / biking away, and also no biking
  const bikeParkEdges = transitEdges(bikeParkPlan?.edges).filter(
    i => getTotalBikingDistance(i.node) > 0,
  );
  const bikePublicEdges = transitEdges(bikeTransitPlan?.edges).filter(
    i => getTotalBikingDistance(i.node) > 0,
  );

  // show 6 bike + transit itineraries, preferably 3 of both kind.
  // If there is not enough of a kind, take more from the other kind
  let n1 = bikeParkEdges.length;
  let n2 = bikePublicEdges.length;
  if (n1 < 3) {
    n2 = Math.min(6 - n1, n2);
  } else if (n2 < 3) {
    n1 = Math.min(6 - n2, n1);
  } else {
    n1 = 3;
    n2 = 3;
  }
  return {
    searchDateTime: bikeParkPlan.searchDateTime,
    edges: [...bikeParkEdges.slice(0, n1), ...bikePublicEdges.slice(0, 3)].map(
      edge => {
        return {
          ...edge,
          node: {
            ...edge.node,
            legs: compressLegs(edge.node.legs),
          },
        };
      },
    ),
    bikeParkItineraryCount: n1,
    bikePublicItineraryCount: n2,
  };
}

const ITERATION_CANCEL_TIME = 20000; // ms, stop looking for more if something was found

export function quitIteration(plan, newPlan, planParams, startTime) {
  if (
    plan.edges.length >= planParams.numItineraries ||
    (plan.edges.length &&
      plan.edges.length * (Date.now() - startTime) > ITERATION_CANCEL_TIME)
  ) {
    return true;
  }
  if (
    plan.routingErrors?.some(
      err => err.code === PlannerMessageType.WalkingBetterThanTransit,
    )
  ) {
    return true;
  }
  if (!plan.edges.length && planParams.noIterationsForShortTrips) {
    // searching short distance, and bike is available
    return true;
  }
  return false;
}
