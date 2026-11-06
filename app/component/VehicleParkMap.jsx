import { graphql, useFragment } from 'react-relay';
import { useMatch } from 'found';
import { fragmentRefShape } from '../../utils/client/shapes';
import StopPageMap from './map/StopPageMap';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../../utils/shared/path';

export default function VehicleParkMap({ vehicleParking: vehicleParkingRef }) {
  const match = useMatch();
  const vehicleParking = useFragment(
    graphql`
      fragment VehicleParkMap_vehiclePark on VehicleParking {
        vehicleParkingId
        lat
        lon
        name
      }
    `,
    vehicleParkingRef,
  );
  if (!vehicleParking) {
    return false;
  }
  const type = match.location.pathname.includes(PREFIX_BIKEPARK)
    ? PREFIX_BIKEPARK
    : PREFIX_CARPARK;

  return <StopPageMap stop={vehicleParking} parkType={type} />;
}

VehicleParkMap.propTypes = { vehicleParking: fragmentRefShape };
