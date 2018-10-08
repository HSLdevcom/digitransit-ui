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
    marker = L.circleMarker(latlng);
  }
  if (props.popupContent) {
    marker.bindPopup(props.popupContent, { className: 'geoJsonPopup' });
  }
  return marker;
};

const styler = config => {
  const defaultLineStyle = {
    color: config.colors.primary,
    weight: 3,
    opacity: 0.8,
  };
  const defaultMarkerStyle = {
    color: config.colors.primary,
    fillColor: 'white',
    radius: 6,
    opacity: 1,
    fillOpacity: 1,
    weight: 2,
  };

  return feature => {
    if (feature.geometry && feature.geometry.type === 'Point') {
      return feature.style
        ? { ...defaultMarkerStyle, ...feature.style }
        : defaultMarkerStyle;
    }
    return feature.style
      ? { ...defaultLineStyle, ...feature.style }
      : defaultLineStyle;
  };
};

const GeoJSON = ({ data }, { config }) => (
  <Geojson data={data} style={styler(config)} pointToLayer={pointToLayer} />
);

GeoJSON.propTypes = { data: PropTypes.object.isRequired };
GeoJSON.contextTypes = { config: PropTypes.object.isRequired };

export default GeoJSON;
