import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { dtLocationShape } from '../../util/shapes';

const PolygonWithText = props => {
  if (props.position && props.text) {
    return (
      <Marker
        position={props.position}
        icon={L.divIcon({
          html: `<span style="width:100px;height:50px;border:1px solid #000; background-color: #D3D3D3; white-space: nowrap; padding: 5px;">${
            props.text
          }</span>`,
          className: 'popup',
          iconSize: [0, 0],
          iconAnchor: [50, -15],
        })}
      />
    );
  }
  return <></>;
};

PolygonWithText.propTypes = {
  position: dtLocationShape,
  text: PropTypes.string,
};

export default PolygonWithText;
