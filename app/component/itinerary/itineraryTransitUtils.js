import { isTaxiLeg } from '../../../utils/client/legUtils';
import { ViaLocationType } from '../../../utils/shared/constants';

const ROUTE_NUMBER_THRESHOLD = 12;

export function getItineraryTransitPresentation({
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
      (fitAllRouteNumbers ||
        (legLength > ROUTE_NUMBER_THRESHOLD && legWithRouteCount < 7)),
    withBicycle:
      !!leg.route &&
      usingOwnBicycleWholeTrip &&
      config.bikeBoardingModes[leg.route.mode] !== undefined,
    withCar:
      !!leg.route &&
      usingOwnCarWholeTrip &&
      config.carBoardingModes[leg.route.mode] !== undefined,
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
