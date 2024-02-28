import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import {
  getVehicleRentalStationNetworkIcon,
  getVehicleRentalStationNetworkConfig,
} from '../util/vehicleRentalUtils';

const RentalVehicle = ({ rentalVehicle }, { config }) => {
  const disabled = !rentalVehicle.operative;

  const vehicleIcon = getVehicleRentalStationNetworkIcon(
    getVehicleRentalStationNetworkConfig(rentalVehicle.network, config),
    disabled,
  );
  return (
    <div className="scooter-content-container">
      <Icon img={vehicleIcon} />
    </div>
  );
};

RentalVehicle.contextTypes = {
  config: PropTypes.object.isRequired,
};
RentalVehicle.propTypes = {
  rentalVehicle: PropTypes.shape({
    vehiclesAvailable: PropTypes.number.isRequired,
    spacesAvailable: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    network: PropTypes.string,
    operative: PropTypes.bool.isRequired,
  }).isRequired,
};
export default RentalVehicle;
