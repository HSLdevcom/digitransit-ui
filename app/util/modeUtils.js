import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import sortedUniq from 'lodash/sortedUniq';
import xor from 'lodash/xor';
import isEqual from 'lodash/isEqual';
import inside from 'point-in-polygon';
import { getCustomizedSettings } from '../store/localStorage';
import { isInBoundingBox } from './geo-utils';
import { addAnalyticsEvent } from './analyticsUtils';

/**
 * Retrieves an array of street mode configurations that have specified
 * "availableForSelection": true. The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableStreetModeConfigs = config =>
  config.streetModes
    ? Object.keys(config.streetModes)
        .filter(sm => config.streetModes[sm].availableForSelection)
        .map(sm => ({ ...config.streetModes[sm], name: sm.toUpperCase() }))
    : [];

export const getDefaultStreetModes = config =>
  getAvailableStreetModeConfigs(config)
    .filter(sm => sm.defaultValue)
    .map(sm => sm.name);

/**
 * Retrieves all street modes that have specified "availableForSelection": true.
 * Only the name of each street mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableStreetModes = config =>
  getAvailableStreetModeConfigs(config).map(sm => sm.name);

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableTransportModeConfigs = config =>
  config.transportModes
    ? Object.keys(config.transportModes)
        .filter(tm => config.transportModes[tm].availableForSelection)
        .map(tm => ({ ...config.transportModes[tm], name: tm.toUpperCase() }))
    : [];

export const getDefaultTransportModes = config =>
  getAvailableTransportModeConfigs(config)
    .filter(tm => tm.defaultValue)
    .map(tm => tm.name);

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * Only the name of each transport mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableTransportModes = config =>
  getAvailableTransportModeConfigs(config).map(tm => tm.name);

/**
 * Retrieves the related OTP mode from the given configuration, if available.
 * This will return undefined if the given mode cannot be mapped.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to map
 * @returns The mapped mode, or undefined
 */
export const getOTPMode = (config, mode) => {
  if (!isString(mode)) {
    return undefined;
  }
  const otpMode = config.modeToOTP[mode.toLowerCase()];
  return otpMode ? otpMode.toUpperCase() : undefined;
};

/**
 * Checks if the given mode has been configured as availableForSelection.
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 */
const isModeAvailable = (config, mode) =>
  [
    ...getAvailableStreetModes(config),
    ...getAvailableTransportModes(config),
  ].includes(mode.toUpperCase());

/**
 * Checks if mode does not exist in config's modePolygons or
 * at least one of the given coordinates is inside any of the polygons defined for a mode
 *
 * @param {*} config The configuration for the software installation
 * @param {String} mode The mode to check
 * @param {*} places
 */
export const isModeAvailableInsidePolygons = (config, mode, places) => {
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
};

/**
 * Maps the given modes (either a string array or a comma-separated string of values)
 * to their OTP counterparts. Any modes with no counterpart available will be dropped
 * from the output.
 *
 * @param {*} config The configuration for the software installation
 * @param {String[]|String} modes The modes to filter
 * @returns The filtered modes, or an empty string
 */
export const filterModes = (config, modes, from, to, intermediatePlaces) => {
  if (!modes) {
    return '';
  }
  const modesStr = modes instanceof Array ? modes.join(',') : modes;
  if (!isString(modesStr)) {
    return '';
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
  ).join(',');
};

/**
 * Retrieves all modes (as in both transport and street modes) that are
 * both available and marked as default.
 *
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of modes
 */
export const getDefaultModes = config => [
  ...getDefaultTransportModes(config),
  ...getDefaultStreetModes(config),
];

/**
 * Retrieves all default transport modes that are
 * both available and marked as default and adds WALK mode.
 *
 * @param {*} config The configuration for the software installation
 * @returns {String[]} an array of modes
 */
export const getDefaultModesWithWalk = config => [
  ...getDefaultTransportModes(config),
  'WALK',
];

/**
 * Retrieves all modes (as in both transport and street modes)
 * from either the localStorage or the default configuration.
 * If modes include CAR, BICYCLE or WALK modes use default instead
 * (legacy settings allowed them).
 *
 * @param {*} config The configuration for the software installation
 */
export const getModes = config => {
  const { modes } = getCustomizedSettings();
  if (
    Array.isArray(modes) &&
    !isEmpty(modes) &&
    modes.indexOf('CAR_PARK') === -1 &&
    modes.indexOf('CAR') === -1 &&
    modes.indexOf('BICYCLE') === -1 &&
    modes.indexOf('WALK') === -1
  ) {
    return modes;
  }
  return getDefaultModes(config);
};

/**
 * Checks if user has changed the transport or street modes
 *
 * @param {*} config The configuration for the software installation
 * @returns {Boolean} True if current modes differ from the default ones
 */
export const userHasChangedModes = config => {
  return !isEqual(getDefaultModes(config), getModes(config));
};

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
