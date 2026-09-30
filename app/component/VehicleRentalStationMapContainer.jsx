import PropTypes from 'prop-types';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const VehicleRentalStationMapContainer = ({
  vehicleRentalStation: vehicleRentalStationRef,
}) => {
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
};

VehicleRentalStationMapContainer.propTypes = {
  vehicleRentalStation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

VehicleRentalStationMapContainer.defaultProps = {
  vehicleRentalStation: undefined,
};

export default VehicleRentalStationMapContainer;
