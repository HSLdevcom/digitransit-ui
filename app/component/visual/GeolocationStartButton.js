import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';

const GeolocationStartButton = ({ onClick }) => (
  <div
    role="button"
    className="geolocation-start-button"
    tabIndex={0}
    onClick={onClick}
  >
    <Icon img="icon-icon_position" className="geolocation-start-button-icon" />
    <FormattedMessage id="geolocate-yourself" defaultMessage="Geolocate" />
  </div>
);

GeolocationStartButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default GeolocationStartButton;
