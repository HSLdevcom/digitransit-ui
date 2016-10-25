import React from 'react';
import pure from 'recompose/pure';
import { FormattedMessage } from 'react-intl';

import Icon from '../icon/Icon';


const getLocationMessage = (geolocation) => {
  if (geolocation.hasLocation) {
    return <FormattedMessage id="own-position" defaultMessage="Your current location" />;
  }
  if (geolocation.isLocationingInProgress) {
    return (
      <FormattedMessage
        id="searching-position"
        defaultMessage="Searching for your position..."
      />);
  }
  return <FormattedMessage id="no-position" defaultMessage="No position" />;
};

const GeolocationBar = pure((props) => (
  <div className="geolocation input-placeholder" onClick={props.onClick}>
    <div className="geolocation-selected">
      <Icon img="icon-icon_position" />
      {getLocationMessage(props.geolocation)}
      <span className="close-icon right cursor-pointer">
        <Icon img="icon-icon_close" />
      </span>
    </div>
  </div>));

GeolocationBar.propTypes = {
  geolocation: React.PropTypes.object.isRequired,
  onClick: React.PropTypes.func.isRequired,
};

GeolocationBar.displayName = 'GeolocationBar';
export default GeolocationBar;
