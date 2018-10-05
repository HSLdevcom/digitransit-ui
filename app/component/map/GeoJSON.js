import PropTypes from 'prop-types';
import React from 'react';
import L from 'leaflet';

import { isBrowser } from '../../util/browser';

let Geojson;

/* eslint-disable global-require */
if (isBrowser) {
  Geojson = require('react-leaflet/es/GeoJSON').default;
}
/* eslint-enable global-require */

const defaultLineStyle = {
  color: 'blue',
  weight: 3,
  opacity: 0.8,
};

const defaultMarkerStyle = {
  color: 'blue',
  fillColor: 'white',
  radius: 10,
  fillOpacity: 0.8,
};

const pointToLayer = (feature, latlng) => {
  // add some custom rendering control by feature props
  const props = feature.properties || {};
  let marker;

  if (props.textOnly) {
    marker = L.marker(latlng);
    marker.bindTooltip(props.name, {
      permanent: true,
      className: 'geoJsonText',
      direction: 'center',
      offset: [0, -25],
    });
  } else {
    marker = L.circleMarker(latlng, props.style || defaultMarkerStyle);
  }
  return marker;
};

const lineStyler = feature => feature.style || defaultLineStyle;

const GeoJSON = ({ data }) => (
  <Geojson data={data} style={lineStyler} pointToLayer={pointToLayer} />
);

GeoJSON.propTypes = { data: PropTypes.object.isRequired };

export default GeoJSON;
