import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import { parkShape } from '../util/shapes';
import StopPageMap from './map/StopPageMap';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../util/path';

function VehicleParkMapContainer({ vehiclePark }, context) {
  if (!vehiclePark) {
    return false;
  }
  const type = context?.match.location.pathname.includes(PREFIX_BIKEPARK)
    ? PREFIX_BIKEPARK
    : PREFIX_CARPARK;

  return <StopPageMap stop={vehiclePark} parkType={type} />;
}

VehicleParkMapContainer.contextTypes = {
  match: matchShape.isRequired,
};

VehicleParkMapContainer.propTypes = { vehiclePark: parkShape };

VehicleParkMapContainer.defaultProps = {
  vehiclePark: undefined,
};

const containerComponent = createFragmentContainer(VehicleParkMapContainer, {
  vehiclePark: graphql`
    fragment VehicleParkMapContainer_vehiclePark on VehicleParking {
      vehicleParkingId
      lat
      lon
      name
    }
  `,
});

export { containerComponent as default, VehicleParkMapContainer as Component };
