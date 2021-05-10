import connectToStores from 'fluxible-addons-react/connectToStores';
import L from 'leaflet';
import PropTypes from 'prop-types';
import React from 'react';

import Card from '../Card';
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
import PopupHeader from './PopupHeader';

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
export const getRoundIcon = (zoom, iconId) => {
  const radius = getCaseRadius(zoom);
  const stopRadius = getStopRadius(zoom);
  const hubRadius = getHubRadius(zoom);

  const inner = (stopRadius + hubRadius) / 2;
  const stroke = stopRadius - hubRadius;

  let className = 'stop';

  if (iconId === 'bikeParkOpIcon' || iconId === 'bikeParkCovIcon') {
    className = 'bike-parking-dot-marker';
  }

  return L.divIcon({
    html: `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="stop-halo" cx="${radius}" cy="${radius}" r="${radius}"/>
        <circle class="${className}" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"/>
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
    iconAnchor: [(1 / 2) * iconSize, (1 / 2) * iconSize],
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

const PointFeatureMarker = ({
  feature,
  icons,
  language,
  locationPopup,
  onSelectLocation,
}) => {
  const { geometry, properties } = feature;
  if (!isPointTypeGeometry(geometry)) {
    return null;
  }

  const { icon } = properties;
  const header = getPropertyValueOrDefault(properties, 'name', language);

  const popupContent = getPropertyValueOrDefault(
    properties,
    'popupContent',
    language,
  );
  // use header as fallback, so address won't be undefined
  const address = getPropertyValueOrDefault(
    properties,
    'address',
    language,
    header,
  );

  const city = getPropertyValueOrDefault(properties, 'city', language);

  let description = null;
  // Only display address field as description if it is a real address + add city if exists.
  if (address !== header && city) {
    description = `${address}, ${city}`;
  } else if (address !== header) {
    description = address;
  } else if (city) {
    description = city;
  }

  const useDescriptionAsHeader = !header;

  const hasCustomIcon = icon && icon.id && icons[icon.id];
  const [lon, lat] = geometry.coordinates;

  return (
    <GenericMarker
      getIcon={zoom =>
        hasCustomIcon && isCustomIconVisible(zoom)
          ? getCustomIcon(zoom, icons[icon.id])
          : getRoundIcon(zoom, icon.id)
      }
      maxWidth={locationPopup === 'all' ? 320 : 250}
      position={{
        lat,
        lon,
      }}
      shouldRender={zoom =>
        isCustomIconVisible(zoom) || isRoundIconVisible(zoom)
      }
    >
      <Card>
        <PopupHeader
          header={useDescriptionAsHeader ? description : header}
          subHeader={useDescriptionAsHeader ? '' : description}
        />
        {popupContent && <div className="card-text">{popupContent}</div>}
        {(locationPopup === 'all' || locationPopup === 'origindestination') && (
          <MarkerPopupBottom
            location={{
              address,
              lat,
              lon,
            }}
            locationPopup={locationPopup}
            onSelectLocation={onSelectLocation}
          />
        )}
      </Card>
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
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
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
