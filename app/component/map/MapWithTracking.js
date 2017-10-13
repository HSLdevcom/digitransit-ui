import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import ComponentUsageExample from '../ComponentUsageExample';
import Map from './Map';
import ToggleMapTracking from '../ToggleMapTracking';
import { dtLocationShape } from '../../util/shapes';

const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'breakpoint',
  'lat',
  'lon',
  'zoom',
  'mapTracking',
  'children',
  'showStops',
  'showScaleBar',
]);

const Component = onlyUpdateCoordChanges(Map);

class MapWithTrackingStateHandler extends React.Component {
  static propTypes = {
    origin: PropTypes.shape({
      userSetPosition: PropTypes.bool.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
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
    children: PropTypes.element.isRequired,
  };

  constructor(props) {
    super(props);

    const hasOriginorPosition =
      props.origin.userSetPosition || props.position.hasLocation;
    this.state = {
      initialZoom: !hasOriginorPosition ? 14 : 16,
      mapTracking: !props.origin.userSetPosition && props.position.hasLocation,
      focusOnOrigin:
        !props.position.hasLocation && !props.position.isLocationingInProgress,
      origin: props.origin,
      shouldShowDefaultLocation: !hasOriginorPosition,
    };
  }

  componentWillReceiveProps(newProps) {
    if (
      this.state.origin.useCurrentPosition !== true &&
      newProps.origin.gps === true
    ) {
      this.usePosition(newProps.origin);
    } else if (
      newProps.origin !== this.state.origin &&
      newProps.origin.lat != null &&
      newProps.origin.lon != null
    ) {
      this.useOrigin(newProps.origin);
    } else if (
      this.state.focusOnOrigin === true ||
      this.state.shouldShowDefaultLocation === true
    ) {
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
      initialZoom: this.state.initialZoom === 14 ? 16 : undefined,
      shouldShowDefaultLocation: false,
    });
  }

  useOrigin(origin) {
    this.setState({
      origin,
      mapTracking: false,
      focusOnOrigin: true,
      initialZoom: this.state.initialZoom === 14 ? 16 : undefined,
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
        displayOriginPopup
        leafletEvents={{
          onDragstart: this.disableMapTracking,
          onZoomend: this.disableMapTracking,
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
