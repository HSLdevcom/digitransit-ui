import React from 'react';
import { configShape, vehicleRentalStationShape } from '../util/shapes';
import VehicleRentalAvailability from './VehicleRentalAvailability';
import Icon from './Icon';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
  getVehicleCapacity,
  BIKEAVL_UNKNOWN,
  BIKEAVL_WITHMAX,
  getRentalNetworkIdByRental,
} from '../util/vehicleRentalUtils';

const VehicleRentalStation = ({ vehicleRentalStation }, { config }) => {
  const vehicleCapacity = getVehicleCapacity(
    config,
    getRentalNetworkIdByRental(vehicleRentalStation, config),
  );
  if (vehicleCapacity === BIKEAVL_UNKNOWN) {
    return null;
  }
  let totalSpaces;
  let fewAvailableCount;
  let fewerAvailableCount;

  if (vehicleCapacity === BIKEAVL_WITHMAX) {
    totalSpaces =
      vehicleRentalStation.capacity ||
      vehicleRentalStation.availableVehicles.total +
        vehicleRentalStation.availableSpaces.total;
    fewAvailableCount = Math.floor(totalSpaces / 3);
    fewerAvailableCount = Math.floor(totalSpaces / 6);
  }
  const disabled = !vehicleRentalStation.operative;
  const networkConfig = getRentalNetworkConfig(
    getRentalNetworkIdByRental(vehicleRentalStation, config),
    config,
  );
  const vehicleIcon = getRentalNetworkIcon(networkConfig, disabled);
  return (
    <div className="citybike-content-container">
      <Icon img={vehicleIcon} />
      <VehicleRentalAvailability
        disabled={disabled}
        vehiclesAvailable={vehicleRentalStation.availableVehicles.total}
        totalSpaces={totalSpaces}
        fewAvailableCount={fewAvailableCount}
        fewerAvailableCount={fewerAvailableCount}
        useSpacesAvailable={vehicleCapacity === BIKEAVL_WITHMAX}
        type={networkConfig.type}
      />
    </div>
  );
};

VehicleRentalStation.contextTypes = {
  config: configShape.isRequired,
};
VehicleRentalStation.propTypes = {
  vehicleRentalStation: vehicleRentalStationShape.isRequired,
};
export default VehicleRentalStation;
