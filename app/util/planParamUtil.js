import omitBy from 'lodash/omitBy';
import moment from 'moment';

import {
  getDefaultModes,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import {
  otpToLocation,
  getIntermediatePlaces,
  placeOrStop,
} from './otpStrings';
import { getDefaultNetworks } from './vehicleRentalUtils';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';

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

function nullOrUndefined(val) {
  return val === null || val === undefined;
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

function shouldMakeParkRideQuery(distance, config, settings) {
  return (
    distance > config.suggestCarMinDistance &&
    settings.includeParkAndRideSuggestions
  );
}

function shouldMakeCarQuery(distance, config, settings) {
  return (
    config.showCO2InItinerarySummary ||
    (distance > config.suggestCarMinDistance && settings.includeCarSuggestions)
  );
}

export function hasStartAndDestination({ from, to }) {
  return from && to && from !== '-' && to !== '-';
}

export function getPlanParams(
  config,
  {
    params: { from, to },
    location: {
      query: { arriveBy, intermediatePlaces, time },
    },
  },
  relaxSettings,
) {
  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediateLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  let modesOrDefault = relaxSettings ? defaultSettings.modes : settings.modes;
  modesOrDefault = modesOrDefault.map(mode =>
    mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode,
  );
  if (!settings.allowedBikeRentalNetworks?.length) {
    // do not ask citybike routes without networks
    modesOrDefault = modesOrDefault.filter(mode => mode !== 'BICYCLE_RENT');
  }
  const otpModes = modesAsOTPModes(modesOrDefault);
  const modesWithoutRent = otpModes.filter(mode => mode.qualifier !== 'RENT');
  const wheelchair = !!settings.accessibilityOption;
  const linearDistance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediateLocations,
  );
  const ticketTypes =
    relaxSettings || settings.ticketTypes === 'none'
      ? null
      : settings.ticketTypes;
  const walkReluctance = relaxSettings
    ? defaultSettings.walkReluctance
    : settings.walkReluctance;
  const walkBoardCost = relaxSettings
    ? defaultSettings.walkBoardCost
    : settings.walkBoardCost;

  const fromPlace = placeOrStop(from);
  const toPlace = placeOrStop(to);

  return {
    ...settings,
    ...omitBy(
      {
        fromPlace,
        toPlace,
      },
      nullOrUndefined,
    ),
    ticketTypes,
    date: (time ? moment(time * 1000) : moment()).format('YYYY-MM-DD'),
    time: (time ? moment(time * 1000) : moment()).format('HH:mm:ss'),
    numItineraries: 5,
    arriveBy: arriveBy === 'true',
    wheelchair,
    walkReluctance,
    walkBoardCost,
    modes: otpModes,
    modeWeight: config.customWeights,
    shouldMakeWalkQuery:
      !wheelchair &&
      linearDistance < config.suggestWalkMaxDistance &&
      !config.hideWalkOption,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      settings.includeBikeSuggestions,
    shouldMakeCarQuery: shouldMakeCarQuery(linearDistance, config, settings),
    shouldMakeParkRideQuery:
      modesOrDefault.length > 1 &&
      shouldMakeParkRideQuery(linearDistance, config, settings),
    showBikeAndPublicItineraries:
      modesOrDefault.length > 1 &&
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      settings.includeBikeSuggestions,
    showBikeAndParkItineraries:
      modesOrDefault.length > 1 &&
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      (config.includePublicWithBikePlan
        ? settings.includeBikeSuggestions
        : settings.showBikeAndParkItineraries),
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bikeParkModes: [
      { mode: 'BICYCLE', qualifier: 'PARK' },
      ...modesWithoutRent, // BICYCLE_RENT can't be used together with BICYCLE_PARK
    ],
    parkRideModes: [{ mode: 'CAR', qualifier: 'PARK' }, ...modesWithoutRent],
  };
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

export function getPlanConnectionParams(
  config,
  {
    params: { from, to },
    location: {
      query: { arriveBy, time },
    },
  },
  relaxSettings,
) {
  const defaultSettings = getDefaultSettings(config);
  const settings = getSettings(config);
  const fromPlace = getLocation(from);
  const toPlace = getLocation(to);
  const modesOrDefault = relaxSettings ? defaultSettings.modes : settings.modes;
  const transitModes = modesOrDefault.filter(
    mode => mode !== 'CITYBIKE' && mode !== 'WALK',
  );
  const otpModes = modesAsOTPModes(transitModes);
  if (config.customWeights) {
    otpModes.forEach(m => {
      if (config.customWeights[m.mode]) {
        // eslint-disable-next-line
        m.cost = { reluctance: config.customWeights[m.mode] };
      }
    });
  }

  const modes = {
    directOnly: false,
    transitOnly: false,
    direct: ['WALK'],
    transit: {
      access: ['WALK'],
      transfer: ['WALK'],
      egress: ['WALK'],
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
    numItineraries: 5,
    wheelchair,
    walkReluctance,
    walkBoardCost,
    modes,
  };
}
