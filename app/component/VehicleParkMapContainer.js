import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { configShape } from '../util/shapes';
import StopPageMap from './map/StopPageMap';

const BikeParkPageMapContainer = ({ bikePark }) => {
  if (!bikePark) {
    return false;
  }
  return <StopPageMap stop={bikePark} />;
};

BikeParkPageMapContainer.contextTypes = {
  config: configShape.isRequired,
};

BikeParkPageMapContainer.propTypes = {
  bikePark: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

BikeParkPageMapContainer.defaultProps = {
  bikePark: undefined,
};

const containerComponent = createFragmentContainer(BikeParkPageMapContainer, {
  bikePark: graphql`
    fragment VehicleParkMapContainer_vehiclePark on BikePark {
      lat
      lon
      name
      bikeParkId
    }
  `,
});

export { containerComponent as default, BikeParkPageMapContainer as Component };
