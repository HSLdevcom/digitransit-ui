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

const directModes = [PLANTYPE.WALK, PLANTYPE.BIKE, PLANTYPE.CAR];
const SHORT_TRIP_METERS = 2000;

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

function getTransitModes(modes, planType, config) {
  let transitModes = modes.filter(m => m !== 'CITYBIKE');
  if (planType === PLANTYPE.BIKETRANSIT) {
    if (config.bikeBoardingModes) {
      transitModes = transitModes.filter(m => config.bikeBoardingModes[m]);
    } else {
      return [];
    }
  }
  return transitModes;
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
  const transitModes = getTransitModes(
    relaxSettings ? defaultSettings.modes : settings.modes,
    planType,
    config,
  );
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
      query: { arriveBy, time, intermediatePlaces },
    },
  },
  planType,
  relaxSettings,
) {
  const fromPlace = getLocation(from);
  const toPlace = getLocation(to);

  // estimate distance for search iteration heuristics
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediateLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  const distance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediateLocations,
  );
  const shortTrip = distance < SHORT_TRIP_METERS;

  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  if (settings.allowedBikeRentalNetworks.length === 0) {
    settings.allowedBikeRentalNetworks = null;
  }
  const transitModes = getTransitModes(
    relaxSettings ? defaultSettings.modes : settings.modes,
    planType,
    config,
  );
  let otpModes = modesAsOTPModes(transitModes);
  if (config.customWeights) {
    otpModes.forEach(m => {
      if (config.customWeights[m.mode]) {
        // eslint-disable-next-line
        m.cost = { reluctance: config.customWeights[m.mode] };
      }
    });
  }
  const directOnly = directModes.includes(planType) || otpModes.length === 0;
  let transitOnly = !!relaxSettings;
  const cityBike = settings.allowedBikeRentalNetworks?.length > 0;
  // set defaults
  let access = cityBike ? ['WALK', 'BICYCLE_RENTAL'] : ['WALK'];
  let egress = access;
  let transfer = ['WALK'];
  let direct = null;

  let noIterationsForShortTrips = false;

  switch (planType) {
    case PLANTYPE.BIKEPARK:
      access = ['BICYCLE_PARKING'];
      transitOnly = true;
      noIterationsForShortTrips = shortTrip;
      break;
    case PLANTYPE.BIKETRANSIT:
      access = ['BICYCLE'];
      egress = ['BICYCLE'];
      transfer = ['BICYCLE'];
      transitOnly = true;
      noIterationsForShortTrips = shortTrip;
      break;
    case PLANTYPE.PARKANDRIDE:
      access = ['CAR_PARKING'];
      transitOnly = true;
      break;
    case PLANTYPE.TRANSIT:
      direct = access;
      break;
    default: // direct modes
      direct = [planType];
      break;
  }
  if (directOnly) {
    // reset unused arrays
    access = null;
    egress = null;
    transfer = null;
    otpModes = [];
    settings.allowedBikeRentalNetworks = null;
  }
  const modes = {
    directOnly,
    transitOnly,
    direct,
    transit: {
      access,
      transfer,
      egress,
      transit: otpModes.length === 0 ? null : otpModes,
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
    planType,
    noIterationsForShortTrips,
  };
}
