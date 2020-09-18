import connectToStores from 'fluxible-addons-react/connectToStores';
import L from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';

import Card from '../Card';
import CardHeader from '../CardHeader';
import GenericMarker from './GenericMarker';
import MarkerPopupBottom from './MarkerPopupBottom';
import PreferencesStore from '../../store/PreferencesStore';
import { isPointTypeGeometry } from '../../util/geo-utils';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
  getMapIconScale,
} from '../../util/mapIconUtils';

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
export const CUSTOM_ICON_MIN_ZOOM = 15;

/**
 * The custom icon's width and height (before scaling).
 */
export const CUSTOM_ICON_SIZE = 20;

/**
 * Checks if the custom icon is visible.
 *
 * @param {number} zoom the current zoom level.
 */
const isCustomIconVisible = zoom => zoom >= CUSTOM_ICON_MIN_ZOOM;

/**
 * Generates a generic round icon at the given zoom level.
 *
 * @param {number} zoom the current zoom level.
 */
export const getRoundIcon = zoom => {
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

/**
 * Generates a custom icon at the given zoom level.
 *
 * @param {number} zoom the current zoom level.
 * @param {string} iconUrl the url-encoded svg for the icon.
 */
export const getCustomIcon = (zoom, iconUrl) => {
  const iconSize = CUSTOM_ICON_SIZE * getMapIconScale(zoom);
  return L.icon({
    iconAnchor: [1 / 2 * iconSize, 1 / 2 * iconSize],
    iconSize: [iconSize, iconSize],
    iconUrl,
  });
};

/**
 * Retrieves the value of the property for the given language. Falls back
 * to the non-language specific property and the given default value,
 * respectively.
 *
 * @param {*} properties the object to look into.
 * @param {*} propertyName the name of the property.
 * @param {*} language the language.
 * @param {*} defaultValue the default fallback value, defaults to undefined.
 */
export const getPropertyValueOrDefault = (
  properties,
  propertyName,
  language,
  defaultValue = undefined,
) =>
  (properties &&
    propertyName &&
    ((language && properties[`${propertyName}_${language}`]) ||
      properties[propertyName])) ||
  defaultValue;

const PointFeatureMarker = ({ feature, icons, language }) => {
  const { geometry, properties } = feature;
  if (!isPointTypeGeometry(geometry)) {
    return null;
  }

  const { icon } = properties;
  const header = getPropertyValueOrDefault(properties, 'name', language);
  const address = getPropertyValueOrDefault(properties, 'address', language);
  const city = getPropertyValueOrDefault(properties, 'city', language);
  const description = city ? `${address}, ${city}` : address;
  const useDescriptionAsHeader = !header;

  const hasCustomIcon = icon && icon.id && icons[icon.id];
  const [lon, lat] = geometry.coordinates;

  return (
    <GenericMarker
      getIcon={zoom =>
        hasCustomIcon && isCustomIconVisible(zoom)
          ? getCustomIcon(zoom, icons[icon.id])
          : getRoundIcon(zoom)
      }
      position={{
        lat,
        lon,
      }}
      shouldRender={zoom =>
        isCustomIconVisible(zoom) || isRoundIconVisible(zoom)
      }
    >
      <Card>
        <div className="padding-small">
          <CardHeader
            className="padding-small"
            description={useDescriptionAsHeader ? '' : description}
            name={useDescriptionAsHeader ? description : header}
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
};

PointFeatureMarker.propTypes = {
  feature: PropTypes.shape({
    geometry: PropTypes.shape({
      coordinates: PropTypes.array.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    properties: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string,
      icon: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  icons: PropTypes.object,
  language: PropTypes.string.isRequired,
};

PointFeatureMarker.defaultProps = {
  icons: {},
};

const connectedComponent = connectToStores(
  PointFeatureMarker,
  [PreferencesStore],
  ({ getStore }) => ({
    language: getStore(PreferencesStore).getLanguage(),
  }),
);

export { connectedComponent as default, PointFeatureMarker as Component };
