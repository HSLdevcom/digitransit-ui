import PropTypes from 'prop-types';
import React from 'react';
import L from 'leaflet';

import Card from '../Card';
import CardHeader from '../CardHeader';
import GenericMarker from './GenericMarker';
import MarkerPopupBottom from './MarkerPopupBottom';
import { isBrowser } from '../../util/browser';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
} from '../../util/mapIconUtils';

let Geojson;

/* eslint-disable global-require */
if (isBrowser) {
  Geojson = require('react-leaflet/es/GeoJSON').default;
}
/* eslint-enable global-require */

/**
 * The minimum radius at which the default round icon is visible.
 */
const ROUND_ICON_MIN_RADIUS = 3;

/**
 * Checks if the default round icon is visible.
 *
 * @param {number} zoom the current zoom level.
 */
const isRoundIconVisible = zoom => getCaseRadius(zoom) >= ROUND_ICON_MIN_RADIUS;

/**
 * The minimum zoom level at which a custom icon is visible.
 */
const CUSTOM_ICON_MIN_ZOOM = 10;

/**
 * Checks if the custom icon is visible.
 *
 * @param {number} zoom the current zoom level.
 */
const isCustomIconVisible = zoom => zoom >= CUSTOM_ICON_MIN_ZOOM;

/**
 * Checks if the given geometry exists and has type 'Point'.
 *
 * @param {{ type: string }} geometry the geometry object to check.
 */
const isPointTypeGeometry = geometry => geometry && geometry.type === 'Point';

/**
 * Checks if the given geometry exists and has type 'MultiPoint'.
 *
 * @param {{ type: string }} geometry the geometry object to check.
 */
const isMultiPointTypeGeometry = geometry =>
  geometry && geometry.type === 'MultiPoint';

/**
 *
 * @param {number} zoom the current zoom level.
 */
const getRoundIcon = zoom => {
  const radius = getCaseRadius(zoom);
  const stopRadius = getStopRadius(zoom);
  const hubRadius = getHubRadius(zoom);

  const inner = (stopRadius + hubRadius) / 2;
  const stroke = stopRadius - hubRadius;

  return L.divIcon({
    html: `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="stop-halo" cx="${radius}" cy="${radius}" r="${radius}"/>
        <circle class="stop" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"/>
      </svg>
    `,
    iconSize: [radius * 2, radius * 2],
    className: `cursor-pointer`,
  });
};

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
      if (p && p.icon && p.icon.id && p.icon.data) {
        /*
          For data URI SVG support in Firefox & IE it's necessary to URI encode the string
          & replace the '#' character with '%23'. `encodeURI()` won't do this.
        */
        const url = `data:image/svg+xml;charset=utf-8,${encodeURI(
          p.icon.data,
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
        {data.features.map(feature => {
          const [lon, lat] = feature.geometry.coordinates;
          if (bounds) {
            const latLng = L.latLng({ lat, lng: lon });
            if (!bounds.contains(latLng)) {
              return null;
            }
          }

          const { address, icon, name } = feature.properties;
          const hasCustomIcon = icon && icon.id;
          return (
            <GenericMarker
              getIcon={zoom =>
                hasCustomIcon ? this.icons[icon.id] : getRoundIcon(zoom)
              }
              key={feature.id}
              position={{
                lat,
                lon,
              }}
              shouldRender={zoom =>
                hasCustomIcon
                  ? isCustomIconVisible(zoom)
                  : isRoundIconVisible(zoom)
              }
            >
              <Card>
                <div className="padding-small">
                  <CardHeader
                    className="padding-small"
                    description={address}
                    name={name}
                    unlinked
                  />
                </div>
              </Card>
              <MarkerPopupBottom
                location={{
                  address,
                  lat,
                  lon,
                }}
              />
            </GenericMarker>
          );
        })}
      </React.Fragment>
    );
  }
}

export default GeoJSON;
