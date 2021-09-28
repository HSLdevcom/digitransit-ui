import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { BIKEAVL_UNKNOWN } from './citybikes';

function filterLegStops(leg, filter) {
  if (leg.from.stop && leg.to.stop && leg.trip) {
    const stops = [leg.from.stop.gtfsId, leg.to.stop.gtfsId];
    if (leg.trip.stoptimesForDate) {
      return leg.trip.stoptimesForDate
        .filter(stoptime => stops.indexOf(stoptime.stop.gtfsId) !== -1)
        .filter(filter);
    }
    return leg.trip.stoptimes
      .filter(stoptime => stops.indexOf(stoptime.stop.gtfsId) !== -1)
      .filter(filter);
  }
  return false;
}

/**
 * Check if legs start stop pickuptype or end stop pickupType is CALL_AGENCY
 *
 * leg must have:
 * from.stop.gtfsId
 * to.stop.gtfsId
 * trip.stoptimes (with props:)
 *   stop.gtfsId
 *   pickupType
 */
export function isCallAgencyPickupType(leg) {
  return (
    filterLegStops(leg, stoptime => stoptime.pickupType === 'CALL_AGENCY')
      .length > 0
  );
}

export function isCallAgencyDeparture(departure) {
  return departure.pickupType === 'CALL_AGENCY';
}

const sameBicycleNetwork = (leg1, leg2) => {
  if (leg1.from.bikeRentalStation && leg2.from.bikeRentalStation) {
    return (
      leg1.from.bikeRentalStation.networks[0] ===
      leg2.from.bikeRentalStation.networks[0]
    );
  }
  return true;
};

/**
 * Checks if both of the legs exist and are taken with a rented bicycle (rentedBike === true).
 *
 * @param {*} leg1 the first leg
 * @param {*} leg2 the second leg
 */
const continueWithRentedBicycle = (leg1, leg2) =>
  leg1 != null &&
  leg1.rentedBike === true &&
  leg2 != null &&
  leg2.rentedBike === true &&
  sameBicycleNetwork(leg1, leg2);

/**
 * The leg mode depicts different types of leg available.
 */
export const LegMode = {
  Bicycle: 'BICYCLE',
  BicycleWalk: 'BICYCLE_WALK',
  CityBike: 'CITYBIKE',
  Walk: 'WALK',
};

/**
 * Extracts the mode for the given leg or mode.
 *
 * @param {*} legOrMode the leg or mode to extract the mode from
 * @returns LegMode, or undefined if the mode cannot be extracted
 */
export const getLegMode = legOrMode => {
  const mode =
    typeof legOrMode === 'string' || legOrMode instanceof String
      ? legOrMode
      : legOrMode && legOrMode.mode;
  switch ((mode || '').toUpperCase()) {
    case LegMode.Bicycle:
      return LegMode.Bicycle;
    case LegMode.BicycleWalk:
      return LegMode.BicycleWalk;
    case LegMode.CityBike:
      return LegMode.CityBike;
    case LegMode.Walk:
      return LegMode.Walk;
    default:
      return undefined;
  }
};

/**
 * Checks if both of the legs exist and are taken with mode 'BICYCLE'.
 *
 * @param {*} leg1 the first leg
 * @param {*} leg2 the second leg
 */
const continueWithBicycle = (leg1, leg2) => {
  const isBicycle1 =
    leg1.mode === LegMode.Bicycle || leg1.mode === LegMode.Walk;
  const isBicycle2 =
    leg2.mode === LegMode.Bicycle || leg2.mode === LegMode.Walk;
  return isBicycle1 && isBicycle2 && !leg1.to.bikePark;
};

export const getLegText = (route, config, interliningWithRoute) => {
  const showAgency = get(config, 'agency.show', false);
  if (interliningWithRoute && interliningWithRoute !== route.shortName) {
    return `${route.shortName} / ${interliningWithRoute}`;
  }
  if (route.shortName) {
    return route.shortName;
  }
  if (showAgency && route.agency) {
    return route.agency.name;
  }
  return '';
};

const bikingEnded = leg1 => {
  return leg1.from.bikeRentalStation && leg1.mode === 'WALK';
};
/**
 * Compresses the incoming legs (affects only legs with mode BICYCLE, WALK or CITYBIKE). These are combined
 * so that the person will be walking their bicycle and there won't be multiple similar legs
 * one after the other.
 *
 * @param {*} originalLegs an array of legs
 * @param {boolean} keepBicycleWalk whether to keep bicycle walk legs before and after a public transport leg
 */
export const compressLegs = (originalLegs, keepBicycleWalk = false) => {
  const usingOwnBicycle = originalLegs.some(
    leg => getLegMode(leg) === LegMode.Bicycle && leg.rentedBike === false,
  );
  const compressedLegs = [];
  let compressedLeg;
  let bikeParked = false;
  originalLegs.forEach((currentLeg, i) => {
    if (currentLeg.to?.bikePark || currentLeg.from?.bikePark) {
      bikeParked = true;
    }
    if (!compressedLeg) {
      compressedLeg = cloneDeep(currentLeg);
      return;
    }
    if (currentLeg.intermediatePlace) {
      compressedLegs.push(compressedLeg);
      compressedLeg = cloneDeep(currentLeg);
      return;
    }

    if (keepBicycleWalk && usingOwnBicycle) {
      if (originalLegs[i + 1]?.transitLeg && currentLeg.mode !== 'BICYCLE') {
        compressedLegs.push(compressedLeg);
        compressedLeg = cloneDeep(currentLeg);
        return;
      }
      if (
        compressedLegs[compressedLegs.length - 1]?.transitLeg &&
        compressedLeg.mode !== 'BICYCLE'
      ) {
        compressedLegs.push(compressedLeg);
        compressedLeg = cloneDeep(currentLeg);
        return;
      }
    }
    if (usingOwnBicycle && continueWithBicycle(compressedLeg, currentLeg)) {
      // eslint-disable-next-line no-nested-ternary
      const newBikePark = compressedLeg.to.bikePark
        ? compressedLeg.to.bikePark
        : currentLeg.to.bikePark
        ? currentLeg.to.bikePark
        : null;
      compressedLeg.duration += currentLeg.duration;
      compressedLeg.distance += currentLeg.distance;
      compressedLeg.to = { ...currentLeg.to, ...{ bikePark: newBikePark } };
      compressedLeg.endTime = currentLeg.endTime;
      compressedLeg.mode = LegMode.Bicycle;
      return;
    }

    if (
      currentLeg.rentedBike &&
      continueWithRentedBicycle(compressedLeg, currentLeg) &&
      !bikingEnded(currentLeg)
    ) {
      compressedLeg.duration += currentLeg.duration;
      compressedLeg.distance += currentLeg.distance;
      compressedLeg.to = currentLeg.to;
      compressedLeg.endTime = currentLeg.endTime;
      compressedLeg.mode = LegMode.CityBike;
      return;
    }

    if (
      usingOwnBicycle &&
      !bikeParked &&
      getLegMode(compressedLeg) === LegMode.Walk
    ) {
      compressedLeg.mode = LegMode.BicycleWalk;
    }

    compressedLegs.push(compressedLeg);
    compressedLeg = cloneDeep(currentLeg);

    if (
      usingOwnBicycle &&
      !bikeParked &&
      getLegMode(currentLeg) === LegMode.Walk
    ) {
      compressedLeg.mode = LegMode.BicycleWalk;
    }
  });

  if (compressedLeg) {
    compressedLegs.push(compressedLeg);
  }
  return compressedLegs;
};

const sumDistances = legs =>
  legs.map(l => l.distance).reduce((x, y) => (x || 0) + (y || 0), 0);
const isWalkingLeg = leg =>
  [LegMode.BicycleWalk, LegMode.Walk].includes(getLegMode(leg));
const isBikingLeg = leg =>
  [LegMode.Bicycle, LegMode.CityBike].includes(getLegMode(leg));

/**
 * Checks if the itinerary consists of a single biking leg.
 *
 * @param {*} itinerary the itinerary to check the legs for
 */
export const onlyBiking = itinerary =>
  itinerary.legs.length === 1 && isBikingLeg(itinerary.legs[0]);

/**
 * Checks if any of the legs in the given itinerary contains biking.
 *
 * @param {*} itinerary the itinerary to check the legs for
 */
export const containsBiking = itinerary => itinerary.legs.some(isBikingLeg);

/**
 * Checks if any of the legs in the given itinerary contains biking with rental bike.
 *
 * @param {*} leg
 */
export const legContainsRentalBike = leg =>
  (getLegMode(leg) === LegMode.CityBike ||
    getLegMode(leg) === LegMode.Bicycle) &&
  leg.rentedBike;
/**
 * Calculates and returns the total walking distance undertaken in an itinerary.
 * This could be used as a fallback if the backend returns an invalid value.
 *
 * @param {*} itinerary the itinerary to extract the total walking distance from
 */
export const getTotalWalkingDistance = itinerary =>
  // TODO: could be itinerary.walkDistance, but that is invalid for CITYBIKE legs
  sumDistances(itinerary.legs.filter(isWalkingLeg));

/**
 * Calculates and returns the total biking distance undertaken in an itinerary.
 *
 * @param {*} itinerary the itinerary to extract the total biking distance from
 */
export const getTotalBikingDistance = itinerary =>
  sumDistances(itinerary.legs.filter(isBikingLeg));

/**
 * Calculates and returns the total distance undertaken in an itinerary.
 *
 * @param {*} itinerary the itinerary to extract the total distance from
 */
export const getTotalDistance = itinerary => sumDistances(itinerary.legs);

/**
 * Gets the indicator color for the current amount of citybikes available.
 *
 * @param {number} bikesAvailable the number of bikes currently available
 * @param {*} config the configuration for the software installation
 */
export const getCityBikeAvailabilityIndicatorColor = (bikesAvailable, config) =>
  // eslint-disable-next-line no-nested-ternary
  bikesAvailable === 0
    ? '#DC0451'
    : bikesAvailable > config.cityBike.fewAvailableCount
    ? '#3B7F00'
    : '#FCBC19';

/* Gets the indicator text color if  few bikes are available
 *
 * @param {number} bikesAvailable the number of bikes currently available
 * @param {*} config the configuration for the software installation/
 */
export const getCityBikeAvailabilityTextColor = (bikesAvailable, config) =>
  bikesAvailable <= config.cityBike.fewAvailableCount && bikesAvailable > 0
    ? '#333'
    : '#fff';

/**
 * Attempts to retrieve any relevant information from the leg that could be shown
 * as the related icon's badge.
 *
 * @param {*} leg the leg to extract the props from
 * @param {*} config the configuration for the software installation
 */
export const getLegBadgeProps = (leg, config) => {
  if (
    !leg.rentedBike ||
    !leg.from ||
    !leg.from.bikeRentalStation ||
    config.cityBike.capacity === BIKEAVL_UNKNOWN
  ) {
    return undefined;
  }
  const { bikesAvailable } = leg.from.bikeRentalStation || 0;
  return {
    badgeFill: getCityBikeAvailabilityIndicatorColor(bikesAvailable, config),
    badgeText: `${bikesAvailable}`,
    badgeTextFill: getCityBikeAvailabilityTextColor(bikesAvailable, config),
  };
};

export const getZoneLabel = (zoneId, config) => {
  if (config.zoneIdMapping) {
    return config.zoneIdMapping[zoneId];
  }
  return zoneId;
};

export const getNewMinMaxCharCodes = (
  newCharCode,
  minCharCode,
  maxCharCode,
) => {
  let newMin = minCharCode;
  let newMax = maxCharCode;
  if (newMin === undefined || newMin > newCharCode) {
    newMin = newCharCode;
  }
  if (newMax === undefined || newMax < newCharCode) {
    newMax = newCharCode;
  }
  return [newMin, newMax];
};

/**
 * Retrieves all zones from the legs (from & to points) and the legs' stops.
 * This only works if zones have alphabetically continuous one letter zone names
 * and skipping a zone is not possible.
 *
 * @param {*} legs The legs to retrieve the zones from.
 */
export const getZones = legs => {
  if (!Array.isArray(legs)) {
    return [];
  }

  let minCharCode;
  let maxCharCode;
  legs.forEach(leg => {
    if (leg.from && leg.from.stop && leg.from.stop.zoneId) {
      const zoneCharCode = leg.from.stop.zoneId.charCodeAt(0);
      [minCharCode, maxCharCode] = getNewMinMaxCharCodes(
        zoneCharCode,
        minCharCode,
        maxCharCode,
      );
    }
    if (leg.to && leg.to.stop && leg.to.stop.zoneId) {
      const zoneCharCode = leg.to.stop.zoneId.charCodeAt(0);
      [minCharCode, maxCharCode] = getNewMinMaxCharCodes(
        zoneCharCode,
        minCharCode,
        maxCharCode,
      );
    }
    if (Array.isArray(leg.intermediatePlaces)) {
      leg.intermediatePlaces
        .filter(place => place.stop && place.stop.zoneId)
        .forEach(place => {
          const zoneCharCode = place.stop.zoneId.charCodeAt(0);
          [minCharCode, maxCharCode] = getNewMinMaxCharCodes(
            zoneCharCode,
            minCharCode,
            maxCharCode,
          );
        });
    }
  });

  // Add zones starting from the alphabetically first zone and ending in the alphabetically last.
  // This way zones, that are between other zones but never stopped at, will be also added.
  const zones = {};
  if (minCharCode !== undefined) {
    for (let charCode = minCharCode; charCode <= maxCharCode; charCode++) {
      zones[String.fromCharCode(charCode)] = true;
    }
  }
  return Object.keys(zones).sort();
};

export const getRoutes = legs => {
  if (!Array.isArray(legs)) {
    return [];
  }

  const routes = {};
  legs.forEach(leg => {
    if (leg.route && leg.route.agency && leg.transitLeg) {
      const { route } = leg;
      const { agency } = route;
      routes[route.gtfsId] = {
        agency: {
          fareUrl: agency.fareUrl,
          gtfsId: agency.gtfsId,
          name: agency.name,
        },
        gtfsId: route.gtfsId,
        longName: route.longName,
      };
    }
  });
  return Object.keys(routes).map(key => ({ ...routes[key] }));
};

export const getHeadsignFromRouteLongName = route => {
  const { longName, shortName } = route;
  let headsign = longName;
  if (
    longName &&
    shortName &&
    longName.substring(0, shortName.length) === shortName &&
    longName.length > shortName.length
  ) {
    headsign = longName.substring(shortName.length);
  }
  return headsign;
};

/**
 * Calculates and returns the total duration undertaken in legs.
 *
 * @param {*} legs the legs to extract the total duration from
 */
const sumDurations = legs =>
  legs.map(l => l.duration).reduce((x, y) => (x || 0) + (y || 0), 0);

/**
 * Calculates and returns the total walking duration undertaken in an itinerary.
 * This could be used as a fallback if the backend returns an invalid value.
 *
 * @param {*} itinerary the itinerary to extract the total walking duration from
 */
export const getTotalWalkingDuration = itinerary =>
  // TODO: could be itinerary.walkDuration, but that is invalid for CITYBIKE legs
  sumDurations(itinerary.legs.filter(isWalkingLeg));

/**
 * Calculates and returns the total biking duration undertaken in an itinerary.
 *
 * @param {*} itinerary the itinerary to extract the total biking duration from
 */
export const getTotalBikingDuration = itinerary =>
  sumDurations(itinerary.legs.filter(isBikingLeg));
