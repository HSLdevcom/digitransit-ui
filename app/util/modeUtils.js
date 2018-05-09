import { without } from 'lodash';
import { getDefaultModes } from './planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';

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

export const getAvailableStreetModes = config => {
  return Object.keys(config.streetModes)
    .filter(sm => config.streetModes[sm].availableForSelection)
    .map(sm => sm.toUpperCase());
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
    modes: without(allModes, ...availableStreetModes.map(m => m.toUpperCase()))
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
