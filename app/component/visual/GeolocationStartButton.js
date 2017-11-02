import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SVGIcon from './SVGIcon';

const GeolocationStartButton = ({ onClick }) => (
  <button className="geolocation-start-button" tabIndex={0} onClick={onClick}>
    <SVGIcon
      img="icon-icon_position"
      className="geolocation-start-button-icon"
    />
    <FormattedMessage id="geolocate-yourself" defaultMessage="Geolocate" />
  </button>
);

GeolocationStartButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GeolocationStartButton;
