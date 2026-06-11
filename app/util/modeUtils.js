import isString from 'lodash/isString';
import sortedUniq from 'lodash/sortedUniq';
import xor from 'lodash/xor';
import inside from 'point-in-polygon';
import { getCustomizedSettings } from '../store/localStorage';
import { isInBoundingBox } from './geo-utils';
import { addAnalyticsEvent } from './analyticsUtils';
import { ExtendedRouteTypes, TransportMode } from '../constants';
import { IS_DEV } from './envUtils';
import { isExternalFeed } from './feedScopedIdUtils';
import { dateOrEmpty, durationToString } from './timeUtils';
import { splitGtfsId } from './gtfs';

function seasonMs(ddmmyyyy) {
  const parts = ddmmyyyy.split('.');
  const year = parts.length > 2 ? parts[2] : new Date().getFullYear();
  return new Date(year, parts[1] - 1, parts[0]).valueOf();
}

const dayMs = 24 * 60 * 60 * 1000;

export function isCitybikeSeasonActive(season) {
  if (!season) {
    return false;
  }
  if (season.alwaysOn) {
    return true;
  }
  const now = Date.now();
  return now <= seasonMs(season.end) + dayMs && now >= seasonMs(season.start);
}

export function isCitybikePreSeasonActive(season) {
  if (!season.start || !season.preSeasonStart) {
    return false;
  }
  const now = Date.now();
  return (
    now <= seasonMs(season.start) + dayMs &&
    now >= seasonMs(season.preSeasonStart)
  );
}

export function showCitybikeNetwork(networkConfig) {
  return (
    networkConfig?.enabled &&
    networkConfig.type === 'citybike' &&
    (isCitybikeSeasonActive(networkConfig?.season) ||
      isCitybikePreSeasonActive(networkConfig?.season) ||
      IS_DEV)
  );
}

export function networkIsActive(network) {
  return network?.enabled && isCitybikeSeasonActive(network?.season);
}

export function useCitybikes(networks, config) {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === TransportMode.Citybike.toLowerCase() &&
      networkIsActive(network, config),
  );
}

export function useScooters(config) {
  if (!config.transportModes?.scooter?.availableForSelection) {
    return false;
  }
  const networks = config.vehicleRental?.networks;
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === TransportMode.Scooter.toLowerCase() && network.enabled,
  );
}

export function showRentalVehiclesOfType(networks, type) {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === type.toLowerCase() &&
      network.enabled &&
      (network.showRentalVehicles || showCitybikeNetwork(network)),
  );
}

const nearYouStopTypes = ['stop', 'station'];

export function getNearYouModes(config, favourites) {
  let modes = config.nearYouModes;
  let cityBikesActive = config.nearYouModes.includes('citybike');
  if (cityBikesActive && !useCitybikes(config.vehicleRental.networks, config)) {
    modes = modes.filter(mode => mode !== 'citybike');
    cityBikesActive = false;
  }
  const nearFavs = favourites.filter(f => {
    return (
      nearYouStopTypes.includes(f.type) ||
      (f.type === 'bikeStation' && cityBikesActive)
    );
  });
  if (!nearFavs.length) {
    modes = modes.filter(mode => mode !== 'favorite');
  }
  return modes;
}

export function getTransportModes(config) {
  let citybikeConfig = {};
  let scooterConfig = {};
  if (config.vehicleRental?.networks) {
    if (!useCitybikes(config.vehicleRental.networks, config)) {
      citybikeConfig = { citybike: { availableForSelection: false } };
    }
    if (!useScooters(config)) {
      scooterConfig = { scooter: { availableForSelection: false } };
    }
  }
  return {
    ...config.transportModes,
    ...citybikeConfig,
    ...scooterConfig,
  };
}

/**
 * @returns mode always in lower case
 */
export function getRouteMode(route, config) {
  if (config?.replacementBusRoutes?.includes(route.gtfsId)) {
    return 'replacement-bus';
  }
  switch (route.type) {
    case ExtendedRouteTypes.BusExpress:
      return config?.useExtendedRouteTypes ? 'bus-express' : 'bus';
    case ExtendedRouteTypes.BusLocal:
      return config?.useExtendedRouteTypes ? 'bus-local' : 'bus';
    case ExtendedRouteTypes.SpeedTram:
      return config?.useExtendedRouteTypes ? 'speedtram' : 'tram';
    case ExtendedRouteTypes.CallAgency:
      return 'call';
    case ExtendedRouteTypes.ReplacementBus:
      return 'replacement-bus';
    default:
      return isExternalFeed(splitGtfsId(route?.gtfsId).feedId, config)
        ? `${route.mode?.toLowerCase()}-external`
        : route.mode?.toLowerCase();
  }
}

/**
 * In NeTEx, mode and submode are properties of the trip. In GTFS, they are
 * properties of the route. Eventually we hope we can get OTP to always report
 * them in the more specific entity, trip, but because historically we have
 * taken them from route, this is a fail safe way of making the change.
 * @param trip
 * @param route
 * @param config
 * @returns {string|*}
 */
export function getTripOrRouteMode(trip, route, config) {
  if (trip?.isReplacement) {
    return 'replacement-bus';
  }
  return getRouteMode(route, config);
}

/**
 * extract stop's transit mode. Handles routes from map API and from OTP graphql query
 */
export function getStopMode(vehicleMode, routes, code, config, isTerminal) {
  if (routes) {
    switch (vehicleMode) {
      case 'BUS':
        if (config.useExtendedRouteTypes && !isTerminal) {
          const arr = typeof routes === 'string' ? JSON.parse(routes) : routes;
          if (
            arr.some(
              r => (r.gtfsType || r.type) === ExtendedRouteTypes.BusExpress,
            )
          ) {
            return 'bus-express';
          }
        }
        break;
      case 'TRAM':
        if (config.useExtendedRouteTypes) {
          const arr = typeof routes === 'string' ? JSON.parse(routes) : routes;
          if (
            arr.some(
              r => (r.gtfsType || r.type) === ExtendedRouteTypes.SpeedTram,
            )
          ) {
            return 'speedtram';
          }
        }
        break;
      case 'FERRY':
        {
          if (config.externalFerryByStopCode && !isTerminal && !code) {
            return 'ferry-external';
          }
          const arr = typeof routes === 'string' ? JSON.parse(routes) : routes;
          if (
            arr.some(r => isExternalFeed(splitGtfsId(r.gtfsId).feedId, config))
          ) {
            return 'ferry-external';
          }
        }
        break;
      default:
        break;
    }
  }
  return vehicleMode.toLowerCase();
}

/**
 * @returns icon name
 */
export function transitIconName(mode, lollipop) {
  switch (mode) {
    case 'bus-express':
      return lollipop ? 'icon_bus-lollipop' : 'icon_bus';
    case 'bus-local':
      return lollipop ? 'icon_bus-lollipop' : 'icon_bus-local';
    case 'replacement-bus':
      return lollipop ? 'icon_bus-lollipop' : 'icon_replacement-bus';
    case 'subway':
      return `icon_${mode}`; // no lollipop version
    default:
      return lollipop ? `icon_${mode}-lollipop` : `icon_${mode}`;
  }
}

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export function getAvailableTransportModeConfigs(config) {
  const transportModes = getTransportModes(config);
  return transportModes
    ? Object.keys(transportModes)
        .filter(tm => transportModes[tm].availableForSelection)
        .map(tm => ({ ...transportModes[tm], name: tm.toUpperCase() }))
    : [];
}

export function getTransitModes(config) {
  return getAvailableTransportModeConfigs(config)
    .filter(
      tm => tm.defaultValue && tm.name !== 'scooter' && tm.name !== 'citybike',
    )
    .map(tm => tm.name)
    .sort();
}

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * Only the name of each transport mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export function getAvailableTransportModes(config) {
  return getAvailableTransportModeConfigs(config).map(tm => tm.name);
}

/**
 * Checks if the given transport mode has been configured as availableForSelection.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 */
export function isTransportModeAvailable(config, mode) {
  return getAvailableTransportModes(config).includes(mode.toUpperCase());
}

/**
 * Checks if mode does not exist in config's modePolygons or
 * at least one of the given coordinates is inside any of the polygons defined for a mode
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 * @param {*} places
 */
export function isModeAvailableInsidePolygons(config, mode, places) {
  if (mode in config.modePolygons && places.length > 0) {
    for (let i = 0; i < places.length; i++) {
      const { lat, lon } = places[i];
      for (let j = 0; j < config.modeBoundingBoxes[mode].length; j++) {
        const boundingBox = config.modeBoundingBoxes[mode][j];
        if (
          isInBoundingBox(boundingBox, lat, lon) &&
          inside([lon, lat], config.modePolygons[mode][j])
        ) {
          return true;
        }
      }
    }
    return false;
  }
  return true;
}

/**
 * Maps the given modes (either a string array or a comma-separated string of values)
 * to their OTP counterparts. Any modes with no counterpart available will be dropped
 * from the output.
 *
 * @param {*} config The configuration for the software installation
 * @param {String[]|String} modes The modes to filter
 * @returns The filtered modes, or an empty string
 */
export function filterModes(config, modes, from, to, intermediatePlaces) {
  if (!modes) {
    return [];
  }
  const modesStr = modes instanceof Array ? modes.join(',') : modes;
  if (!isString(modesStr)) {
    return [];
  }
  return sortedUniq(
    modesStr
      .split(',')
      .filter(mode => isTransportModeAvailable(config, mode))
      .filter(mode =>
        isModeAvailableInsidePolygons(config, mode, [
          from,
          to,
          ...intermediatePlaces,
        ]),
      )
      .filter(mode => !!mode)
      .sort(),
  );
}

/**
 * Giving user an option to change mode settings when there are no
 * alternative options does not make sense. This function checks
 * if there are at least two available transport modes
 *
 * @param {*} config
 * @returns {Boolean} True if mode settings should be shown to users
 */
export function showModeSettings(config) {
  return getAvailableTransportModes(config).length > 1;
}

/**
 * Retrieves all transit modes and returns the currently available
 * If user has no ability to change mode settings, always use default modes.
 *
 * @param {*} config The configuration for the software
 * @returns {String[]} returns user set modes or default modes
 */
export function getModes(config) {
  const { modes } = getCustomizedSettings();
  if (showModeSettings(config) && Array.isArray(modes)) {
    const transportModes = modes.filter(mode =>
      isTransportModeAvailable(config, mode),
    );
    return transportModes;
  }
  return getTransitModes(config);
}

/**
 * Updates the localStorage to reflect the selected transport mode.
 *
 * @param {*} transportMode The transport mode to select
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of currently selected modes
 */
export function toggleTransportMode(transportMode, config) {
  let actionName;
  if (getModes(config).includes(transportMode.toUpperCase())) {
    actionName = 'SettingsDisableTransportMode';
  } else {
    actionName = 'SettingsEnableTransportMode';
  }
  addAnalyticsEvent({
    action: actionName,
    category: 'ItinerarySettings',
    name: transportMode,
  });
  const modes = xor(getModes(config), [transportMode.toUpperCase()]);
  return modes;
}

const TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS = {
  [TransportMode.Rail]: { id: 'track', defaultMessage: 'Track' },
  [TransportMode.Ferry]: { id: 'pier-short-no-num', defaultMessage: 'Pier' },
  default: { id: 'platform-short-no-num', defaultMessage: 'Plat.' },
};

export function getTrackOrPierOrPlatformTextShort(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_TEXT_SHORT_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS = {
  [TransportMode.Rail]: { id: 'track', defaultMessage: 'Track' },
  [TransportMode.Ferry]: { id: 'pier', defaultMessage: 'Pier' },
  default: { id: 'platform', defaultMessage: 'Platform' },
};

export function getTrackOrPierOrPlatformText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_TEXT_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS = {
  [TransportMode.Rail]: { id: 'track-num' },
  [TransportMode.Ferry]: { id: 'pier-num' },
  default: { id: 'platform-num' },
};

export function getTrackOrPierOrPlatformWithNumText(intl, mode, platformCode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_WITH_NUM_MSGS.default,
    { platformCode },
  );
}

const TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS = {
  [TransportMode.Rail]: {
    id: 'navigation-track-change',
    defaultMessage: 'Track change',
  },
  [TransportMode.Ferry]: {
    id: 'navigation-pier-change',
    defaultMessage: 'Pier change',
  },
  default: {
    id: 'navigation-platform-change',
    defaultMessage: 'Platform change',
  },
};

export function getTrackOrPierOrPlatformChangeText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_CHANGE_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS = {
  [TransportMode.Rail]: {
    id: 'navigation-track-restored',
    defaultMessage: 'Track restored',
  },
  [TransportMode.Ferry]: {
    id: 'navigation-pier-restored',
    defaultMessage: 'Pier restored',
  },
  default: {
    id: 'navigation-platform-restored',
    defaultMessage: 'Platform restored',
  },
};

export function getTrackOrPierOrPlatformRestoredText(intl, mode) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_RESTORED_MSGS.default,
  );
}

const TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS = {
  [TransportMode.Rail]: { id: 'navigation-track-change-details' },
  [TransportMode.Ferry]: { id: 'navigation-pier-change-details' },
  default: { id: 'navigation-platform-change-details' },
};

export function getTrackOrPierOrPlatformChangeDetailsText(
  intl,
  mode,
  number,
  routeName,
) {
  return intl.formatMessage(
    TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS[mode] ??
      TRACK_OR_PIER_OR_PLATFORM_CHANGE_DETAILS_MSGS.default,
    { number: number || '', name: routeName || '' },
  );
}

const TERMINAL_OR_STATION_MSGS = {
  [TransportMode.Ferry]: { id: 'terminal', defaultMessage: 'Terminal' },
  default: { id: 'station', defaultMessage: 'Station' },
};

export function getTerminalOrStationText(intl, mode) {
  return intl.formatMessage(
    TERMINAL_OR_STATION_MSGS[mode] ?? TERMINAL_OR_STATION_MSGS.default,
  );
}

const FIRST_DEPARTURE_STOP_TYPE_MSGS = {
  FERRY: { id: 'from-ferrypier' },
  RAIL: { id: 'from-station' },
  SUBWAY: { id: 'from-station' },
  TAXI: { id: 'from-place' },
  default: { id: 'from-stop' },
};

export function getFirstDepartureStopTypeText(intl, mode) {
  return intl.formatMessage(
    FIRST_DEPARTURE_STOP_TYPE_MSGS[mode] ??
      FIRST_DEPARTURE_STOP_TYPE_MSGS.default,
  );
}

/**
 * Builds a localized accessible text summary for an itinerary row (for screen readers).
 *
 * @param {Object} intl - react-intl intl object
 * @param {Object} params
 * @param {boolean} params.hasCallAgencyLeg - Whether the itinerary contains a call-agency leg
 * @param {number} params.startTime - Itinerary start time in ms since epoch
 * @param {number} params.endTime - Itinerary end time in ms since epoch
 * @param {number} params.refTime - Reference time in ms since epoch
 * @param {string} params.departureTime - Formatted departure time string
 * @param {string} params.arrivalTime - Formatted arrival time string
 * @param {string[]} params.vehicleNames - Formatted vehicle name strings for each transit leg
 * @param {Object} params.firstDeparture - First departure leg object
 * @param {string} params.firstDepartureLabelId - Message ID for the first departure label
 * @param {string[]} params.stopNames - Stop names for each transit leg
 * @param {number} params.duration - Total itinerary duration in milliseconds
 * @param {string} params.firstDepartureTime - Pre-computed departure time string (legTimeStr result)
 * @param {string} params.platformOrTrack - Pre-computed platform/track text (getBoardingInformationText result)
 * @returns {string}
 */
export function getSummaryDescriptionText(
  intl,
  {
    hasCallAgencyLeg,
    startTime,
    endTime,
    refTime,
    departureTime,
    arrivalTime,
    vehicleNames,
    firstDeparture,
    firstDepartureLabelId,
    stopNames,
    duration,
    firstDepartureTime,
    platformOrTrack,
  },
) {
  if (hasCallAgencyLeg) {
    return intl.formatMessage({
      id: 'itinerary-summary-row.call-agency-description',
    });
  }

  const firstDepartureText =
    vehicleNames.length && firstDeparture
      ? intl.formatMessage(
          { id: firstDepartureLabelId },
          {
            vehicle: vehicleNames[0],
            departureTime: firstDepartureTime,
            firstDepartureTime,
            stopName: stopNames[0],
            firstDepartureStop: stopNames[0],
            platformOrTrack,
          },
        )
      : '';

  const transfers = vehicleNames
    .map((name, index) => {
      if (index === 0) {
        return null;
      }
      return intl.formatMessage(
        {
          id: stopNames[index]
            ? 'itinerary-summary-row.transfers'
            : 'itinerary-summary-row.transfers-to-rental',
        },
        {
          vehicle: name,
          stopName: stopNames[index],
        },
      );
    })
    .filter(Boolean);

  return intl.formatMessage(
    { id: 'itinerary-summary-row.description' },
    {
      departureDate: dateOrEmpty(startTime, refTime),
      departureTime,
      arrivalDate: dateOrEmpty(endTime, refTime),
      arrivalTime,
      firstDeparture: firstDepartureText,
      transfers,
      totalTime: durationToString(intl, duration),
    },
  );
}

export function isPersonalizationEnabled(config, settings) {
  return !!(
    settings.personalization &&
    config.personalization &&
    (config.user.sub || !config.allowLogin)
  );
}
