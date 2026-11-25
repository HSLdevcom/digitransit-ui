import {
  getInterliningLegs,
  isFirstInterliningLeg,
  isTaxiLeg,
  isWalkOrBicycleWalkLeg,
  legTime,
} from '../../utils/legUtils';
import { ViaLocationType } from '../../../shared/utils/constants';

const ROUTE_NUMBER_THRESHOLD = 12;

/**
 * Normalises the bar-width percentage for each compressed leg.
 * Handles interlining spans, short-last-leg absorption, wait-time
 * merging, and carry-over from too-short walk legs to the following leg.
 *
 * Returns a ProcessedLeg array. Each entry has shape:
 *   { leg, index, skipped: true }                        — non-first interlining leg
 *   { leg, index, legLength, renderBar, waiting,         — renderable leg
 *     waitTime, waitLength, interliningWithRoute, nextLeg,
 *     skipped: false }
 */
export function computeBarLayout(
  compressedLegs,
  { relativeLength, renderBarThreshold, lastLegLength, waitThreshold },
) {
  const { result } = compressedLegs.reduce(
    ({ result: acc, carryOver }, leg, i) => {
      // Non-first interlining legs: their span is covered by the first leg.
      if (leg.interlineWithPreviousLeg) {
        return { result: [...acc, { leg, index: i, skipped: true }], carryOver };
      }

      const startMs = legTime(leg.start);
      const endMs = legTime(leg.end);
      const nextLeg = i < compressedLegs.length - 1 ? compressedLegs[i + 1] : null;

      let legLength = relativeLength(endMs - startMs);
      let waiting = false;
      let waitTime = 0;
      let waitLength = 0;
      let interliningWithRoute;

      if (nextLeg && !leg.to.viaLocationType) {
        // Don't show waiting in intermediate places.
        waitTime = legTime(nextLeg.start) - endMs;
        waitLength = relativeLength(waitTime);
        if (waitTime > waitThreshold && waitLength > renderBarThreshold) {
          // Show waiting as a separate bar if it's long enough.
          waiting = true;
        } else {
          // Otherwise add the wait time to the current leg.
          legLength = relativeLength(endMs - startMs + waitTime);
        }
      }

      if (isFirstInterliningLeg(compressedLegs, i)) {
        const [interliningLines, interliningLegs] = getInterliningLegs(compressedLegs, i);
        interliningWithRoute = interliningLines.join(' / ');
        const lastLegWithInterline = interliningLegs[interliningLegs.length - 1];
        legLength = relativeLength(legTime(lastLegWithInterline.end) - startMs);
        if (
          compressedLegs.length - 2 === i + interliningLegs.length &&
          lastLegLength < renderBarThreshold
        ) {
          // If the last leg is too short, add it to the interlining span.
          legLength += lastLegLength;
        }
      } else if (compressedLegs.length - 2 === i && lastLegLength < renderBarThreshold) {
        // If the last leg is too short, add it to the previous leg's span.
        legLength += lastLegLength;
      }

      legLength += carryOver;
      let newCarryOver = 0;
      let renderBar = true;
      if (legLength < renderBarThreshold && isWalkOrBicycleWalkLeg(leg)) {
        // Don't render a bar for too-short walk/bike legs; carry over their length to the next leg.
        renderBar = false;
        newCarryOver = legLength;
      }

      return {
        result: [
          ...acc,
          {
            leg,
            index: i,
            legLength,
            renderBar,
            waiting,
            waitTime,
            waitLength,
            interliningWithRoute,
            nextLeg,
            skipped: false,
          },
        ],
        carryOver: newCarryOver,
      };
    },
    { result: [], carryOver: 0 },
  );

  return result;
}

export function getStreetBarProps({
  leg,
  index,
  startMs,
  legLength,
  renderBar,
  renderModeIcons,
  usingOwnBicycle,
  bikeParkedIndex,
  config,
}) {
  const streetLeg = {
    leg,
    key: `${leg.mode}_${startMs}`,
    legLength,
    mode: leg.mode,
    duration: Math.floor(leg.duration / 60),
    renderModeIcons,
  };

  if (isWalkOrBicycleWalkLeg(leg) && renderBar) {
    const mode = usingOwnBicycle && index < bikeParkedIndex ? 'bicycle_walk' : 'walk';
    const parkingIndicator = usingOwnBicycle && leg.to.vehicleParking ? 'bike' : undefined;

    return { ...streetLeg, mode, parkingIndicator };
  }

  if ((leg.mode === 'CITYBIKE' || leg.mode === 'BICYCLE') && leg.rentedBike) {
    const networkId =
      leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
      leg.from.rentalVehicle?.rentalNetwork.networkId;
    const network = networkId && config.vehicleRental?.networks?.[networkId];
    const rentalWarningEnabled = !!network?.timeBeforeSurcharge && !!network.durationInstructions;

    return {
      ...streetLeg,
      mode: 'CITYBIKE',
      vehicleNameId: 'to-bicycle',
      stopName: leg.from.name,
      rentalBike: {
        networkId,
        rentalWarningEnabled,
        durationOverSurchargeLimit:
          rentalWarningEnabled && leg.duration > network.timeBeforeSurcharge,
      },
    };
  }

  if (leg.mode === 'SCOOTER' && leg.rentedBike) {
    return {
      ...streetLeg,
      key: `${leg.mode}_${leg.start.scheduledTime}`,
      vehicleNameId: 'to-e-scooter',
      stopName: '',
    };
  }

  if (leg.mode === 'CAR') {
    return {
      ...streetLeg,
      renderModeIcons: undefined,
      icon: 'icon_car',
      parkingIndicator: leg.to.vehicleParking ? 'car' : undefined,
    };
  }

  if (isTaxiLeg(leg)) {
    return { ...streetLeg, mode: 'taxi-external', icon: config.flex.taxiExternalIcon };
  }

  if (leg.mode === 'BICYCLE' && renderBar) {
    return { ...streetLeg, parkingIndicator: leg.to.vehicleParking ? 'bike' : undefined };
  }

  return null;
}

export function getTransitLegLayout({
  leg,
  legLength,
  longName,
  fitAllRouteNumbers,
  legWithRouteCount,
  startsAtMarkedStation,
  viaPointAdded,
  nextLeg,
  usingOwnBicycleWholeTrip,
  usingOwnCarWholeTrip,
  config,
  waiting,
  waitTime,
  waitLength,
}) {
  const hasRoute = !!leg.route;
  const nextLegStartsAtViaPoint =
    nextLeg?.transitLeg &&
    !nextLeg.interlineWithPreviousLeg &&
    (nextLeg.from.viaLocationType || nextLeg.viaStopCall);

  return {
    showFromViaPoint:
      hasRoute &&
      !startsAtMarkedStation &&
      (leg.from.viaLocationType === ViaLocationType.PassThrough ||
        (leg.viaStopCall && !viaPointAdded)),
    showTransitBar: hasRoute && !isTaxiLeg(leg),
    fitRouteNumber:
      !longName &&
      (fitAllRouteNumbers || (legLength > ROUTE_NUMBER_THRESHOLD && legWithRouteCount < 7)),
    withBicycle:
      !!leg.route &&
      usingOwnBicycleWholeTrip &&
      config.bikeBoardingModes[leg.route.mode] !== undefined,
    withCar:
      !!leg.route && usingOwnCarWholeTrip && config.carBoardingModes[leg.route.mode] !== undefined,
    showToViaPoint:
      hasRoute &&
      leg.to.viaLocationType === ViaLocationType.PassThrough &&
      !nextLegStartsAtViaPoint,
    showWaitBar: waiting && !nextLeg?.interlineWithPreviousLeg,
    waitDuration: waiting ? Math.floor(waitTime / 1000 / 60) : 0,
    waitIcon: usingOwnCarWholeTrip ? 'icon_wait-car' : 'icon_wait_standing',
    waitLength,
  };
}
