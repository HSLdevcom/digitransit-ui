import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageMap from './map/StopPageMap';

const CarParkPageMapContainer = ({ carPark }) => {
  if (!carPark) {
    return false;
  }
  return <StopPageMap stop={carPark} />;
};

CarParkPageMapContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

CarParkPageMapContainer.propTypes = {
  carPark: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
};

CarParkPageMapContainer.defaultProps = {
  carPark: undefined,
};

const containerComponent = createFragmentContainer(CarParkPageMapContainer, {
  carPark: graphql`
    fragment CarParkMapContainer_carPark on CarPark {
      lat
      lon
      name
      carParkId
    }
  `,
});

export { containerComponent as default, CarParkPageMapContainer as Component };
