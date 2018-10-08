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

const GeoJsonIcon = L.Icon.extend({
  options: {
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  },
});

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
  } else if (props.icon) {
    /*
    For data URI SVG support in Firefox & IE it's necessary to URI encode the string
    & replace the '#' character with '%23'. `encodeURI()` won't do this.
    */
    const url = encodeURI(`data:image/svg+xml, ${props.icon.data}`).replace(
      '#',
      '%23',
    );
    const icon = new GeoJsonIcon({ iconUrl: url });
    marker = L.marker(latlng, { icon });
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
