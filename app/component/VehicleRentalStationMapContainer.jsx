import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const VehicleRentalStationMapContainer = ({ vehicleRentalStation }) => {
  if (!vehicleRentalStation) {
    return false;
  }
  return <StopPageMap stop={vehicleRentalStation} citybike />;
};

VehicleRentalStationMapContainer.propTypes = {
  vehicleRentalStation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

const containerComponent = createFragmentContainer(
  VehicleRentalStationMapContainer,
  {
    vehicleRentalStation: graphql`
      fragment VehicleRentalStationMapContainer_vehicleRentalStation on VehicleRentalStation {
        lat
        lon
        name
      }
    `,
  },
);

export {
  containerComponent as default,
  VehicleRentalStationMapContainer as Component,
};
