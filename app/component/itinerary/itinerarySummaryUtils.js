import {
  compressLegs,
  getLegMode,
  getTripOrRouteText,
  isCarLeg,
  isLegWithRoute,
  legTime,
  splitLegsAtViaPoints,
} from '../../../utils/client/legUtils';
import { normalizeLegLengths } from './itineraryLegProcessor';

const NAME_LENGTH_THRESHOLD = 65;
const WAIT_THRESHOLD = 180000;

const getBikeParkedIndex = legs => {
  const index = legs.findIndex(leg => leg.to?.vehicleParking);
  return index === -1 ? legs.length : index;
};

export function getItineraryLegSummary({
  legs,
  intermediatePlaces,
  config,
  breakpoint,
  duration,
}) {
  const usingOwnBicycle = legs.some(
    leg => getLegMode(leg) === 'BICYCLE' && leg.rentedBike === false,
  );
  const usingOwnBicycleWholeTrip =
    usingOwnBicycle && legs.every(leg => !leg.to.vehicleParking);
  const usingOwnCar = legs.some(isCarLeg);
  const usingOwnCarWholeTrip =
    usingOwnCar && legs.every(leg => !leg.to.vehicleParking);
  const compressedLegs = compressLegs(
    splitLegsAtViaPoints(legs, intermediatePlaces),
  ).map(leg => ({ ...leg }));

  let intermediateSlack = 0;
  let legWithRouteCount = 0;
  let containsScooterLeg = false;
  let nameLengthSum = 0;

  compressedLegs.forEach((leg, index) => {
    if (isLegWithRoute(leg, config.taxiZone.allowedRouteTypes)) {
      legWithRouteCount += 1;
      nameLengthSum += getTripOrRouteText(leg.trip, leg.route, config).length;
    }

    nameLengthSum += 10;
    if (index > 0 && (leg.from.viaLocationType || leg.to.viaLocationType)) {
      intermediateSlack +=
        legTime(leg.start) - legTime(compressedLegs[index - 1].end);
    }
    containsScooterLeg = leg.mode === 'SCOOTER' || containsScooterLeg;
  });

  const durationWithoutSlack = duration - intermediateSlack;
  const relativeLength = durationMs =>
    durationWithoutSlack > 0 ? (100 * durationMs) / durationWithoutSlack : 0;
  const lastLeg = compressedLegs[compressedLegs.length - 1];
  const lastLegLength = lastLeg ? relativeLength(lastLeg.duration * 1000) : 0;
  const normalizedLegs = normalizeLegLengths(compressedLegs, {
    relativeLength,
    renderBarThreshold: breakpoint === 'small' ? 8.5 : 6,
    lastLegLength,
    waitThreshold: WAIT_THRESHOLD,
  });

  return {
    compressedLegs,
    normalizedLegs,
    usingOwnBicycle,
    usingOwnBicycleWholeTrip,
    usingOwnCarWholeTrip,
    containsScooterLeg,
    shortenLabels: nameLengthSum > NAME_LENGTH_THRESHOLD,
    fitAllRouteNumbers: legWithRouteCount < 4,
    legWithRouteCount,
    bikeParkedIndex: usingOwnBicycle
      ? getBikeParkedIndex(compressedLegs)
      : undefined,
    renderModeIcons: compressedLegs.length < 10,
  };
}
