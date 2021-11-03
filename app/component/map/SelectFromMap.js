import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';
import LocationMarker from './LocationMarker';
import MapWithTracking from './MapWithTracking';
import { otpToLocation } from '../../util/otpStrings';
import { getJson } from '../../util/xhrPromise';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { LightenDarkenColor } from '../../util/colorUtils';
import { mapLayerShape } from '../../store/MapLayerStore';
import withBreakpoint from '../../util/withBreakpoint';

const DESKTOP_BREAKPOINT = 'large';

const locationMarkerWithPermanentTooltipModules = {
  LocationMarkerWithPermanentTooltip: () =>
    importLazy(
      import(
        /* webpackChunkName: "map" */ './LocationMarkerWithPermanentTooltip'
      ),
    ),
};

const confirmLocationFromMapButtonModules = {
  ConfirmLocationFromMapButton: () =>
    importLazy(
      import(/* webpackChunkName: "map" */ './ConfirmLocationFromMapButton'),
    ),
};

class SelectFromMapPageMap extends React.Component {
  static contextTypes = {
    match: matchShape,
    config: PropTypes.object,
    intl: intlShape,
  };

  static propTypes = {
    // eslint-disable-next-line no-dupe-keys
    breakpoint: PropTypes.string,
    language: PropTypes.string,
    type: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    mapLayers: mapLayerShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  setMapElementRef = element => {
    this.map = get(element, 'leafletElement', null);
  };

  setAddress = (lat, lon) => {
    const { intl } = this.context;
    getJson(this.context.config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': lat,
      'point.lon': lon,
      'boundary.circle.radius': 0.1, // 100m
      lang: this.props.language,
      size: 1,
      layers: 'address',
      zones: 1,
    }).then(
      data => {
        if (data.features != null && data.features.length > 0) {
          const match = data.features[0].properties;
          this.setState(prevState => ({
            mapCenter: {
              ...prevState.mapCenter,
              address: getLabel(match),
              lat,
              lon,
              onlyCoordinates: false,
            },
          }));
        } else {
          this.setState(prevState => ({
            mapCenter: {
              ...prevState.mapCenter,
              address: intl.formatMessage({
                id: 'location-from-map',
                defaultMessage: 'Selected location',
              }), // + ', ' + JSON.stringify(centerOfMap.lat).match(/[0-9]{1,3}.[0-9]{6}/) + ' ' + JSON.stringify(centerOfMap.lng).match(/[0-9]{1,3}.[0-9]{6}/),
              lat,
              lon,
              onlyCoordinates: true,
            },
          }));
        }
      },
      () => {
        this.setState({
          mapCenter: {
            address: intl.formatMessage({
              id: 'location-from-map',
              defaultMessage: 'Selected location',
            }), // + ', ' + JSON.stringify(centerOfMap.lat).match(/[0-9]{1,3}.[0-9]{6}/) + ' ' + JSON.stringify(centerOfMap.lng).match(/[0-9]{1,3}.[0-9]{6}/),
            lat,
            lon,
            onlyCoordinates: true,
          },
        });
      },
    );
  };

  onClick = e => {
    const clickedDiv = e.originalEvent.target;
    if (clickedDiv.tagName === 'BUTTON') {
      return;
    }

    this.setState({
      mapCenter: {
        address: '',
        lat: e.latlng.lat,
        lon: e.latlng.lng,
      },
    });

    this.setAddress(e.latlng.lat, e.latlng.lng);
  };

  setMapLocation = () => {
    if (!this.map) {
      return;
    }
    const centerOfMap = this.map.getCenter();

    if (
      this.state.mapCenter &&
      this.state.mapCenter.lat === centerOfMap.lat &&
      this.state.mapCenter.lon === centerOfMap.lng
    ) {
      return;
    }

    this.setAddress(centerOfMap.lat, centerOfMap.lng);
  };

  createAddress = (address, position) => {
    if (address !== '') {
      const newAddress = address.split(', ');
      let strippedAddress = newAddress[0];
      if (!this.state.mapCenter.onlyCoordinates) {
        strippedAddress = `${strippedAddress}, ${newAddress[1]}`;
      }
      strippedAddress = `${strippedAddress}::${JSON.stringify(
        position.lat,
      )},${JSON.stringify(position.lon)}`;
      return strippedAddress;
    }
    return '';
  };

  confirmButton = (isEnabled, mapCenter, positionSelectingFromMap) => {
    const { intl } = this.context;

    return (
      <LazilyLoad modules={confirmLocationFromMapButtonModules} key="confirm">
        {({ ConfirmLocationFromMapButton }) => (
          <ConfirmLocationFromMapButton
            isEnabled={!!isEnabled}
            address={
              isEnabled
                ? this.createAddress(
                    mapCenter.address,
                    positionSelectingFromMap,
                  )
                : undefined
            }
            title={intl.formatMessage({
              id: 'location-from-map-confirm',
              defaultMessage: 'Confirm selection',
            })}
            type={this.props.type}
            onConfirm={isEnabled ? this.props.onConfirm : undefined}
            color={this.context.config.colors.primary}
            hoverColor={
              this.context.config.colors.hover ||
              LightenDarkenColor(this.context.config.colors.primary, -20)
            }
          />
        )}
      </LazilyLoad>
    );
  };

  markLocation = (markerType, position) => {
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
      return (
        <LocationMarker key="location" position={newPosition} type={type} />
      );
    }
    return null;
  };

  render() {
    const { config, match } = this.context;
    const { type } = this.props;
    const { mapCenter } = this.state;
    const defaultLocation = config.defaultEndpoint;
    const zoom = config.map?.zoom || 12;
    const isDesktop = this.props.breakpoint === DESKTOP_BREAKPOINT;

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
      leafletObjs.push(this.confirmButton(false));
    } else {
      leafletObjs.push(
        this.markLocation(this.props.type, positionSelectingFromMap),
      );
      leafletObjs.push(
        <LazilyLoad
          modules={locationMarkerWithPermanentTooltipModules}
          key="moveMapInfo"
        >
          {({ LocationMarkerWithPermanentTooltip }) => (
            <LocationMarkerWithPermanentTooltip
              position={positionSelectingFromMap}
              text={mapCenter.address}
            />
          )}
        </LazilyLoad>,
      );
      leafletObjs.push(
        this.confirmButton(true, mapCenter, positionSelectingFromMap),
      );
    }
    const eventHooks = {};
    if (isDesktop) {
      eventHooks.leafletEvents = {
        onClick: this.onClick,
      };
    } else {
      eventHooks.onEndNavigation = this.setMapLocation;
    }

    return (
      <MapWithTracking
        className="select-from-map full"
        leafletObjs={leafletObjs}
        lat={defaultLocation.lat}
        lon={defaultLocation.lon}
        zoom={zoom}
        mapLayers={this.props.mapLayers}
        locationPopup="none"
        mapRef={this.setMapElementRef}
        {...eventHooks}
      />
    );
  }
}

export default connectToStores(
  withBreakpoint(SelectFromMapPageMap),
  ['MapLayerStore'],
  ({ getStore }) => {
    const mapLayers = getStore('MapLayerStore').getMapLayers({
      notThese: ['vehicles'],
    });
    return { mapLayers };
  },
);
