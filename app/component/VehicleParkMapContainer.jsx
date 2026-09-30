import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useMatch } from 'found';
import { parkShape } from '../../utils/client/shapes';
import StopPageMap from './map/StopPageMap';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../../utils/shared/path';

function VehicleParkMapContainer({ vehicleParking }) {
  const match = useMatch();
  if (!vehicleParking) {
    return false;
  }
  const type = match.location.pathname.includes(PREFIX_BIKEPARK)
    ? PREFIX_BIKEPARK
    : PREFIX_CARPARK;

  return <StopPageMap stop={vehicleParking} parkType={type} />;
}

VehicleParkMapContainer.propTypes = { vehicleParking: parkShape };

VehicleParkMapContainer.defaultProps = {
  vehicleParking: undefined,
};

const containerComponent = createFragmentContainer(VehicleParkMapContainer, {
  vehicleParking: graphql`
    fragment VehicleParkMapContainer_vehiclePark on VehicleParking {
      vehicleParkingId
      lat
      lon
      name
    }
  `,
});

export { containerComponent as default, VehicleParkMapContainer as Component };
