import omitBy from 'lodash/omitBy';
import moment from 'moment';
import Cookies from 'universal-cookie';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import point from 'turf-point';
import polygon from 'turf-polygon';
import herrenbergOldTownGeojson from './geojson/herrenberg-old-town.json';

import {
  filterModes,
  getDefaultModes,
  getModes,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getDefaultNetworks } from './citybikes';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';
import { BicycleParkingFilter } from '../constants';

/**
 * Retrieves the default settings from the configuration.
 *
 * @param {*} config the configuration for the software installation
 */
export const getDefaultSettings = config => {
  if (!config) {
    return {};
  }
  return {
    ...config.defaultSettings,
    modes: getDefaultModes(config).sort(),
    allowedBikeRentalNetworks: getDefaultNetworks(config),
    useCarParkAvailabilityInformation: null,
  };
};

/**
 * Retrieves the current (customized) settings that are in use.
 *
 * @param {*} config the configuration for the software installation
 * @param {*} query the query part of the current url
 */
export const getCurrentSettings = config => {
  const defaultSettings = getDefaultSettings(config);
  const customizedSettings = getCustomizedSettings();
  return {
    ...defaultSettings,
    ...customizedSettings,
    modes: customizedSettings?.modes
      ? [
          ...customizedSettings?.modes.filter(mode =>
            isTransportModeAvailable(config, mode),
          ),
          'WALK',
        ].sort()
      : defaultSettings.modes,
  };
};

function getTicketTypes(settingsTicketType, defaultTicketType) {
  // separator used to be _, map it to : to keep old URLs compatible
  const remap = str => [`${str}`.replace('_', ':')];
  const isRestriction = type => type !== 'none';

  if (settingsTicketType) {
    return isRestriction(settingsTicketType) ? remap(settingsTicketType) : null;
  }
  return defaultTicketType && isRestriction(defaultTicketType)
    ? remap(defaultTicketType)
    : null;
}
/**
 * Find an option nearest to the value
 *
 * @param value a number
 * @param options array of numbers
 * @returns on option from options that is closest to the provided value
 */
export const findNearestOption = (value, options) => {
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
};

function nullOrUndefined(val) {
  return val === null || val === undefined;
}

function getDisableRemainingWeightHeuristic(modes) {
  let disableRemainingWeightHeuristic;
  if (Array.isArray(modes) && modes.includes('BICYCLE_RENT')) {
    disableRemainingWeightHeuristic = false;
  } else {
    disableRemainingWeightHeuristic = false;
  }
  return disableRemainingWeightHeuristic;
}

const getNumberValueOrDefault = (value, defaultValue = undefined) =>
  value !== undefined ? Number(value) : defaultValue;

export const getSettings = config => {
  const custSettings = getCustomizedSettings();

  return {
    walkSpeed:
      config.defaultOptions.walkSpeed.find(
        option =>
          option ===
          getNumberValueOrDefault(
            custSettings.walkSpeed,
            config.defaultSettings.walkSpeed,
          ),
      ) ||
      config.defaultOptions.walkSpeed.find(
        option =>
          option ===
          findNearestOption(
            getNumberValueOrDefault(
              custSettings.walkSpeed,
              config.defaultSettings.walkSpeed,
            ),
            config.defaultOptions.walkSpeed,
          ),
      ),
    walkReluctance: getNumberValueOrDefault(custSettings.walkReluctance),
    walkBoardCost: getNumberValueOrDefault(custSettings.walkBoardCost),
    modes: undefined,
    accessibilityOption: getNumberValueOrDefault(
      custSettings.accessibilityOption,
    ),
    ticketTypes: custSettings.ticketTypes,
    bikeSpeed:
      config.defaultOptions.bikeSpeed.find(
        option =>
          option ===
          getNumberValueOrDefault(
            custSettings.bikeSpeed,
            config.defaultSettings.bikeSpeed,
          ),
      ) ||
      config.defaultOptions.bikeSpeed.find(
        option =>
          option ===
          findNearestOption(
            getNumberValueOrDefault(
              custSettings.bikeSpeed,
              config.defaultSettings.bikeSpeed,
            ),
            config.defaultOptions.bikeSpeed,
          ),
      ),
    allowedBikeRentalNetworks: custSettings.allowedBikeRentalNetworks,
    includeBikeSuggestions: custSettings.includeBikeSuggestions,
    includeCarSuggestions: custSettings.includeCarSuggestions,
    includeParkAndRideSuggestions: custSettings.includeParkAndRideSuggestions,
    useCarParkAvailabilityInformation:
      custSettings.useCarParkAvailabilityInformation,
    bicycleParkingFilter: custSettings.bicycleParkingFilter,
  };
};

const getShouldMakeParkRideQuery = (
  linearDistance,
  config,
  settings,
  defaultSettings,
) => {
  return (
    linearDistance > config.suggestCarMinDistance &&
    (settings.includeParkAndRideSuggestions !== undefined
      ? settings.includeParkAndRideSuggestions
      : defaultSettings.includeParkAndRideSuggestions)
  );
};

const getShouldMakeCarQuery = (
  linearDistance,
  config,
  settings,
  defaultSettings,
) => {
  return (
    linearDistance > config.suggestCarMinDistance &&
    (settings.includeCarSuggestions !== undefined
      ? settings.includeCarSuggestions
      : defaultSettings.includeCarSuggestions)
  );
};

const getShouldMakeOnDemandTaxiQuery = time => {
  const date = new Date(time * 1000);
  return (
    date.getHours() > 20 || // starting at 9pm
    date.getHours() < 5 ||
    (date.getHours() === 5 && date.getMinutes() === 0)
  );
};

const isDestinationOldTownOfHerrenberg = destination => {
  return booleanPointInPolygon(
    point([destination.lon, destination.lat]),
    polygon(herrenbergOldTownGeojson.features[0].geometry.coordinates),
  );
};

export const preparePlanParams = (config, useDefaultModes) => (
  { from, to },
  {
    location: {
      query: {
        arriveBy,
        intermediatePlaces,
        time,
        locale,
        useCarParkAvailabilityInformation,
        bannedVehicleParkingTags,
      },
    },
  },
) => {
  const settings = getSettings(config);
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediatePlaceLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  const modesOrDefault = useDefaultModes
    ? getDefaultModes(config)
    : filterModes(
        config,
        getModes(config),
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      );
  const defaultSettings = { ...getDefaultSettings(config) };
  // legacy settings used to set network name in uppercase in localstorage
  const allowedBikeRentalNetworksMapped = Array.isArray(
    settings.allowedBikeRentalNetworks,
  )
    ? settings.allowedBikeRentalNetworks
        .filter(
          network =>
            defaultSettings.allowedBikeRentalNetworks.includes(network) ||
            defaultSettings.allowedBikeRentalNetworks.includes(
              network.toLowerCase(),
            ),
        )
        .map(network =>
          defaultSettings.allowedBikeRentalNetworks.includes(
            network.toLowerCase(),
          )
            ? network.toLowerCase()
            : network,
        )
    : defaultSettings.allowedBikeRentalNetworks;
  const formattedModes = modesAsOTPModes(modesOrDefault);
  const wheelchair =
    getNumberValueOrDefault(settings.accessibilityOption, defaultSettings) ===
    1;
  const includeBikeSuggestions =
    settings.includeBikeSuggestions !== undefined
      ? settings.includeBikeSuggestions
      : defaultSettings.includeBikeSuggestions;
  const linearDistance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediatePlaceLocations,
  );
  const isDepartureTimeWithin15Minutes = parsedTime => {
    const timeFromNowInMin = parsedTime.diff(new Date(), 'minutes');
    return (
      parsedTime.isSame(new Date(), 'day') &&
      timeFromNowInMin >= -15 &&
      timeFromNowInMin <= 15
    );
  };
  const parsedTime = time ? moment(time * 1000) : moment();

  let bannedBicycleParkingTags = [];
  let preferredBicycleParkingTags = [];
  if (BicycleParkingFilter.FreeOnly === settings.bicycleParkingFilter) {
    bannedBicycleParkingTags = ['osm:fee=yes'];
  }
  if (BicycleParkingFilter.SecurePreferred === settings.bicycleParkingFilter) {
    preferredBicycleParkingTags = ['osm:fee=yes', 'osm:fee=some'];
  }

  const cookies = new Cookies();
  return {
    ...defaultSettings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: fromLocation,
        to: toLocation,
        intermediatePlaces: intermediatePlaceLocations,
        numItineraries: 10,
        date: parsedTime.format('YYYY-MM-DD'),
        time: parsedTime.format('HH:mm:ss'),
        walkReluctance: settings.walkReluctance,
        walkBoardCost: settings.walkBoardCost,
        minTransferTime: config.minTransferTime,
        walkSpeed: settings.walkSpeed,
        arriveBy: arriveBy === 'true',
        maxWalkDistance: config.maxWalkDistance,
        wheelchair,
        transferPenalty: config.transferPenalty,
        bikeSpeed: settings.bikeSpeed,
        optimize: settings.includeBikeSuggestions
          ? config.defaultSettings.optimize
          : config.optimize,
        triangle: {
          safetyFactor: config.defaultSettings.safetyFactor,
          slopeFactor: config.defaultSettings.slopeFactor,
          timeFactor: config.defaultSettings.timeFactor,
        },
        itineraryFiltering: config.itineraryFiltering,
        unpreferred: {
          useUnpreferredRoutesPenalty: config.useUnpreferredRoutesPenalty,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
        ),
        locale: locale || cookies.get('lang') || 'fi',
        useCarParkAvailabilityInformation,
        useVehicleParkingAvailabilityInformation: isDepartureTimeWithin15Minutes(
          parsedTime,
        ),

        bannedVehicleParkingTags: bannedVehicleParkingTags
          ? [bannedVehicleParkingTags].concat(
              config.parkAndRideBannedVehicleParkingTags,
            )
          : config.parkAndRideBannedVehicleParkingTags,
      },
      nullOrUndefined,
    ),
    modes: formattedModes,
    ticketTypes: getTicketTypes(
      settings.ticketTypes,
      defaultSettings.ticketTypes,
    ),
    allowedBikeRentalNetworks: allowedBikeRentalNetworksMapped,
    shouldMakeWalkQuery:
      !wheelchair && linearDistance < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      (settings.includeBikeSuggestions
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    shouldMakeCarQuery: getShouldMakeCarQuery(
      linearDistance,
      config,
      settings,
      defaultSettings,
    ),
    shouldMakeParkRideQuery: getShouldMakeParkRideQuery(
      linearDistance,
      config,
      settings,
      defaultSettings,
    ),
    shouldMakeOnDemandTaxiQuery: getShouldMakeOnDemandTaxiQuery(time),
    showBikeAndPublicItineraries:
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      linearDistance >= config.suggestBikeAndPublicMinDistance &&
      modesOrDefault.length > 1 &&
      includeBikeSuggestions,
    showBikeAndParkItineraries:
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      linearDistance >= config.suggestBikeAndParkMinDistance &&
      modesOrDefault.length > 1 &&
      includeBikeSuggestions,
    bikeAndPublicMaxWalkDistance: config.suggestBikeAndPublicMaxDistance,
    bikeandPublicDisableRemainingWeightHeuristic:
      Array.isArray(intermediatePlaceLocations) &&
      intermediatePlaceLocations.length > 0,
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bannedBicycleParkingTags,
    preferredBicycleParkingTags,
    unpreferredBicycleParkingTagPenalty:
      config.unpreferredBicycleParkingTagPenalty,
    onDemandTaxiModes: [
      { mode: 'RAIL' },
      { mode: 'FLEX', qualifier: 'EGRESS' },
      { mode: 'FLEX', qualifier: 'DIRECT' },
      { mode: 'WALK' },
    ],
    bikeParkModes: [{ mode: 'BICYCLE', qualifier: 'PARK' }, ...formattedModes],
    carParkModes: [
      isDestinationOldTownOfHerrenberg(toLocation)
        ? { mode: 'CAR', qualifier: 'PARK' }
        : { mode: 'CAR' },
    ],
  };
};
