import isString from 'lodash/isString';
import sortedUniq from 'lodash/sortedUniq';
import xor from 'lodash/xor';
import inside from 'point-in-polygon';
import { getCustomizedSettings } from '../store/localStorage';
import { isInBoundingBox } from './geo-utils';
import { addAnalyticsEvent } from './analyticsUtils';
import { ExtendedRouteTypes, TransportMode } from '../constants';
import { isDevelopmentEnvironment } from './envUtils';

export function isCitybikeSeasonActive(season) {
  if (!season) {
    return false;
  }
  const currentDate = new Date();

  if (
    currentDate.getTime() <= season.end.getTime() &&
    currentDate.getTime() >= season.start.getTime()
  ) {
    return true;
  }
  return false;
}

export function isCitybikePreSeasonActive(season) {
  if (!season || !season.preSeasonStart) {
    return false;
  }
  const currentDate = new Date();

  if (
    currentDate.getTime() <= season.start.getTime() &&
    currentDate.getTime() >= season.preSeasonStart.getTime()
  ) {
    return true;
  }
  return false;
}

export function showCitybikeNetwork(network, config) {
  return (
    network?.enabled &&
    (isCitybikeSeasonActive(network?.season) ||
      isCitybikePreSeasonActive(network?.season) ||
      isDevelopmentEnvironment(config))
  );
}

export function citybikeRoutingIsActive(network, config) {
  return (
    network?.enabled &&
    (isCitybikeSeasonActive(network?.season) ||
      isDevelopmentEnvironment(config))
  );
}

export function networkIsActive(config, networkName) {
  const networks = config?.cityBike?.networks;
  return citybikeRoutingIsActive(networks[networkName], config);
}

export function useCitybikes(networks, config) {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === TransportMode.Citybike.toLowerCase() &&
      citybikeRoutingIsActive(network, config),
  );
}

export function useScooters(networks) {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === TransportMode.Scooter.toLowerCase() && network.enabled,
  );
}

export function showRentalVehiclesOfType(networks, config, type) {
  if (!networks) {
    return false;
  }
  return Object.values(networks).some(
    network =>
      network.type === type.toLowerCase() &&
      (network.type !== 'citybike' || showCitybikeNetwork(network, config)),
  );
}

export function getNearYouModes(config) {
  if (!config.cityBike?.networks) {
    return config.nearYouModes;
  }
  if (!useCitybikes(config.cityBike.networks, config)) {
    return config.nearYouModes.filter(mode => mode !== 'citybike');
  }
  return config.nearYouModes;
}

export function getTransportModes(config) {
  let citybikeConfig = {};
  let scooterConfig = {};
  if (config.cityBike?.networks) {
    if (!useCitybikes(config.cityBike.networks, config)) {
      citybikeConfig = { citybike: { availableForSelection: false } };
    }
    if (!useScooters(config.cityBike.networks)) {
      scooterConfig = { scooter: { availableForSelection: false } };
    }
  }
  return {
    ...config.transportModes,
    ...citybikeConfig,
    ...scooterConfig,
  };
}

export function getRouteMode(route) {
  switch (route.type) {
    case ExtendedRouteTypes.BusExpress:
      return 'bus-express';
    case ExtendedRouteTypes.BusLocal:
      return 'bus-local';
    case ExtendedRouteTypes.SpeedTram:
      return 'speedtram';
    default:
      return route.mode?.toLowerCase();
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

export function getDefaultTransportModes(config) {
  return getAvailableTransportModeConfigs(config)
    .filter(tm => tm.defaultValue)
    .map(tm => tm.name);
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
 * Retrieves the related OTP mode from the given configuration, if available.
 * This will return undefined if the given mode cannot be mapped.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to map
 * @returns The mapped mode, or undefined
 */
export function getOTPMode(config, mode) {
  if (!isString(mode)) {
    return undefined;
  }
  const otpMode = config.modeToOTP[mode.toLowerCase()];
  return otpMode ? otpMode.toUpperCase() : undefined;
}

/**
 * Checks if the given mode has been configured as availableForSelection or is WALK.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 */
export function isModeAvailable(config, mode) {
  return ['WALK', ...getAvailableTransportModes(config)].includes(
    mode.toUpperCase(),
  );
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
      .filter(mode => isModeAvailable(config, mode))
      .filter(mode =>
        isModeAvailableInsidePolygons(config, mode, [
          from,
          to,
          ...intermediatePlaces,
        ]),
      )
      .map(mode => getOTPMode(config, mode))
      .filter(mode => !!mode)
      .sort(),
  );
}

/**
 * Retrieves all transport modes that are both available and marked as default,
 * and additionally WALK mode.
 *
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of modes
 */
export function getDefaultModes(config) {
  return [...getDefaultTransportModes(config), 'WALK'];
}

/**
 * Giving user an option to change mode settings when there are no
 * alternative options does not makse sense. This function checks
 * if there are at least two available transport modes
 *
 * @param {*} config
 * @returns {Boolean} True if mode settings should be shown to users
 */
export function showModeSettings(config) {
  return getAvailableTransportModes(config).length > 1;
}

/**
 * Retrieves all transport modes and returns the currently available
 * modes together with WALK mode. If user has no ability to change
 * mode settings, always use default modes.
 *
 * @param {*} config The configuration for the software
 * @returns {String[]} returns user set modes or default modes
 */
export function getModes(config) {
  const { modes, allowedBikeRentalNetworks } = getCustomizedSettings();
  const activeAndAllowedBikeRentalNetworks = allowedBikeRentalNetworks
    ? allowedBikeRentalNetworks.filter(x => networkIsActive(config, x))
    : [];
  if (showModeSettings(config) && Array.isArray(modes) && modes.length > 0) {
    const transportModes = modes.filter(mode =>
      isTransportModeAvailable(config, mode),
    );
    const modesWithWalk = [...transportModes, 'WALK'];
    if (
      activeAndAllowedBikeRentalNetworks &&
      activeAndAllowedBikeRentalNetworks.length > 0 &&
      modesWithWalk.indexOf(TransportMode.Citybike) === -1 &&
      modesWithWalk.indexOf(TransportMode.Scooter) === -1
    ) {
      // Assume citybike if no rental network mode found
      modesWithWalk.push(TransportMode.Citybike);
    }
    return modesWithWalk;
  }
  if (
    Array.isArray(activeAndAllowedBikeRentalNetworks) &&
    activeAndAllowedBikeRentalNetworks.length > 0
  ) {
    const modesWithCitybike = getDefaultModes(config);
    modesWithCitybike.push(TransportMode.Citybike);
    return modesWithCitybike;
  }
  return getDefaultModes(config);
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

/**
 * Transforms array of mode strings into modern format OTP mode objects
 *
 * @param {String[]} modes modes to filter from
 * @returns {Object[]} array of objects of format
 * {mode: <uppercase mode name>}, qualifier: <optional qualifier>}
 */
export function modesAsOTPModes(modes) {
  return modes
    .map(mode => mode.split('_'))
    .map(modeAndQualifier =>
      modeAndQualifier.length > 1
        ? { mode: modeAndQualifier[0], qualifier: modeAndQualifier[1] }
        : { mode: modeAndQualifier[0] },
    );
}
