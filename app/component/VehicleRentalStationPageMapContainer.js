import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { configShape } from '../util/shapes';
import StopPageMap from './map/StopPageMap';

const VehicleRentalStationPageMapContainer = ({ vehicleRentalStation }) => {
  if (!vehicleRentalStation) {
    return false;
  }
  return <StopPageMap stop={vehicleRentalStation} citybike />;
};

VehicleRentalStationPageMapContainer.contextTypes = {
  config: configShape.isRequired,
};

VehicleRentalStationPageMapContainer.propTypes = {
  vehicleRentalStation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

VehicleRentalStationPageMapContainer.defaultProps = {
  vehicleRentalStation: undefined,
};

const containerComponent = createFragmentContainer(
  VehicleRentalStationPageMapContainer,
  {
    vehicleRentalStation: graphql`
      fragment VehicleRentalStationPageMapContainer_vehicleRentalStation on VehicleRentalStation {
        lat
        lon
        name
      }
    `,
  },
);

export {
  containerComponent as default,
  VehicleRentalStationPageMapContainer as Component,
};
