import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import ComponentUsageExample from '../ComponentUsageExample';
import MapContainer from './MapContainer';
import ToggleMapTracking from '../ToggleMapTracking';
import { dtLocationShape } from '../../util/shapes';
import { getJson } from '../../util/xhrPromise';
import { isBrowser } from '../../util/browser';

const DEFAULT_ZOOM = 12;
const FOCUS_ZOOM = 16;

const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'lat',
  'lon',
  'zoom',
  'mapTracking',
  'showStops',
  'showScaleBar',
  'origin',
  'children',
]);

const placeMarkerModules = {
  PlaceMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './PlaceMarker')),
};

const jsonModules = {
  GeoJSON: () => importLazy(import(/* webpackChunkName: "map" */ './GeoJSON')),
};

const Component = onlyUpdateCoordChanges(MapContainer);

class MapWithTrackingStateHandler extends React.Component {
  static propTypes = {
    origin: dtLocationShape.isRequired,
    position: PropTypes.shape({
      hasLocation: PropTypes.bool.isRequired,
      isLocationingInProgress: PropTypes.bool.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    config: PropTypes.shape({
      defaultMapCenter: dtLocationShape,
      defaultEndpoint: dtLocationShape.isRequired,
    }).isRequired,
    children: PropTypes.array,
    renderCustomButtons: PropTypes.func,
  };

  static defaultProps = {
    renderCustomButtons: undefined,
  };

  constructor(props) {
    super(props);
    const hasOriginorPosition =
      props.origin.ready || props.position.hasLocation;
    this.state = {
      initialZoom: hasOriginorPosition ? FOCUS_ZOOM : DEFAULT_ZOOM,
      mapTracking: props.origin.gps && props.position.hasLocation,
      focusOnOrigin: props.origin.ready,
      origin: props.origin,
      shouldShowDefaultLocation: !hasOriginorPosition,
    };
    const { config } = props;
    if (isBrowser && config.geoJson) {
      config.geoJson.forEach(val => {
        const { name, url } = val;
        getJson(url).then(res => {
          let newData = {};
          if (this.state.geoJson) {
            newData = { ...this.state.geoJson };
          }
          newData[name.fi] = res;
          this.setState({ geoJson: newData });
        });
      });
    }
  }

  componentWillReceiveProps(newProps) {
    if (
      // "current position selected"
      newProps.origin.lat != null &&
      newProps.origin.lon != null &&
      newProps.origin.gps === true &&
      ((this.state.origin.ready === false && newProps.origin.ready === true) ||
        !this.state.origin.gps) // current position selected
    ) {
      this.usePosition(newProps.origin);
    } else if (
      // "poi selected"
      !newProps.origin.gps &&
      (newProps.origin.lat !== this.state.origin.lat ||
        newProps.origin.lon !== this.state.origin.lon) &&
      newProps.origin.lat != null &&
      newProps.origin.lon != null
    ) {
      this.useOrigin(newProps.origin);
    }
  }

  usePosition(origin) {
    this.setState({
      origin,
      mapTracking: true,
      focusOnOrigin: false,
      initialZoom:
        this.state.initialZoom === DEFAULT_ZOOM ? FOCUS_ZOOM : undefined,
      shouldShowDefaultLocation: false,
    });
  }

  useOrigin(origin) {
    this.setState({
      origin,
      mapTracking: false,
      focusOnOrigin: true,
      initialZoom:
        this.state.initialZoom === DEFAULT_ZOOM ? FOCUS_ZOOM : undefined,
      shouldShowDefaultLocation: false,
    });
  }

  enableMapTracking = () => {
    this.setState({
      mapTracking: true,
      focusOnOrigin: false,
    });
  };

  disableMapTracking = () => {
    this.setState({
      mapTracking: false,
      focusOnOrigin: false,
    });
  };

  render() {
    const {
      position,
      origin,
      config,
      children,
      renderCustomButtons,
      ...rest
    } = this.props;
    let location;

    if (
      this.state.focusOnOrigin &&
      !this.state.origin.gps &&
      this.state.origin.lat != null &&
      this.state.origin.lon != null
    ) {
      location = this.state.origin;
    } else if (this.state.mapTracking && position.hasLocation) {
      location = position;
    } else if (this.state.shouldShowDefaultLocation) {
      location = config.defaultMapCenter || config.defaultEndpoint;
    }

    const leafletObjs = [];

    if (origin && origin.ready === true && origin.gps !== true) {
      leafletObjs.push(
        <LazilyLoad modules={placeMarkerModules} key="from">
          {({ PlaceMarker }) => <PlaceMarker position={this.props.origin} />}
        </LazilyLoad>,
      );
    }

    if (this.state.geoJson) {
      Object.keys(this.state.geoJson).forEach(key =>
        leafletObjs.push(
          <LazilyLoad modules={jsonModules} key={key}>
            {({ GeoJSON }) => (
              <GeoJSON key={key} data={this.state.geoJson[key]} />
            )}
          </LazilyLoad>,
        ),
      );
    }

    return (
      <Component
        lat={location ? location.lat : null}
        lon={location ? location.lon : null}
        zoom={this.state.initialZoom}
        mapTracking={this.state.mapTracking}
        className="flex-grow"
        origin={this.props.origin}
        leafletEvents={{
          onDragstart: this.disableMapTracking,
          onZoomend: null, // this.disableMapTracking,
        }}
        disableMapTracking={this.disableMapTracking}
        {...rest}
        leafletObjs={leafletObjs}
      >
        {children}
        <div className="map-with-tracking-buttons">
          {renderCustomButtons && renderCustomButtons()}
          {this.props.position.hasLocation && (
            <ToggleMapTracking
              key="toggleMapTracking"
              handleClick={
                this.state.mapTracking
                  ? this.disableMapTracking
                  : this.enableMapTracking
              }
              className={`icon-mapMarker-toggle-positioning-${
                this.state.mapTracking ? 'online' : 'offline'
              }`}
            />
          )}
        </div>
      </Component>
    );
  }
}

// todo convert to use origin prop
const MapWithTracking = connectToStores(
  getContext({
    config: PropTypes.shape({
      defaultMapCenter: dtLocationShape.isRequired,
    }),
  })(MapWithTrackingStateHandler),
  ['PositionStore'],
  ({ getStore }) => {
    const position = getStore('PositionStore').getLocationState();

    return { position };
  },
);

MapWithTracking.description = (
  <div>
    <p>Renders a map with map-tracking functionality</p>
    <ComponentUsageExample description="">
      <MapWithTracking />
    </ComponentUsageExample>
  </div>
);

export default MapWithTracking;
