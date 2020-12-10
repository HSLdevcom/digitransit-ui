import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { dtLocationShape } from '../../util/shapes';

const LocationMarkerWithPermanentTooltip = props => {
  if (props.position && props.text) {
    const address = props.text.split(', ');
    return (
      <Marker
        zIndexOffset={1000}
        position={props.position}
        icon={L.divIcon({
          iconSize: [0, 0],
        })}
        opacity={0.01}
        keyboard={false}
      >
        <Tooltip permanent direction="top" offset={L.point(0, -25)}>
          <div style={{ fontSize: 13, letterSpacing: -0.52, color: '#333333' }}>
            {address[0]}
          </div>
          <div style={{ fontSize: 11, letterSpacing: -0.44, color: '#666666' }}>
            {address[1]}
          </div>
        </Tooltip>
      </Marker>
    );
  }
  return <></>;
};

LocationMarkerWithPermanentTooltip.propTypes = {
  position: dtLocationShape,
  text: PropTypes.string,
};

export default LocationMarkerWithPermanentTooltip;
