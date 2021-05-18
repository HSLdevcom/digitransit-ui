import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const BikeRentalStationPageMapContainer = ({ bikeRentalStation }) => {
  if (!bikeRentalStation) {
    return false;
  }
  return <StopPageMap stop={bikeRentalStation} />;
};

BikeRentalStationPageMapContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

BikeRentalStationPageMapContainer.propTypes = {
  bikeRentalStation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

BikeRentalStationPageMapContainer.defaultProps = {
  bikeRentalStation: undefined,
};

const containerComponent = createFragmentContainer(
  BikeRentalStationPageMapContainer,
  {
    bikeRentalStation: graphql`
      fragment BikeRentalStationPageMapContainer_bikeRentalStation on BikeRentalStation {
        lat
        lon
        name
      }
    `,
  },
);

export {
  containerComponent as default,
  BikeRentalStationPageMapContainer as Component,
};
