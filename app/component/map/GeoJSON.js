import L from 'leaflet';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { default as Geojson } from 'react-leaflet/es/GeoJSON';
import PointFeatureMarker from './PointFeatureMarker';
import { geoJsonFeatureShape, configShape } from '../../util/shapes';
import {
  isMultiPointTypeGeometry,
  isPointTypeGeometry,
} from '../../util/geo-utils';

/**
 * Extracts svg-formatted icon data from the given features' properties.
 *
 * @param {*[]} features the geojson features.
 */
const getIcons = features => {
  if (!Array.isArray(features) || features.length === 0) {
    return {};
  }

  return features
    .filter(
      feature => feature.properties?.icon?.id && feature.properties.icon.svg,
    )
    .map(feature => feature.properties.icon)
    .reduce((icons, icon) => {
      /*
        For data URI SVG support in Firefox & IE it's necessary to URI encode the string
        & replace the '#' character with '%23'. `encodeURI()` won't do this.
      */
      const url = `data:image/svg+xml;charset=utf-8,${encodeURI(
        icon.svg,
      ).replace(/#/g, '%23')}`;
      icons[icon.id] = url; // eslint-disable-line no-param-reassign
      return icons;
    }, {});
};

/**
 * Generates a suitable leaflet marker with a tooltip and a popup attached (if applicable)
 * for the given feature.
 *
 * @param {*} feature the feature currently being manipulated.
 * @param {*} latlng the coordinates for the current feature.
 * @param {*} icons the custom icons collection, if available.
 */
const getMarker = (feature, latlng, icons = {}) => {
  const properties = feature.properties || {};
  const interactive = !!properties.popupContent;
  let marker;

  if (properties.icon) {
    marker = L.marker(latlng, {
      icon: new L.Icon({
        iconUrl: icons[properties.icon.id],
        className: 'icon-zone',
      }),
      interactive,
      keyboard: false,
    });
  } else if (properties.textOnly) {
    marker = L.circleMarker(latlng, {
      interactive,
      keyboard: false,
    });
    marker.bindTooltip(properties.textOnly, {
      className: 'geoJsonText',
      direction: 'center',
      offset: [0, 0],
      permanent: true,
    });
  } else {
    marker = L.circleMarker(latlng, { interactive, keyboard: false });
  }

  return marker;
};

const addPopup = (feature, layer) => {
  if (feature.properties?.popupContent) {
    layer.bindPopup(feature.properties.popupContent, {
      className: 'geoJsonPopup',
    });
  }
};

const lineArray = [
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.55, 0.61, 0.69, 0.78, 0.89, 1.02, 1.17, 1.36,
  1.58, 1.85, 2.17, 2.56, 3.02, 3.57, 4.24, 5.04, 6,
];

const haloArray = [
  2, 2, 2, 2, 2, 2, 2.74, 3.62, 4.68, 5.95, 7.48, 9.31, 11.51, 14.05, 17.31,
  21.11, 25.67, 31.14, 37.71, 45.59, 55.04, 66.39, 80,
];

function GeoJSON({ bounds, data, geoJsonZoomLevel, ...rest }, { config }) {
  const { colors, geoJsonSvgSize, language } = config;
  // cache dynamic icons to allow references by id without data duplication
  const icons = useRef(getIcons(data?.features));

  // add some custom rendering control by feature props
  const pointToLayer = (feature, latlng) =>
    getMarker(feature, latlng, icons.current);

  const styler = feature => {
    const defaultLineStyle = {
      className: 'cursor-grab',
      color: colors.primary,
      weight: 3,
      opacity: 0.8,
    };

    const defaultMarkerStyle = {
      color: colors.primary,
      fillColor: 'white',
      radius: 6,
      opacity: 1,
      fillOpacity: 1,
      weight: 2,
    };

    const textMarkerStyle = {
      color: colors.primary,
      radius: 0,
      opacity: 0,
      fillOpacity: 0,
      weight: 0,
    };

    const { geometry } = feature;
    if (isPointTypeGeometry(geometry) || isMultiPointTypeGeometry(geometry)) {
      if (feature.properties?.textOnly) {
        return feature.style
          ? { ...textMarkerStyle, ...feature.style }
          : textMarkerStyle;
      }
      return feature.style
        ? { ...defaultMarkerStyle, ...feature.style }
        : defaultMarkerStyle;
    }

    if (
      feature.style &&
      (geometry.type === 'MultiLineString' || geometry.type === 'LineString')
    ) {
      const index = geoJsonZoomLevel;
      const newStyle = {
        ...feature.style,
        weight:
          feature.style.type === 'halo' ? haloArray[index] : lineArray[index],
      };
      return { ...defaultLineStyle, ...newStyle };
    }

    return feature.style
      ? { ...defaultLineStyle, ...feature.style }
      : defaultLineStyle;
  };

  if (!icons.current || !data?.features) {
    return null;
  }

  const hasOnlyPointGeometries = data.features.every(feature =>
    isPointTypeGeometry(feature.geometry),
  );
  if (!hasOnlyPointGeometries) {
    return (
      <Geojson
        data={data}
        pointToLayer={pointToLayer}
        style={styler}
        onEachFeature={addPopup}
      />
    );
  }

  return (
    <React.Fragment>
      {data.features.map((feature, index) => (
        <PointFeatureMarker
          feature={feature}
          icons={icons.current}
          // use index as a fall back key
          // eslint-disable-next-line react/no-array-index-key
          key={String(feature.id) + index}
          size={geoJsonSvgSize}
          language={language}
          {...rest}
        />
      ))}
    </React.Fragment>
  );
}

GeoJSON.propTypes = {
  bounds: PropTypes.shape({ contains: PropTypes.func.isRequired }),
  data: PropTypes.shape({
    features: PropTypes.arrayOf(geoJsonFeatureShape),
  }).isRequired,
  geoJsonZoomLevel: PropTypes.number,
};

GeoJSON.defaultProps = {
  bounds: undefined,
  geoJsonZoomLevel: 0,
};

GeoJSON.contextTypes = {
  config: configShape.isRequired,
};

export { GeoJSON as default, getIcons, getMarker };
