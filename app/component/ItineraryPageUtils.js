import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import polyline from 'polyline-encoded';
import moment from 'moment';
import SunCalc from 'suncalc';
import { boundWithMinimumArea } from '../util/geo-utils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { itineraryHasCancelation } from '../util/alertUtils';
import { getStartTimeWithColon } from '../util/timeUtils';
import { getCurrentSettings, getDefaultSettings } from '../util/planParamUtil';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import { getMapLayerOptions } from '../util/mapLayerUtils';

export const streetModeHash = ['walk', 'bike', 'car'];

/**
 * Returns the index of selected itinerary. Attempts to look for
 * the information in the location's state and pathname, respectively.
 * Otherwise, pre-selects the first non-cancelled itinerary or, failing that,
 * defaults to the index 0.
 *
 * @param {{ pathname: string, state: * }} location the current location object.
 * @param {*} itineraries the itineraries retrieved from OTP.
 * @param {number} defaultValue the default value, defaults to 0.
 */
export function getSelectedItineraryIndex(
  { pathname, state } = {},
  itineraries = [],
  defaultValue = 0,
) {
  if (state?.selectedItineraryIndex !== undefined) {
    if (state.selectedItineraryIndex < itineraries.length) {
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
    if (lastURLSegment >= itineraries.length) {
      return defaultValue;
    }
    return lastURLSegment;
  }

  /**
   * Pre-select the first not-cancelled itinerary, if available.
   */
  const itineraryIndex = findIndex(
    itineraries,
    itinerary => !itineraryHasCancelation(itinerary),
  );

  return itineraryIndex !== -1 ? itineraryIndex : defaultValue;
}

// this func is a bit fuzzy because it compares strings and numbers
export function showDetailView(hash, secondHash, itineraries) {
  if (!itineraries.length) {
    return false;
  }
  if (hash === 'bikeAndVehicle' || hash === 'parkAndRide') {
    // note that '0' < 1 in javascript, because strings are converted to numbers
    return secondHash < itineraries.length;
  }
  // note: (undefined < 1) === false
  return streetModeHash.includes(hash) || hash < itineraries.length;
}

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
    import('../util/feedbackly');
  }
}

export function getTopics(config, itineraries, match) {
  const itineraryTopics = [];

  if (itineraries.length) {
    const { realTime, feedIds } = config;
    const selected =
      itineraries[getSelectedItineraryIndex(match.location, itineraries)];

    selected.legs.forEach(leg => {
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

export function getBounds(itineraries, from, to, viaPoints) {
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
}

/**
 * Compare two itinerary lists. If identical, return true
 *
 * @param {*} itineraries1
 * @param {*} itineraries2
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
    if (itins[i].legs.length !== itins2[i].legs.length) {
      return false;
    }
    for (let j = 0; j < itins[i].legs.length; j++) {
      if (
        !isEqual(
          pick(itins[i].legs[j], legProperties),
          pick(itins2[i].legs[j], legProperties),
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

export function filterItinerariesByFeedId(plan, config) {
  if (!plan?.itineraries) {
    return plan;
  }
  const newItineraries = [];
  plan.itineraries.forEach(itinerary => {
    let skip = false;
    for (let i = 0; i < itinerary.legs.length; i++) {
      const feedId = itinerary.legs[i].route?.gtfsId?.split(':')[0];

      if (
        feedId && // if feedId is undefined, leg  is non transit -> don't drop
        !config.feedIds.includes(feedId) // feedId is not allowed
      ) {
        skip = true;
        break;
      }
    }
    if (!skip) {
      newItineraries.push(itinerary);
    }
  });
  return { ...plan, itineraries: newItineraries };
}

const settingsToCompare = ['walkBoardCost', 'ticketTypes', 'walkReluctance'];
export function settingsLimitRouting(config) {
  const defaultSettings = getDefaultSettings(config);
  const currentSettings = getCurrentSettings(config);
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
        time: moment().unix(),
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

export function checkDayNight(iconId, timem, lat, lon) {
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
}

const streetLegModes = ['WALK', 'BICYCLE', 'CAR', 'SCOOTER'];

/**
 * Filters away itineraries that don't use transit
 */
export function transitItineraries(itineraries) {
  if (!itineraries) {
    return [];
  }
  return itineraries.filter(
    itin => !itin.legs.every(leg => streetLegModes.includes(leg.mode)),
  );
}

/**
 * Filters itineraries that don't use given mode
 */
export function filterItineraries(itineraries, modes) {
  if (!itineraries) {
    return [];
  }
  return itineraries.filter(itinerary =>
    itinerary.legs.some(leg => modes.includes(leg.mode)),
  );
}
