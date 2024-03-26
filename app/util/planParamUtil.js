import moment from 'moment';
import isEqual from 'lodash/isEqual';
import {
  getDefaultModes,
  modesAsOTPModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getDefaultNetworks } from './vehicleRentalUtils';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';

export const PLANTYPE = {
  WALK: 'WALK',
  BIKE: 'BICYCLE',
  CAR: 'CAR',
  TRANSIT: 'TRANSIT',
  BIKEPARK: 'BIKEPARK',
  BIKETRANSIT: 'BIKETRANSIT',
  PARKANDRIDE: 'PARKANDRIDE',
};

/**
 * Find an option nearest to the value
 *
 * @param value a number
 * @param options array of numbers
 * @returns on option from options that is closest to the provided value
 */
export function findNearestOption(value, options) {
  let currNearest = options[0];
  let diff = Math.abs(value - currNearest);
  for (let i = 0; i < options.length; i++) {
    const newdiff = Math.abs(value - options[i]);
    if (newdiff < diff) {
      diff = newdiff;
      currNearest = options[i];
    }
  }
  return currNearest;
}

/**
 * Retrieves the default settings from the configuration.
 *
 * @param {*} config UI configuration
 */
export function getDefaultSettings(config) {
  if (!config) {
    return {};
  }
  return {
    ...config.defaultSettings,
    modes: getDefaultModes(config).sort(),
    allowedBikeRentalNetworks: config.transportModes.citybike.defaultValue
      ? getDefaultNetworks(config)
      : [],
  };
}

/**
 * Retrieves the current (customized) settings kept in local store
 * Missing setting gets a default value
 * @param {*} config the configuration for the software installation
 */
export function getSettings(config) {
  const defaultSettings = getDefaultSettings(config);
  const userSettings = getCustomizedSettings();
  const allNetworks = getDefaultNetworks(config);
  const settings = {
    ...defaultSettings,
    ...userSettings,
    modes: userSettings?.modes // filter modes to configured allowed values
      ? [
          ...userSettings.modes.filter(mode =>
            isTransportModeAvailable(config, mode),
          ),
          'WALK',
        ].sort()
      : defaultSettings.modes,
    // filter networks to configured allowed values
    allowedBikeRentalNetworks:
      userSettings.allowedBikeRentalNetworks?.length > 0
        ? userSettings.allowedBikeRentalNetworks.filter(network =>
            allNetworks.includes(network),
          )
        : defaultSettings.allowedBikeRentalNetworks,
  };
  const { defaultOptions } = config;
  return {
    ...settings,
    walkSpeed: findNearestOption(settings.walkSpeed, defaultOptions.walkSpeed),
    bikeSpeed: findNearestOption(settings.bikeSpeed, defaultOptions.bikeSpeed),
  };
}

export function planQueryNeeded(
  config,
  {
    params: { from, to },
    location: {
      query: { intermediatePlaces },
    },
  },
  planType,
  relaxSettings,
) {
  if (!from || !to || from === '-' || to === '-') {
    return false;
  }
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediateLocations = getIntermediatePlaces({
    intermediatePlaces,
  });

  // not needed if origin is destination an no via points
  if (isEqual(fromLocation, toLocation) && !intermediateLocations.length) {
    return false;
  }

  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  const modesOrDefault = relaxSettings ? defaultSettings.modes : settings.modes;
  const transitFilter =
    planType === PLANTYPE.BIKETRANSIT
      ? ['CITYBIKE', 'WALK'].concat(config.modesWithNoBike)
      : ['CITYBIKE', 'WALK'];
  const transitModes = modesOrDefault.filter(m => !transitFilter.includes(m));
  const wheelchair = !!settings.accessibilityOption;
  const distance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediateLocations,
  );

  switch (planType) {
    case PLANTYPE.WALK:
      return (
        !wheelchair &&
        distance < config.suggestWalkMaxDistance &&
        !config.hideWalkOption
      );

    case PLANTYPE.BIKE:
      return (
        !wheelchair &&
        distance < config.suggestBikeMaxDistance &&
        settings.includeBikeSuggestions
      );

    case PLANTYPE.CAR:
      return (
        config.showCO2InItinerarySummary ||
        (distance > config.suggestCarMinDistance &&
          settings.includeCarSuggestions)
      );

    case PLANTYPE.BIKEPARK:
      return (
        transitModes.length > 0 &&
        !wheelchair &&
        config.showBikeAndParkItineraries &&
        (config.includePublicWithBikePlan
          ? settings.includeBikeSuggestions
          : settings.showBikeAndParkItineraries)
      );

    case PLANTYPE.BIKETRANSIT:
      return (
        transitModes.length > 0 &&
        !wheelchair &&
        config.showBikeAndPublicItineraries &&
        settings.includeBikeSuggestions
      );

    case PLANTYPE.PARKANDRIDE:
      return (
        transitModes.length > 0 &&
        distance > config.suggestCarMinDistance &&
        settings.includeParkAndRideSuggestions
      );

    case PLANTYPE.TRANSIT:
    default:
      return true;
  }
}

function getLocation(str) {
  const loc = otpToLocation(str);
  if (loc.gtfsId) {
    return {
      location: {
        stopLocation: { stopLocationId: loc.gtfsId },
      },
    };
  }
  return {
    location: {
      coordinate: {
        latitude: loc.lat,
        longitude: loc.lon,
      },
    },
    label: loc.address,
  };
}

export function getPlanParams(
  config,
  {
    params: { from, to },
    location: {
      query: { arriveBy, time },
    },
  },
  planType,
  relaxSettings,
) {
  const fromPlace = getLocation(from);
  const toPlace = getLocation(to);

  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  const modesOrDefault = relaxSettings ? defaultSettings.modes : settings.modes;
  const transitFilter =
    planType === PLANTYPE.BIKETRANSIT
      ? ['CITYBIKE', 'WALK'].concat(config.modesWithNoBike)
      : ['CITYBIKE', 'WALK'];
  const transitModes = modesOrDefault.filter(m => !transitFilter.includes(m));
  const otpModes = modesAsOTPModes(transitModes);
  if (config.customWeights) {
    otpModes.forEach(m => {
      if (config.customWeights[m.mode]) {
        // eslint-disable-next-line
        m.cost = { reluctance: config.customWeights[m.mode] };
      }
    });
  }
  const directOnly = [PLANTYPE.WALK, PLANTYPE.BIKE, PLANTYPE.CAR].includes(
    planType,
  );
  const cityBike = settings.allowedBikeRentalNetworks?.length > 0;
  // set defaults
  let access = cityBike ? ['WALK', 'BICYCLE_RENTAL'] : ['WALK'];
  let egress = access;
  let transfer = ['WALK'];
  let direct = [];

  switch (planType) {
    case PLANTYPE.BIKEPARK:
      access = ['BICYCLE_PARKING'];
      break;
    case PLANTYPE.BIKETRANSIT:
      access = ['BICYCLE'];
      egress = ['BICYCLE'];
      transfer = ['BICYCLE'];
      break;
    case PLANTYPE.PARKANDRIDE:
      access = ['CAR_PARKING'];
      break;
    case PLANTYPE.TRANSIT:
      direct = access;
      break;
    default: // direct modes
      direct = [planType];
      break;
  }

  const modes = {
    directOnly,
    transitOnly: false,
    direct: directOnly ? [planType] : direct,
    transit: {
      access,
      transfer,
      egress,
      transit: otpModes,
    },
  };

  const wheelchair = !!settings.accessibilityOption;
  const walkReluctance = relaxSettings
    ? defaultSettings.walkReluctance
    : settings.walkReluctance;
  const walkBoardCost = relaxSettings
    ? defaultSettings.walkBoardCost
    : settings.walkBoardCost;
  const transferPenalty = relaxSettings
    ? defaultSettings.transferPenalty
    : settings.transferPenalty;

  const timeStr = (time ? moment(time * 1000) : moment()).format();
  const datetime = arriveBy
    ? { latestArrival: timeStr }
    : { earliestDeparture: timeStr };

  return {
    ...settings,
    fromPlace,
    toPlace,
    datetime,
    minTransferTime: `PT${settings.minTransferTime}S`,
    numItineraries: directOnly ? 1 : 5,
    wheelchair,
    walkReluctance,
    walkBoardCost,
    transferPenalty,
    modes,
  };
}
