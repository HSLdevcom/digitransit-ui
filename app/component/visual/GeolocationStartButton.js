import PropTypes from 'prop-types';
import React from 'react';

/**
 * TODO make this appear like it should
*/
const GeolocationStartButton = ({ onClick }) => (
  <a
    style={{
      position: 'absolute',
      display: 'inline-block',
      right: '8px',
      top: '8px',
    }}
    onClick={onClick}
  >
    Geolocate!
  </a>
);

GeolocationStartButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GeolocationStartButton;
