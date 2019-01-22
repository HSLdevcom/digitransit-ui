import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';

/**
 * Check for legs with CANCELED trip status
 * @param itinerary The itinerary to be checked.
 */

export function checkForCanceledLegs(itinerary) {
  const canceledLegs = [];

  itinerary.legs.forEach(
    (leg, legIndex) =>
      leg.trip &&
      leg.from.stop &&
      leg.from.stop.stoptimes.forEach(
        stoptime =>
          stoptime.realtimeState === 'CANCELED' &&
          stoptime.stop.gtfsId === itinerary.legs[legIndex].from.stop.gtfsId &&
          !canceledLegs.includes(itinerary.legs[legIndex]) &&
          canceledLegs.push(itinerary.legs[legIndex]),
      ),
  );
  return canceledLegs;
}

function filterLegStops(leg, filter) {
  if (leg.from.stop && leg.to.stop && leg.trip) {
    const stops = [leg.from.stop.gtfsId, leg.to.stop.gtfsId];
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
  leg2.rentedBike === true;

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
const continueWithBicycle = (leg1, leg2) =>
  getLegMode(leg1) === LegMode.Bicycle && getLegMode(leg2) === LegMode.Bicycle;

/**
 * Compresses the incoming legs (affects only legs with mode BICYCLE, WALK or CITYBIKE). These are combined
 * so that the person will be walking their bicycle and there won't be multiple similar legs
 * one after the other.
 *
 * @param {*} originalLegs an array of legs
 */
export const compressLegs = originalLegs => {
  const usingOwnBicycle =
    originalLegs[0] != null &&
    originalLegs[1] != null &&
    ((getLegMode(originalLegs[0]) === LegMode.Bicycle &&
      !originalLegs[0].rentedBike) ||
      (getLegMode(originalLegs[1]) === LegMode.Bicycle &&
        !originalLegs[1].rentedBike));
  const compressedLegs = [];
  let compressedLeg;

  forEach(originalLegs, currentLeg => {
    if (!compressedLeg) {
      compressedLeg = cloneDeep(currentLeg);
      return;
    }

    if (currentLeg.intermediatePlace) {
      compressedLegs.push(compressedLeg);
      compressedLeg = cloneDeep(currentLeg);
      return;
    }

    if (usingOwnBicycle && continueWithBicycle(compressedLeg, currentLeg)) {
      compressedLeg.duration += currentLeg.duration;
      compressedLeg.distance += currentLeg.distance;
      compressedLeg.to = currentLeg.to;
      compressedLeg.endTime = currentLeg.endTime;
      compressedLeg.mode = LegMode.Bicycle;
      return;
    }

    if (
      currentLeg.rentedBike &&
      continueWithRentedBicycle(compressedLeg, currentLeg)
    ) {
      compressedLeg.duration += currentLeg.duration;
      compressedLeg.distance += currentLeg.distance;
      compressedLeg.to = currentLeg.to;
      compressedLeg.endTime += currentLeg.endTime;
      compressedLeg.mode = LegMode.CityBike;
      return;
    }

    if (usingOwnBicycle && getLegMode(compressedLeg) === LegMode.Walk) {
      compressedLeg.mode = LegMode.BicycleWalk;
    }

    compressedLegs.push(compressedLeg);
    compressedLeg = cloneDeep(currentLeg);

    if (usingOwnBicycle && getLegMode(currentLeg) === LegMode.Walk) {
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
  bikesAvailable > config.cityBike.fewAvailableCount ? '#64be14' : '#ff9000';

/**
 * Attempts to retrieve any relevant information from the leg that could be shown
 * as the related icon's badge.
 *
 * @param {*} leg the leg to extract the props from
 * @param {*} config the configuration for the software installation
 */
export const getLegBadgeProps = (leg, config) => {
  if (!leg.rentedBike || !leg.from || !leg.from.bikeRentalStation) {
    return undefined;
  }
  const { bikesAvailable } = leg.from.bikeRentalStation || 0;
  return {
    badgeFill: getCityBikeAvailabilityIndicatorColor(bikesAvailable, config),
    badgeText: `${bikesAvailable}`,
  };
};
