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

class GeoJSON extends React.Component {
  static propTypes = { data: PropTypes.object.isRequired };
  static contextTypes = { config: PropTypes.object.isRequired };

  // cache dynamic icons to allow references by id without data duplication
  componentWillMount() {
    // cache dynamic icons in advance to allow references by id without data duplication
    const icons = {};

    this.props.data.features.forEach(feature => {
      const p = feature.properties;
      if (p && p.icon && p.icon.id && p.icon.data) {
        /*
          For data URI SVG support in Firefox & IE it's necessary to URI encode the string
          & replace the '#' character with '%23'. `encodeURI()` won't do this.
        */
        const url = encodeURI(`data:image/svg+xml, ${p.icon.data}`).replace(
          '#',
          '%23',
        );
        icons[p.icon.id] = new GeoJsonIcon({ iconUrl: url });
      }
    });
    this.icons = icons;
  }

  pointToLayer = (feature, latlng) => {
    // add some custom rendering control by feature props
    const props = feature.properties || {};
    let marker;

    if (props.textOnly) {
      marker = L.circleMarker(latlng);
      marker.bindTooltip(props.name, {
        permanent: true,
        className: 'geoJsonText',
        direction: 'center',
        offset: [0, 0],
      });
    } else if (props.icon) {
      marker = L.marker(latlng, { icon: this.icons[props.icon.id] });
    } else {
      marker = L.circleMarker(latlng);
    }
    if (props.popupContent) {
      marker.bindPopup(props.popupContent, { className: 'geoJsonPopup' });
    }
    return marker;
  };

  styler = feature => {
    const defaultLineStyle = {
      color: this.context.config.colors.primary,
      weight: 3,
      opacity: 0.8,
    };
    const defaultMarkerStyle = {
      color: this.context.config.colors.primary,
      fillColor: 'white',
      radius: 6,
      opacity: 1,
      fillOpacity: 1,
      weight: 2,
    };
    const textMarkerStyle = {
      color: this.context.config.colors.primary,
      radius: 0,
      opacity: 0,
      fillOpacity: 0,
      weight: 0,
    };

    if (feature.geometry && feature.geometry.type === 'Point') {
      if (feature.properties && feature.properties.textOnly) {
        return feature.style
          ? { ...textMarkerStyle, ...feature.style }
          : textMarkerStyle;
      }
      return feature.style
        ? { ...defaultMarkerStyle, ...feature.style }
        : defaultMarkerStyle;
    }
    return feature.style
      ? { ...defaultLineStyle, ...feature.style }
      : defaultLineStyle;
  };

  render() {
    return (
      <Geojson
        data={this.props.data}
        style={this.styler}
        pointToLayer={this.pointToLayer}
      />
    );
  }
}

export default GeoJSON;
