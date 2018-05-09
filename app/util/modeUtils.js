import { intersection, without } from 'lodash';
import { getDefaultModes } from './planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';

/**
 * Retrieves all modes (as in both transport and street modes)
 * from either 1. the URI, 2. localStorage or 3. default configuration.
 *
 * @param {*} location The current location (from react-router)
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

export const getAvailableStreetModeConfigs = config => {
  return Object.keys(config.streetModes)
    .filter(sm => config.streetModes[sm].availableForSelection)
    .map(sm => ({ ...config.streetModes[sm], name: sm.toUpperCase() }));
};

export const getAvailableStreetModes = config => {
  return getAvailableStreetModeConfigs(config).map(sm => sm.name);
};

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

export const getAvailableTransportModes = config => {
  return Object.keys(config.transportModes)
    .filter(tm => config.transportModes[tm].availableForSelection)
    .map(tm => tm.toUpperCase());
};

export const toggleStreetMode = (
  allModes,
  availableStreetModes,
  streetMode,
) => {
  return {
    modes: without(allModes, ...availableStreetModes)
      .concat(streetMode.toUpperCase())
      .join(','),
  };
};

export const replaceParams = (router, location, newParams) => {
  router.replace({
    ...location,
    query: {
      ...location.query,
      ...newParams,
    },
  });
};
