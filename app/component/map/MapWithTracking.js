import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import ComponentUsageExample from '../ComponentUsageExample';
import Map from './Map';
import ToggleMapTracking from '../ToggleMapTracking';
import { dtLocationShape } from '../../util/shapes';

const DEFAULT_ZOOM = 11;
const FOCUS_ZOOM = 16;

const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'breakpoint',
  'lat',
  'lon',
  'zoom',
  'mapTracking',
  'children',
  'showStops',
  'showScaleBar',
  'origin',
]);

const Component = onlyUpdateCoordChanges(Map);

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
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
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
  }

  componentWillReceiveProps(newProps) {
    if (
      // "current position selected"
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
    } else if (
      this.state.focusOnOrigin === true ||
      this.state.shouldShowDefaultLocation === true
    ) {
      // "origin not set"
      this.setState({
        focusOnOrigin: false,
        shouldShowDefaultLocation: false,
      });
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
    const { position, origin, config, children, ...rest } = this.props;
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
      >
        {children}
        {this.props.position.hasLocation && (
          <ToggleMapTracking
            key="toggleMapTracking"
            handleClick={
              this.state.mapTracking
                ? this.disableMapTracking
                : this.enableMapTracking
            }
            className={`icon-mapMarker-toggle-positioning-${this.state
              .mapTracking
              ? 'online'
              : 'offline'}`}
          />
        )}
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
