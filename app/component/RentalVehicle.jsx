import React from 'react';
import Icon from './Icon';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
} from '../../utils/shared/vehicleRentalUtils';
import { rentalVehicleShape } from '../../utils/client/shapes';
import { useConfigContext } from '../client/ConfigContext';

const RentalVehicle = ({ rentalVehicle }) => {
  const config = useConfigContext();
  const vehicleIcon = getRentalNetworkIcon(
    getRentalNetworkConfig(rentalVehicle.rentalNetwork.networkId, config),
  );
  return (
    <div className="scooter-content-container">
      <Icon img={vehicleIcon} />
    </div>
  );
};

RentalVehicle.propTypes = {
  rentalVehicle: rentalVehicleShape.isRequired,
};
export default RentalVehicle;
