import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const VehicleParkingMapContainer = ({ vehicleParking }) => {
  if (!vehicleParking) {
    return false;
  }
  return <StopPageMap stop={vehicleParking} />;
};

VehicleParkingMapContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

VehicleParkingMapContainer.propTypes = {
  vehicleParking: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

VehicleParkingMapContainer.defaultProps = {
  vehicleParking: undefined,
};

const containerComponent = createFragmentContainer(VehicleParkingMapContainer, {
  vehicleParking: graphql`
    fragment VehicleParkingMapContainer_vehicleParking on VehicleParking {
      lat
      lon
      name
      vehicleParkingId
    }
  `,
});

export {
  containerComponent as default,
  VehicleParkingMapContainer as Component,
};
