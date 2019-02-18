import L from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';

import PointFeatureMarker from './PointFeatureMarker';
import { isBrowser } from '../../util/browser';
import {
  isMultiPointTypeGeometry,
  isPointTypeGeometry,
} from '../../util/geo-utils';

let Geojson;

/* eslint-disable global-require */
if (isBrowser) {
  Geojson = require('react-leaflet/es/GeoJSON').default;
}
/* eslint-enable global-require */

class GeoJSON extends React.Component {
  static propTypes = {
    bounds: PropTypes.object,
    data: PropTypes.object.isRequired,
  };

  static defaultProps = {
    bounds: undefined,
  };

  static contextTypes = { config: PropTypes.object.isRequired };

  // cache dynamic icons to allow references by id without data duplication
  componentWillMount() {
    const GeoJsonIcon = L.Icon.extend({
      options: {
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      },
    });
    const icons = {};
    const { data } = this.props;
    data.features.forEach(feature => {
      const p = feature.properties;
      if (p && p.icon && p.icon.id && p.icon.svg) {
        /*
          For data URI SVG support in Firefox & IE it's necessary to URI encode the string
          & replace the '#' character with '%23'. `encodeURI()` won't do this.
        */
        const url = `data:image/svg+xml;charset=utf-8,${encodeURI(
          p.icon.svg,
        ).replace(/#/g, '%23')}`;
        icons[p.icon.id] = new GeoJsonIcon({ iconUrl: url });
      }
    });
    this.icons = icons;
  }

  pointToLayer = (feature, latlng) => {
    // add some custom rendering control by feature props
    const props = feature.properties || {};
    const interactive = !!props.popupContent;
    let marker;

    if (props.textOnly) {
      marker = L.circleMarker(latlng, {
        interactive,
      });
      marker.bindTooltip(props.name, {
        className: 'geoJsonText',
        direction: 'center',
        offset: [0, 0],
        permanent: true,
      });
    } else if (props.icon) {
      marker = L.marker(latlng, {
        icon: this.icons[props.icon.id],
        interactive,
      });
    } else {
      marker = L.circleMarker(latlng, { interactive });
    }
    if (props.popupContent) {
      marker.bindPopup(props.popupContent, {
        className: 'geoJsonPopup',
      });
    }
    return marker;
  };

  styler = feature => {
    const { config } = this.context;
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
    const textMarkerStyle = {
      color: config.colors.primary,
      radius: 0,
      opacity: 0,
      fillOpacity: 0,
      weight: 0,
    };

    const { geometry } = feature;
    if (isPointTypeGeometry(geometry) || isMultiPointTypeGeometry(geometry)) {
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
    const { bounds, data } = this.props;
    const hasOnlyPointGeometries = data.features.every(feature =>
      isPointTypeGeometry(feature.geometry),
    );

    if (!hasOnlyPointGeometries) {
      return (
        <Geojson
          data={data}
          pointToLayer={this.pointToLayer}
          style={this.styler}
        />
      );
    }

    return (
      <React.Fragment>
        {data.features
          .filter(feature => {
            const [lon, lat] = feature.geometry.coordinates;
            if (bounds) {
              const latLng = L.latLng({ lat, lng: lon });
              if (!bounds.contains(latLng)) {
                return false;
              }
            }
            return true;
          })
          .map(feature => (
            <PointFeatureMarker
              feature={feature}
              icons={this.icons}
              key={feature.id}
            />
          ))}
      </React.Fragment>
    );
  }
}

export { GeoJSON as default };
