import { intersection, without } from 'lodash';
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
 * Only the name of each transport mode will be returned.
 *
 * @param {*} config The configuration for the software installation
 */
export const getAvailableTransportModes = config =>
  Object.keys(config.transportModes)
    .filter(tm => config.transportModes[tm].availableForSelection)
    .map(tm => tm.toUpperCase());

/**
 * Builds a query for the router component to use to update its location url.
 *
 * @param {*} allModes All available transport and street modes
 * @param {*} availableStreetModes All available street modes
 * @param {*} streetMode The street mode to select
 */
export const buildStreetModeQuery = (
  allModes,
  availableStreetModes,
  streetMode,
) => ({
  modes: without(allModes, ...availableStreetModes)
    .concat(streetMode.toUpperCase())
    .join(','),
});

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
 * @param {*} location The current location
 * @param {*} config The configuration for the software installation
 * @param {*} router The router
 */
export const setStreetMode = (streetMode, location, config, router) => {
  const modesQuery = buildStreetModeQuery(
    getModes(location, config),
    getAvailableStreetModes(config),
    streetMode,
  );
  replaceQueryParams(router, location, modesQuery);
};
