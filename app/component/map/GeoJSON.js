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

const pointToLayer = (feature, latlng) => L.circleMarker(latlng, null);

const lineStyler = config => feature =>
  feature.style || {
    color: config.colors.primary,
    weight: 3,
    opacity: 0.6,
    radius: 3,
  };

const GeoJSON = ({ data }, { config }) => (
  <Geojson data={data} style={lineStyler(config)} pointToLayer={pointToLayer} />
);

GeoJSON.propTypes = { data: PropTypes.object.isRequired };
GeoJSON.contextTypes = { config: PropTypes.object.isRequired };

export default GeoJSON;
