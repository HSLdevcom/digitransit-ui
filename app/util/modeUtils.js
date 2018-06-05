import { intersection, isEmpty, isString, without } from 'lodash';
import { getDefaultModes } from './planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';

/**
 * Retrieves all modes (as in both transport and street modes)
 * from either 1. the URI, 2. localStorage or 3. the default configuration.
 *
 * @param {*} location The current location
 * @param {*} config The configuration for the software installation
 */
export const getModes = (location, config) => {
  if (location && location.query && location.query.modes) {
    return decodeURI(location.query.modes)
      .split('?')[0]
      .split(',')
      .map(m => m.toUpperCase());
  } else if (getCustomizedSettings().modes) {
    return getCustomizedSettings().modes;
  }
  return getDefaultModes(config);
};

/**
 * Retrieves an array of street mode configurations that have specified
 * "availableForSelection": true. The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableStreetModeConfigs = config =>
  Object.keys(config.streetModes)
    .filter(sm => config.streetModes[sm].availableForSelection)
    .map(sm => ({ ...config.streetModes[sm], name: sm.toUpperCase() }));

/**
 * Retrieves all street modes that have specified "availableForSelection": true.
 * Only the name of each street mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableStreetModes = config =>
  getAvailableStreetModeConfigs(config).map(sm => sm.name);

/**
 * Retrieves the current street mode from either 1. the URI, 2. localStorage
 * or 3. the default configuration. This will return undefined if no
 * applicable street mode can be found.
 *
 * @param {*} location The current location
 * @param {*} config The configuration for the software installation
 */
export const getStreetMode = (location, config) => {
  const currentStreetModes = intersection(
    getModes(location, config),
    getAvailableStreetModes(config),
  );
  if (currentStreetModes.length > 0) {
    return currentStreetModes[0];
  }

  const defaultStreetModes = getAvailableStreetModeConfigs(config).filter(
    sm => sm.defaultValue,
  );
  return defaultStreetModes.length > 0 ? defaultStreetModes[0].name : undefined;
};

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * The full configuration will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableTransportModeConfigs = config =>
  Object.keys(config.transportModes)
    .filter(tm => config.transportModes[tm].availableForSelection)
    .map(tm => ({ ...config.transportModes[tm], name: tm.toUpperCase() }));

/**
 * Retrieves all transport modes that have specified "availableForSelection": true.
 * Only the name of each transport mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableTransportModes = config =>
  getAvailableTransportModeConfigs(config).map(tm => tm.name);

/**
 * Builds a query for the router component to use to update its location url.
 *
 * @param {*} config The configuration for the software installation
 * @param {*} currentModes All currently selected transport and street modes
 * @param {*} streetMode The street mode to select
 * @param {boolean} isExclusive True, if only this mode shoud be selected; otherwise false.
 */
export const buildStreetModeQuery = (
  config,
  currentModes,
  streetMode,
  isExclusive = false,
) => {
  let transportModes = without(
    currentModes,
    ...getAvailableStreetModes(config),
  );
  if (isEmpty(transportModes)) {
    transportModes = getAvailableTransportModeConfigs(config)
      .filter(tm => tm.defaultValue)
      .map(tm => tm.name);
  }
  return {
    modes: isExclusive
      ? streetMode.toUpperCase()
      : transportModes.concat(streetMode.toUpperCase()).join(','),
  };
};

/**
 * Updates the browser's url with the given parameters.
 *
 * @param {*} router The router
 * @param {*} location The current location
 * @param {*} newParams The location query params to apply
 */
export const replaceQueryParams = (router, location, newParams) => {
  router.replace({
    ...location,
    query: {
      ...location.query,
      ...newParams,
    },
  });
};

/**
 * Updates the browser's url to reflect the selected street mode.
 *
 * @param {*} streetMode The street mode to select
 * @param {*} config The configuration for the software installation
 * @param {*} router The router
 * @param {boolean} isExclusive True, if only this mode shoud be selected; otherwise false.
 */
export const setStreetMode = (
  streetMode,
  config,
  router,
  isExclusive = false,
) => {
  const { location } = router;
  const modesQuery = buildStreetModeQuery(
    config,
    getModes(location, config),
    streetMode,
    isExclusive,
  );
  replaceQueryParams(router, location, modesQuery);
};

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
 * Maps the given modes (either a string array or a comma-separated string of values)
 * to their OTP counterparts. Any modes with no counterpart available will be dropped
 * from the output.
 *
 * @param {*} config The configuration for the software installation
 * @param {String[]|String} modes The modes to filter
 * @returns The filtered modes, or an empty string
 */
export const filterModes = (config, modes) => {
  if (!modes) {
    return '';
  }
  if (modes instanceof Array) {
    modes = modes.join(',');
  }
  if (!isString(modes)) {
    return '';
  }
  return modes
    .split(',')
    .map(mode => getOTPMode(config, mode))
    .filter(mode => !!mode)
    .sort()
    .join(',');
};
