import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import pure from 'recompose/pure';
import { intlShape } from 'react-intl';

import OriginPopup from './OriginPopup';
import Icon from '../Icon';

const isBrowser = typeof window !== 'undefined' && window !== null;

let Marker;
let L;

let timeoutId = null;
const ANIMATION_TIME = 5000;

const toggleAnimation = (el) => {
  if (el == null) {
    clearTimeout(timeoutId);
    timeoutId = null;
    Array.from(document.getElementById('icon-icon_mapMarker-location-animated').children).forEach(
      circle => circle.setAttribute('class', 'paused')
    );
  } else {
    timeoutId = setTimeout(toggleAnimation, ANIMATION_TIME);
    Array.from(document.getElementById('icon-icon_mapMarker-location-animated').children).forEach(
      circle => circle.setAttribute('class', '')
    );
  }
};

/* eslint-disable global-require */
if (isBrowser) {
  Marker = require('react-leaflet/lib/Marker').default;
  L = require('leaflet');
}
/* eslint-enable global-require */

const currentLocationIcon = isBrowser ? L.divIcon({
  html: Icon.asString('icon-icon_mapMarker-location-animated'),
  className: 'current-location-marker',
  iconSize: [40, 40],
}) : null;

function PositionMarker({ coordinates, useCurrentPosition, displayOriginPopup }, { intl }) {
  let popup;

  if (!coordinates) {
    return null;
  }

  if (displayOriginPopup) {
    popup = (
      <OriginPopup
        ref={toggleAnimation}
        shouldOpen={useCurrentPosition}
        header={intl.formatMessage({ id: 'origin', defaultMessage: 'From' })}
        text={intl.formatMessage({ id: 'own-position', defaultMessage: 'Your current position' })}
        yOffset={20}
      />
    );
  }

  return (
    <Marker
      zIndexOffset={5}
      position={coordinates}
      icon={currentLocationIcon}
    >
      {popup}
    </Marker>
  );
}

PositionMarker.contextTypes = {
  intl: intlShape.isRequired,
};

PositionMarker.propTypes = {
  coordinates: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.number),
    React.PropTypes.oneOf([false]),
  ]),
  displayOriginPopup: React.PropTypes.bool,
  useCurrentPosition: React.PropTypes.bool.isRequired,
};

export default connectToStores(
  pure(PositionMarker),
  ['PositionStore', 'EndpointStore'],
  (context) => {
    const coordinates = context.getStore('PositionStore').getLocationState();

    return {
      useCurrentPosition: context.getStore('EndpointStore').getOrigin().useCurrentPosition,
      coordinates: coordinates.hasLocation ? [coordinates.lat, coordinates.lon] : false,
    };
  });
