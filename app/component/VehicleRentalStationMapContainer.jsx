import { graphql, useFragment } from 'react-relay';
import StopPageMap from './map/StopPageMap';
import { fragmentRefShape } from '../../utils/client/shapes';

export default function VehicleRentalStationMapContainer({
  vehicleRentalStation: vehicleRentalStationRef,
}) {
  const vehicleRentalStation = useFragment(
    graphql`
      fragment VehicleRentalStationMapContainer_vehicleRentalStation on VehicleRentalStation {
        lat
        lon
        name
      }
    `,
    vehicleRentalStationRef,
  );
  if (!vehicleRentalStation) {
    return false;
  }
  return <StopPageMap stop={vehicleRentalStation} citybike />;
}

VehicleRentalStationMapContainer.propTypes = { vehicleRentalStation: fragmentRefShape };
