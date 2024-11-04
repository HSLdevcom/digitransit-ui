import omitBy from 'lodash/omitBy';
import moment from 'moment-timezone';
import Cookies from 'universal-cookie';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import point from 'turf-point';
import polygon from 'turf-polygon';
import herrenbergOldTownGeojson from './geojson/herrenberg-old-town.json';

import {
  filterModes,
  getDefaultModes,
  getModes,
  getOTPMode,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import {
  getCitybikeNetworks,
  getDefaultNetworks,
  getDefaultFormFactors,
} from './citybikes';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';
import { BicycleParkingFilter, FormFactorType } from '../constants';

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
    allowedVehicleRentalNetworks: config.transportModes.citybike.defaultValue
      ? getDefaultNetworks(config)
      : [],
    allowedVehicleRentalFormFactors: config.transportModes.citybike.defaultValue
      ? getDefaultFormFactors(config)
      : [],
    useVehicleParkingAvailabilityInformation: null,
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
    allowedVehicleRentalNetworks: getCitybikeNetworks(config),
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
    allowedVehicleRentalNetworks: custSettings.allowedVehicleRentalNetworks,
    allowedVehicleRentalFormFactors:
      custSettings.allowedVehicleRentalFormFactors,
    includeBikeSuggestions: custSettings.includeBikeSuggestions,
    includeCarSuggestions: custSettings.includeCarSuggestions,
    includeParkAndRideSuggestions: custSettings.includeParkAndRideSuggestions,
    useVehicleParkingAvailabilityInformation:
      custSettings.useVehicleParkingAvailabilityInformation,
    bicycleParkingFilter: custSettings.bicycleParkingFilter,
    showBikeAndParkItineraries: custSettings.showBikeAndParkItineraries,
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

const getShouldMakeCarRentalQuery = (linearDistance, config, settings) => {
  return (
    (linearDistance > config.suggestCarMinDistance &&
      settings?.allowedVehicleRentalFormFactors?.includes(
        FormFactorType.Car,
      )) ||
    false
  );
};

const isDestinationOldTownOfHerrenberg = destination => {
  return booleanPointInPolygon(
    point([destination.lon, destination.lat]),
    polygon(herrenbergOldTownGeojson.features[0].geometry.coordinates),
  );
};

export const hasStartAndDestination = ({ from, to }) =>
  from && to && from !== '-' && to !== '-';

/**
 * Prepares the parameters for te graphQL query.
 * useDefaultModes: true for the standardQuery, false for additional batch query
 * */
export const preparePlanParams = (config, useDefaultModes) => (
  { from, to },
  {
    location: {
      query: {
        arriveBy,
        intermediatePlaces,
        time,
        locale,
        useVehicleParkingAvailabilityInformation,
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
    ? getDefaultModes(config).map(mode => getOTPMode(config, mode))
    : filterModes(
        config,
        getModes(config),
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      );
  const defaultSettings = { ...getDefaultSettings(config) };
  // network enabled in config, regardless of user preferences
  const availableVehicleRentalNetworks = getDefaultNetworks(config);
  const allowedVehicleRentalNetworks = Array.isArray(
    settings.allowedVehicleRentalNetworks,
  )
    ? settings.allowedVehicleRentalNetworks
    : [];
  const lowerCasedAllowedVehicleRentalNetworks = allowedVehicleRentalNetworks.map(
    network => network.toLowerCase(),
  );

  // legacy settings used to set network name in uppercase in localstorage
  // Note: Both `settings.allowedVehicleRentalNetworks` and `availableVehicleRentalNetworks` might contain arbitrarily cased network "IDs"; We prefer the "most exact" match.
  const allowedVehicleRentalNetworksMapped =
    allowedVehicleRentalNetworks.length > 0
      ? availableVehicleRentalNetworks.filter(
          network =>
            allowedVehicleRentalNetworks.includes(network) ||
            lowerCasedAllowedVehicleRentalNetworks.includes(
              network.toLowerCase(),
            ),
        )
      : defaultSettings.allowedVehicleRentalNetworks;

  const includeBikeRentSuggestions =
    settings?.allowedVehicleRentalFormFactors?.includes(
      FormFactorType.Bicycle,
    ) || false;
  // We need to remove BIYCLE_RENT as it is requested via Batch and not standard query
  const modesWithoutBikeRent = modesOrDefault.filter(
    mode => mode !== 'BICYCLE_RENT',
  );
  const formattedModes = modesAsOTPModes(modesWithoutBikeRent);
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
  const parsedTime = time ? moment(time * 1000) : moment();

  let bannedBicycleParkingTags = [];
  let preferredBicycleParkingTags = [];
  if (BicycleParkingFilter.FreeOnly === settings.bicycleParkingFilter) {
    bannedBicycleParkingTags = ['osm:fee=yes'];
  }
  if (BicycleParkingFilter.SecurePreferred === settings.bicycleParkingFilter) {
    preferredBicycleParkingTags = [
      'osm:fee=yes',
      'osm:fee=some',
      'osm:bicycle_parking=lockers',
    ];
  }

  // Use defaults or user given settings
  const ticketTypes = useDefaultModes
    ? null
    : getTicketTypes(settings.ticketTypes, defaultSettings.ticketTypes);
  const walkReluctance = useDefaultModes
    ? defaultSettings.walkReluctance
    : settings.walkReluctance;
  const walkBoardCost = useDefaultModes
    ? defaultSettings.walkBoardCost
    : settings.walkBoardCost;

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
        numItineraries: 5,
        date: parsedTime.format('YYYY-MM-DD'),
        time: parsedTime.format('HH:mm:ss'),
        walkReluctance,
        walkBoardCost,
        minTransferTime: config.minTransferTime,
        walkSpeed: settings.walkSpeed,
        arriveBy: arriveBy === 'true',
        wheelchair,
        transferPenalty: config.transferPenalty,
        bikeSpeed: settings.bikeSpeed,
        // TODO why does optimize depend on includeBikeSuggestions?
        optimize: settings.includeBikeSuggestions
          ? config.defaultSettings.optimize
          : config.optimize,
        triangle: {
          safetyFactor: config.defaultSettings.safetyFactor,
          slopeFactor: config.defaultSettings.slopeFactor,
          timeFactor: config.defaultSettings.timeFactor,
        },
        itineraryFiltering: config.itineraryFiltering,
        locale: locale || cookies.get('lang') || 'fi',
        // todo
        useVehicleParkingAvailabilityInformation,

        bannedVehicleParkingTags: bannedVehicleParkingTags
          ? [bannedVehicleParkingTags].concat(
              config.parkAndRideBannedVehicleParkingTags,
            )
          : config.parkAndRideBannedVehicleParkingTags,
      },
      nullOrUndefined,
    ),
    // These modes are used by the "default" routing query.
    modes: [
      // In stadtnavi, we want flex routing to be displayed as proper mode.
      /*
      ...(formattedModes.some(({ mode }) => mode === 'BUS')
        ? [
            { mode: 'FLEX', qualifier: 'DIRECT' },
            { mode: 'FLEX', qualifier: 'ACCESS' },
            { mode: 'FLEX', qualifier: 'EGRESS' },
          ]
        : []), */
      ...formattedModes,
    ],
    ticketTypes,
    modeWeight: config.customWeights,
    allowedVehicleRentalNetworks: allowedVehicleRentalNetworksMapped,
    shouldMakeWalkQuery:
      !wheelchair && linearDistance < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      includeBikeSuggestions,
    shouldMakeScooterQuery:
      (!wheelchair &&
        settings?.allowedVehicleRentalFormFactors?.includes(
          FormFactorType.Scooter,
        )) ||
      false,
    shouldMakeCarQuery: getShouldMakeCarQuery(
      linearDistance,
      config,
      settings,
      defaultSettings,
    ),
    shouldMakeCarRentalQuery: getShouldMakeCarRentalQuery(
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
    // TODO shouldMakeXYZQuery and showXYZItineraries have same intend, harmonize
    // In bbnavi, we include Flex routing in the "default" public routing mode.
    shouldMakeOnDemandTaxiQuery: false,
    showBikeAndPublicItineraries:
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      linearDistance >= config.suggestBikeAndPublicMinDistance &&
      modesOrDefault.length > 1 &&
      includeBikeSuggestions,
    showBikeRentAndPublicItineraries:
      !wheelchair &&
      linearDistance >= config.suggestBikeAndParkMinDistance &&
      modesOrDefault.length > 1 &&
      includeBikeRentSuggestions,
    showBikeAndParkItineraries:
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      linearDistance >= config.suggestBikeAndParkMinDistance &&
      modesOrDefault.length > 1 &&
      includeBikeSuggestions,
    bikeAndPublicMaxWalkDistance: config.suggestBikeAndPublicMaxDistance,
    bikeAndPublicModes: [
      // with CONFIG=bbnavi, we get FLEX+ACCESS even though that doesn't make sense.
      // does BICYCLE override BUS(with FLEX+ACCESS/EGRESS) in this case?
      // does the VBB data specify if travelling with a bike is allowed?
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bikeRentAndPublicModes: [
      // Apparently, including *both* `{mode: 'BICYCLE'}` and `{mode: 'BICYCLE', qualifier: 'RENT'}`
      // causes OTP to *exclude* connections that *don't* contain any `BICYCLE` leg.
      // When sending just `{mode: 'BICYCLE', qualifier: 'RENT'}`, it work as intended:
      // - include itineraries with non-rented `BICYCLE` legs
      // - include itineraries with rented `BICYCLE` legs
      // - include itineraries without any `BICYCLE` legs whatsoever
      { mode: 'BICYCLE', qualifier: 'RENT' },
      // TODO: OTP seems to require FLEX DIRECT to return bike rental & transit results, to be checked
      { mode: 'FLEX', qualifier: 'DIRECT' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bannedBicycleParkingTags,
    preferredBicycleParkingTags,
    unpreferredBicycleParkingTagPenalty:
      config.unpreferredBicycleParkingTagPenalty,
    onDemandTaxiModes: [
      // `filterModes` removes `FLEX_*`, so we include it manually.
      { mode: 'FLEX', qualifier: 'DIRECT' },
      { mode: 'FLEX', qualifier: 'ACCESS' },
      { mode: 'FLEX', qualifier: 'EGRESS' },
      ...modesAsOTPModes(
        filterModes(
          config,
          ['RAIL', 'BUS', 'WALK'],
          from,
          to,
          intermediatePlaces || [],
        ),
      ),
    ],
    bikeParkModes: [{ mode: 'BICYCLE', qualifier: 'PARK' }, ...formattedModes],
    scooterRentAndPublicModes: [
      { mode: 'SCOOTER', qualifier: 'RENT' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    carParkModes: [
      isDestinationOldTownOfHerrenberg(toLocation)
        ? { mode: 'CAR', qualifier: 'PARK' }
        : { mode: 'CAR' },
    ],
    carRentalModes: [{ mode: 'CAR', qualifier: 'RENT' }],
    parkRideModes: [
      { mode: 'CAR', qualifier: 'PARK' },
      ...modesAsOTPModes(
        filterModes(
          config,
          ['BUS', 'RAIL', 'SUBWAY'],
          from,
          to,
          intermediatePlaces || [],
        ),
      ),
    ],
  };
};
