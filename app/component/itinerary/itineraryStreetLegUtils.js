import {
  isTaxiLeg,
  isWalkOrBicycleWalkLeg,
} from '../../../utils/client/legUtils';

export function getItineraryStreetLegData({
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
    const mode =
      usingOwnBicycle && index < bikeParkedIndex ? 'bicycle_walk' : 'walk';
    const parkingIndicator =
      usingOwnBicycle && leg.to.vehicleParking ? 'bike' : undefined;

    return {
      ...streetLeg,
      mode,
      parkingIndicator,
    };
  }

  if ((leg.mode === 'CITYBIKE' || leg.mode === 'BICYCLE') && leg.rentedBike) {
    const networkId =
      leg.from.vehicleRentalStation?.rentalNetwork.networkId ||
      leg.from.rentalVehicle?.rentalNetwork.networkId;
    const network = networkId && config.vehicleRental?.networks?.[networkId];
    const rentalWarningEnabled =
      !!network?.timeBeforeSurcharge && !!network.durationInstructions;

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
    return {
      ...streetLeg,
      mode: 'taxi-external',
      icon: config.flex.taxiExternalIcon,
    };
  }

  if (leg.mode === 'BICYCLE' && renderBar) {
    return {
      ...streetLeg,
      parkingIndicator: leg.to.vehicleParking ? 'bike' : undefined,
    };
  }

  return null;
}
