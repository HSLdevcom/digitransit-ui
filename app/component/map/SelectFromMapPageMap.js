import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import LocationMarker from './LocationMarker';
import MapContainer from './MapContainer';
import { otpToLocation } from '../../util/otpStrings';
import withBreakpoint from '../../util/withBreakpoint';
import { getJson } from '../../util/xhrPromise';
import { getLabel } from '../../util/suggestionUtils';
import LazilyLoad, { importLazy } from '../LazilyLoad';

let map;

const locationMarkerWithPermanentTooltipModules = {
  LocationMarkerWithPermanentTooltip: () =>
    importLazy(
      import(/* webpackChunkName: "map" */ './LocationMarkerWithPermanentTooltip'),
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
    bounds: PropTypes.array,
    language: PropTypes.string,
    type: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  setMapElementRef = element => {
    map = get(element, 'leafletElement', null);
  };

  centerMapViewToWantedCoordinates = (coordinates, zoomLevel) => {
    if (!map) {
      return;
    }

    if (coordinates) {
      const zoom = zoomLevel || map.getZoom();
      map.setView(coordinates, zoom, { animate: true });
    }
  };

  getCoordinates = () => {
    const centerOfMap = map.getCenter();

    this.setState({
      locationOfMapCenter: {
        address: '',
        position: {
          lat: centerOfMap.lat,
          lon: centerOfMap.lng,
        },
      },
    });
  };

  getMapLocation = () => {
    const { intl } = this.context;
    const centerOfMap = map.getCenter();

    if (
      this.state.locationOfMapCenter &&
      this.state.locationOfMapCenter.lat === centerOfMap.lat &&
      this.state.locationOfMapCenter.lon === centerOfMap.lng
    ) {
      return;
    }

    getJson(this.context.config.URL.PELIAS_REVERSE_GEOCODER, {
      'point.lat': centerOfMap.lat,
      'point.lon': centerOfMap.lng,
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
            locationOfMapCenter: {
              ...prevState.locationOfMapCenter,
              address: getLabel(match),
              position: {
                lat: centerOfMap.lat,
                lon: centerOfMap.lng,
              },
              onlyCoordinates: false,
            },
          }));
        } else {
          this.setState(prevState => ({
            locationOfMapCenter: {
              ...prevState.locationOfMapCenter,
              address: intl.formatMessage({
                id: 'location-from-map',
                defaultMessage: 'Selected location',
              }), // + ', ' + JSON.stringify(centerOfMap.lat).match(/[0-9]{1,3}.[0-9]{6}/) + ' ' + JSON.stringify(centerOfMap.lng).match(/[0-9]{1,3}.[0-9]{6}/),
              position: {
                lat: centerOfMap.lat,
                lon: centerOfMap.lng,
              },
              onlyCoordinates: true,
            },
          }));
        }
      },
      () => {
        this.setState({
          locationOfMapCenter: {
            address: intl.formatMessage({
              id: 'location-from-map',
              defaultMessage: 'Selected location',
            }), // + ', ' + JSON.stringify(centerOfMap.lat).match(/[0-9]{1,3}.[0-9]{6}/) + ' ' + JSON.stringify(centerOfMap.lng).match(/[0-9]{1,3}.[0-9]{6}/),
            position: {
              lat: centerOfMap.lat,
              lon: centerOfMap.lng,
            },
            onlyCoordinates: true,
          },
        });
      },
    );
  };

  updateCurrentBounds = () => {
    const newBounds = map.getBounds();
    const { bounds } = this.state;
    if (bounds && bounds.equals(newBounds)) {
      return;
    }
    this.setState({
      bounds: newBounds,
    });
  };

  endDragging = () => {
    if (!map) {
      return;
    }
    this.getMapLocation();
  };

  endZoom = position => {
    if (!map) {
      return;
    }
    this.centerMapViewToWantedCoordinates(position);
  };

  createAddress = (address, position) => {
    if (address !== '') {
      const newAddress = address.split(', ');
      let strippedAddress = newAddress[0];
      if (!this.state.locationOfMapCenter.onlyCoordinates) {
        strippedAddress = `${strippedAddress}, ${newAddress[1]}`;
      }
      strippedAddress = `${strippedAddress}::${JSON.stringify(
        position.lat,
      )},${JSON.stringify(position.lon)}`;
      return strippedAddress;
    }
    return '';
  };

  confirmButton = (
    isEnabled,
    locationOfMapCenter,
    positionSelectingFromMap,
  ) => {
    const { config, intl } = this.context;

    return (
      <LazilyLoad modules={confirmLocationFromMapButtonModules} key="confirm">
        {({ ConfirmLocationFromMapButton }) => (
          <ConfirmLocationFromMapButton
            color={isEnabled ? config.colors.primary : undefined}
            isEnabled={!!isEnabled}
            address={
              isEnabled
                ? this.createAddress(
                    locationOfMapCenter.address,
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
          />
        )}
      </LazilyLoad>
    );
  };

  markLocation = (markerType, position) => {
    if (position) {
      let newPosition;
      if (decodeURIComponent(position).indexOf('::') !== -1) {
        newPosition = otpToLocation(decodeURIComponent(position));
      } else {
        newPosition = position;
      }
      return (
        <LocationMarker
          key="location"
          position={newPosition}
          type={markerType}
        />
      );
    }
    return null;
  };

  render() {
    const { config, match } = this.context;
    const { bounds, type } = this.props;

    const { locationOfMapCenter } = this.state;

    const defaultLocation = config.defaultMapCenter || config.defaultEndpoint;

    const leafletObjs = [];
    if (!locationOfMapCenter && type === 'origin') {
      leafletObjs.push(
        <LocationMarker
          key="fromMarker"
          position={defaultLocation}
          type="from"
        />,
      );
    }

    if (!locationOfMapCenter && type === 'destination') {
      leafletObjs.push(
        <LocationMarker key="toMarker" position={defaultLocation} type="to" />,
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

    const positionSelectingFromMap =
      locationOfMapCenter && locationOfMapCenter.position
        ? locationOfMapCenter.position
        : defaultLocation;

    if (!locationOfMapCenter) {
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
              text={locationOfMapCenter.address}
            />
          )}
        </LazilyLoad>,
      );
      leafletObjs.push(
        this.confirmButton(true, locationOfMapCenter, positionSelectingFromMap),
      );
    }

    const showScale = true;

    return (
      <MapContainer
        className="full select-from-map"
        leafletEvents={{
          onDrag: this.getCoordinates,
          onDragend: this.endDragging,
          onZoomend: () => this.endZoom(positionSelectingFromMap),
        }}
        leafletObjs={leafletObjs}
        lat={defaultLocation.lat} // {center ? center.lat : from.lat}
        lon={defaultLocation.lon} // {center ? center.lon : from.lon}
        zoom={12}
        bounds={bounds}
        fitBounds={Boolean(bounds)}
        boundsOptions={{ maxZoom: 16 }}
        showScaleBar={showScale}
        mapRef={this.setMapElementRef}
      />
    );
  }
}

export default withBreakpoint(SelectFromMapPageMap);
