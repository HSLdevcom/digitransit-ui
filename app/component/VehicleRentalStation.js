import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../util/shapes';
import VehicleRentalAvailability from './VehicleRentalAvailability';
import Icon from './Icon';
import {
  getVehicleRentalStationNetworkIcon,
  getVehicleRentalStationNetworkConfig,
  getVehicleCapacity,
  BIKEAVL_UNKNOWN,
  BIKEAVL_WITHMAX,
} from '../util/vehicleRentalUtils';

const VehicleRentalStation = ({ vehicleRentalStation }, { config }) => {
  const vehicleCapacity = getVehicleCapacity(
    config,
    vehicleRentalStation.network,
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
      vehicleRentalStation.vehiclesAvailable +
        vehicleRentalStation.spacesAvailable;
    fewAvailableCount = Math.floor(totalSpaces / 3);
    fewerAvailableCount = Math.floor(totalSpaces / 6);
  }
  const disabled = !vehicleRentalStation.operative;
  const networkConfig = getVehicleRentalStationNetworkConfig(
    vehicleRentalStation.network,
    config,
  );
  const vehicleIcon = getVehicleRentalStationNetworkIcon(
    networkConfig,
    disabled,
  );
  return (
    <div className="citybike-content-container">
      <Icon img={vehicleIcon} />
      <VehicleRentalAvailability
        disabled={disabled}
        vehiclesAvailable={vehicleRentalStation.vehiclesAvailable}
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
  vehicleRentalStation: PropTypes.shape({
    vehiclesAvailable: PropTypes.number.isRequired,
    spacesAvailable: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    network: PropTypes.string,
    operative: PropTypes.bool.isRequired,
  }).isRequired,
};
export default VehicleRentalStation;
