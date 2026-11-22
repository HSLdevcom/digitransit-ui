import Icon from './Icon';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
} from '../../shared/utils/vehicleRentalUtils';
import { rentalVehicleShape } from '../utils/shapes';
import { useConfigContext } from '../hooks/ConfigContext';

export default function RentalVehicle({ rentalVehicle }) {
  const config = useConfigContext();
  const vehicleIcon = getRentalNetworkIcon(
    getRentalNetworkConfig(rentalVehicle.rentalNetwork.networkId, config),
  );
  return (
    <div className="scooter-content-container">
      <Icon img={vehicleIcon} />
    </div>
  );
}

RentalVehicle.propTypes = { rentalVehicle: rentalVehicleShape.isRequired };
