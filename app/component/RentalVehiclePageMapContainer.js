import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const RentalVehiclePageMapContainer = ({ rentalVehicle }) => {
  if (!rentalVehicle) {
    return false;
  }
  return <StopPageMap stop={rentalVehicle} scooter />;
};

RentalVehiclePageMapContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

RentalVehiclePageMapContainer.propTypes = {
  rentalVehicle: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

RentalVehiclePageMapContainer.defaultProps = {
  rentalVehicle: undefined,
};

const containerComponent = createFragmentContainer(
  RentalVehiclePageMapContainer,
  {
    rentalVehicle: graphql`
      fragment RentalVehiclePageMapContainer_rentalVehicle on RentalVehicle {
        lat
        lon
        name
      }
    `,
  },
);

export {
  containerComponent as default,
  RentalVehiclePageMapContainer as Component,
};
