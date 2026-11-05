import {
  hasAirplaneLegs,
  hasScooterLegs,
  hasTaxiLegs,
  isBikeParkLeg,
  isBikeRentalLeg,
} from '../../../utils/client/legUtils';

export function shouldShowStartNavigation({
  startNavigation,
  legs,
  drivingDistance,
}) {
  const onlyWalking = legs.every(leg => leg.mode === 'WALK');
  const onlyBiking = legs.every(leg => leg.mode === 'BICYCLE');

  return (
    startNavigation &&
    !onlyWalking &&
    !onlyBiking &&
    !hasTaxiLegs({ legs }) &&
    !hasScooterLegs({ legs }) &&
    !hasAirplaneLegs({ legs }) &&
    !legs.some(isBikeRentalLeg) &&
    drivingDistance === 0
  );
}

export function getBoardingInformationFlags({
  legs,
  biking,
  driving,
  bikePublicItineraryCount,
  carPublicItineraryCount,
}) {
  const containsBiking = biking.duration > 0 && biking.distance > 0;
  const containsDriving = driving.duration > 0 && driving.distance > 0;

  return {
    showBikeBoardingInformation:
      containsBiking &&
      bikePublicItineraryCount > 0 &&
      !legs.some(isBikeParkLeg),
    showCarBoardingInformation: containsDriving && carPublicItineraryCount > 0,
  };
}
