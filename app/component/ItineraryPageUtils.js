import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import polyline from 'polyline-encoded';
import moment from 'moment';
import { boundWithMinimumArea } from '../util/geo-utils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { itineraryHasCancelation } from '../util/alertUtils';
import { getStartTimeWithColon } from '../util/timeUtils';
import { getCurrentSettings, getDefaultSettings } from '../util/planParamUtil';

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
export function getActiveIndex(
  { pathname, state } = {},
  itineraries = [],
  defaultValue = 0,
) {
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
  const lastURLSegment = pathname?.split('/').pop();
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
}

const streetModeHash = ['walk', 'bike', 'car'];

export function getHashIndex(params) {
  const hash = params.secondHash || params.hash;
  if (hash) {
    if (streetModeHash.includes(hash)) {
      return 0;
    }
    return Number(hash);
  }
  return undefined;
}

// this func is a bit fuzzy because it mopares strings and numbers
export function showDetailView(hash, secondHash, itineraries) {
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

export function getTopicOptions(config, planitineraries, match) {
  const { realTime, feedIds } = config;
  const itineraries = planitineraries?.every(
    itinerary => itinerary !== undefined,
  )
    ? planitineraries
    : [];
  const activeIndex =
    getHashIndex(match.params) || getActiveIndex(match.location, itineraries);
  const itineraryTopics = [];

  if (itineraries.length) {
    const activeItinerary =
      activeIndex < itineraries.length
        ? itineraries[activeIndex]
        : itineraries[0];
    activeItinerary.legs.forEach(leg => {
      if (leg.transitLeg && leg.trip) {
        const feedId = leg.trip.gtfsId.split(':')[0];
        let topic;
        if (realTime && feedIds.includes(feedId)) {
          if (realTime[feedId]?.useFuzzyTripMatching) {
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
 * Compares the current plans itineraries with the itineraries with default settings, if plan with default settings provides different
 * itineraries, return true
 *
 * @param {*} itineraries
 * @param {*} defaultItineraries
 * @returns boolean indicating weather or not the default settings provide a better plan
 */
const legValuesToCompare = ['to', 'from', 'route', 'mode'];
export function compareItineraries(itineraries, defaultItineraries) {
  if (!itineraries || !defaultItineraries) {
    return false;
  }
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
}

const settingsToCompare = ['walkBoardCost', 'ticketTypes', 'walkReluctance'];
export function relevantRoutingSettingsChanged(config) {
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
