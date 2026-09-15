import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import get from 'lodash/get';
import { useRouter } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { useIntl } from 'react-intl';
import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import LocationMarker from './LocationMarker';
import MapWithTracking from './MapWithTracking';
import { otpToLocation } from '../../../utils/shared/otpStrings';
import { getJson } from '../../../utils/shared/xhrPromise';
import { mapLayerShape } from '../../store/MapLayerStore';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import LocationMarkerWithPermanentTooltip from './LocationMarkerWithPermanentTooltip';
import ConfirmLocationFromMapButton from './ConfirmLocationFromMapButton';
import { useConfigContext } from '../../client/ConfigContext';

const DESKTOP_BREAKPOINT = 'large';

const markLocation = (markerType, position) => {
  let type;
  if (markerType === 'origin') {
    type = 'from';
  } else if (markerType === 'destination') {
    type = 'to';
  } else {
    type = markerType;
  }
  if (position) {
    let newPosition;
    if (decodeURIComponent(position).indexOf('::') !== -1) {
      newPosition = otpToLocation(decodeURIComponent(position));
    } else {
      newPosition = position;
    }
    return <LocationMarker key="location" position={newPosition} type={type} />;
  }
  return null;
};

function SelectFromMap({
  breakpoint = undefined,
  language,
  type,
  onConfirm,
  mapLayers,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const { match } = useRouter();
  const map = useRef(null);
  const [mapCenter, setMapCenter] = useState(undefined);

  const setMapElementRef = element => {
    map.current = get(element, 'leafletElement', null);
  };

  const setAddress = (lat, lon) => {
    const searchParams = {
      'point.lat': lat,
      'point.lon': lon,
      'boundary.circle.radius': 0.1, // 100m
      lang: language,
      size: 1,
      layers: 'address',
      zones: 1,
    };
    if (config.searchParams['boundary.country']) {
      searchParams['boundary.country'] =
        config.searchParams['boundary.country'];
    }

    getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams).then(
      data => {
        if (data.features != null && data.features.length > 0) {
          const { properties } = data.features[0];
          setMapCenter(prevMapCenter => ({
            ...prevMapCenter,
            address: getLabel(properties),
            lat,
            lon,
            onlyCoordinates: false,
          }));
        } else {
          setMapCenter(prevMapCenter => ({
            ...prevMapCenter,
            address: intl.formatMessage({
              id: 'location-from-map',
              defaultMessage: 'Selected location',
            }),
            lat,
            lon,
            onlyCoordinates: true,
          }));
        }
      },
      () => {
        setMapCenter({
          address: intl.formatMessage({
            id: 'location-from-map',
            defaultMessage: 'Selected location',
          }),
          lat,
          lon,
          onlyCoordinates: true,
        });
      },
    );
  };

  const onClick = e => {
    const clickedDiv = e.originalEvent.target;
    if (clickedDiv.tagName === 'BUTTON') {
      return;
    }

    setMapCenter({
      address: '',
      lat: e.latlng.lat,
      lon: e.latlng.lng,
    });

    setAddress(e.latlng.lat, e.latlng.lng);
  };

  const setMapLocation = () => {
    if (!map.current) {
      return;
    }
    const centerOfMap = map.current.getCenter();

    if (
      mapCenter &&
      mapCenter.lat === centerOfMap.lat &&
      mapCenter.lon === centerOfMap.lng
    ) {
      return;
    }

    setAddress(centerOfMap.lat, centerOfMap.lng);
  };

  const createAddress = (address, position) => {
    if (address !== '') {
      const newAddress = address.split(', ');
      let strippedAddress = newAddress[0];
      if (!mapCenter.onlyCoordinates) {
        strippedAddress = `${strippedAddress}, ${newAddress[1]}`;
      }
      strippedAddress = `${strippedAddress}::${JSON.stringify(
        position.lat,
      )},${JSON.stringify(position.lon)}`;
      return strippedAddress;
    }
    return '';
  };

  const confirmButton = (isEnabled, center, positionSelectingFromMap) => (
    <ConfirmLocationFromMapButton
      key="confirmButton"
      isEnabled={!!isEnabled}
      address={
        isEnabled
          ? createAddress(center.address, positionSelectingFromMap)
          : undefined
      }
      title={intl.formatMessage({
        id: 'location-from-map-confirm',
        defaultMessage: 'Confirm selection',
      })}
      type={type}
      onConfirm={onConfirm}
      color={config.colors.primary}
      hoverColor={config.colors.hover}
    />
  );

  const defaultLocation = config.defaultEndpoint;
  const isDesktop = breakpoint === DESKTOP_BREAKPOINT;

  const leafletObjs = [];

  if (!mapCenter && type === 'origin' && !isDesktop) {
    leafletObjs.push(
      <LocationMarker
        key="fromMarker"
        position={defaultLocation}
        type="from"
        disabled
      />,
    );
  }

  if (!mapCenter && type === 'destination' && !isDesktop) {
    leafletObjs.push(
      <LocationMarker
        key="toMarker"
        position={defaultLocation}
        type="to"
        disabled
      />,
    );
  }

  if (match.location.query && match.location.query.intermediatePlaces) {
    if (Array.isArray(match.location.query.intermediatePlaces)) {
      match.location.query.intermediatePlaces
        .map(otpToLocation)
        .forEach((markerLocation, i) => {
          leafletObjs.push(
            <LocationMarker
              key={`via_${i}`} // eslint-disable-line react/no-array-index-key
              position={markerLocation}
            />,
          );
        });
    } else {
      leafletObjs.push(
        <LocationMarker
          key="via"
          position={otpToLocation(match.location.query.intermediatePlaces)}
        />,
      );
    }
  }

  const positionSelectingFromMap = mapCenter || defaultLocation;

  if (!mapCenter) {
    leafletObjs.push(confirmButton(false));
  } else {
    leafletObjs.push(markLocation(type, positionSelectingFromMap));
    leafletObjs.push(
      <LocationMarkerWithPermanentTooltip
        key="tooltip"
        position={positionSelectingFromMap}
        text={mapCenter.address}
      />,
    );
    leafletObjs.push(confirmButton(true, mapCenter, positionSelectingFromMap));
  }
  const eventHooks = {};
  if (isDesktop) {
    eventHooks.leafletEvents = {
      onClick,
    };
  } else {
    eventHooks.onEndNavigation = setMapLocation;
  }

  return (
    <MapWithTracking
      className="select-from-map full"
      leafletObjs={leafletObjs}
      lat={defaultLocation.lat}
      lon={defaultLocation.lon}
      zoom={12}
      mapLayers={mapLayers}
      locationPopup="none"
      mapRef={setMapElementRef}
      {...eventHooks}
    />
  );
}

SelectFromMap.propTypes = {
  breakpoint: PropTypes.string,
  language: PropTypes.string,
  type: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  mapLayers: mapLayerShape.isRequired,
};

export default connectToStores(
  withBreakpoint(SelectFromMap),
  ['MapLayerStore'],
  ({ getStore }) => {
    const mapLayers = getStore('MapLayerStore').getMapLayers({
      notThese: ['vehicles'],
    });
    return { mapLayers };
  },
);
