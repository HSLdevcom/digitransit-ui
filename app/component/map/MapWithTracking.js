/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames'; // DT-3470
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import { startLocationWatch } from '../../action/PositionActions';
import ComponentUsageExample from '../ComponentUsageExample';
import MapContainer from './MapContainer';
import ToggleMapTracking from '../ToggleMapTracking';
import { dtLocationShape } from '../../util/shapes';
import { isBrowser } from '../../util/browser';
import PositionStore from '../../store/PositionStore';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { MAPSTATES } from '../../util/stopsNearYouUtils';
import { mapLayerShape } from '../../store/MapLayerStore';

const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'lat',
  'lon',
  'zoom',
  'mapTracking',
  'mapLayers',
  'children',
  'leafletObjs',
]);

const Map = onlyUpdateCoordChanges(MapContainer);

/* stop yet another eslint madness */
/* eslint-disable react/sort-comp */

const startClient = context => {
  const { realTime } = context.config;
  let agency;
  /* handle multiple feedid case */
  context.config.feedIds.forEach(ag => {
    if (!agency && realTime[ag]) {
      agency = ag;
    }
  });
  const source = agency && realTime[agency];
  if (source && source.active) {
    const config = {
      ...source,
      agency,
    };
    context.executeAction(startRealTimeClient, config);
  }
};

class MapWithTrackingStateHandler extends React.Component {
  static propTypes = {
    lat: PropTypes.number,
    lon: PropTypes.number,

    fitBounds: PropTypes.bool,
    position: PropTypes.shape({
      hasLocation: PropTypes.bool.isRequired,
      isLocationingInProgress: PropTypes.bool.isRequired,
      status: PropTypes.string,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    config: PropTypes.shape({
      realTime: PropTypes.object.isRequired,
      feedIds: PropTypes.array.isRequired,
      stopsMinZoom: PropTypes.number.isRequired,
      geoJson: PropTypes.shape({
        layers: PropTypes.array,
        layerConfigUrl: PropTypes.string,
      }),
    }).isRequired,
    children: PropTypes.array,
    leafletObjs: PropTypes.array,
    renderCustomButtons: PropTypes.func,
    mapLayers: mapLayerShape.isRequired,
    mapTracking: PropTypes.bool,
    initialZoom: PropTypes.number,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
    fitBoundsWithSetCenter: PropTypes.bool,
    setCenterOfMap: PropTypes.func,
  };

  static defaultProps = {
    renderCustomButtons: undefined,
    mapTracking: false,
    initialZoom: undefined,
    locationPopup: 'reversegeocoding',
    onSelectLocation: () => null,
    fitBounds: false,
    fitBoundsWithSetCenter: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      locationingOn: false,
      keepOnTracking: false,
      mapTracking: props.mapTracking,
      humanIsScrolling: false,
    };
  }

  async componentDidMount() {
    if (!isBrowser) {
      return;
    }

    if (this.props.mapLayers.vehicles) {
      startClient(this.context);
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    if (
      newProps.position.hasLocation ||
      newProps.position.isLocationingInProgress
    ) {
      this.setState({
        locationingOn: true,
      });
    }
    if (newProps.mapTracking) {
      this.setState({
        mapTracking: true,
      });
    } else if (newProps.mapTracking === false) {
      // Set this if and only if parent component spesifies that mapTracking is no longer wanted
      this.setState({
        mapTracking: false,
      });
    }
    if (newProps.initialZoom !== this.state.initialZoom) {
      this.updateZoom(newProps.initialZoom);
    }
    if (newProps.mapLayers.vehicles) {
      if (!this.props.mapLayers.vehicles) {
        startClient(this.context);
      }
    } else if (this.props.mapLayers.vehicles) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      if (client) {
        this.context.executeAction(stopRealTimeClient, client);
      }
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  setMapElementRef = element => {
    if (element && this.mapElement !== element) {
      this.mapElement = element;
    }
  };

  enableMapTracking = () => {
    if (!this.state.locationingOn) {
      this.context.executeAction(startLocationWatch);
    }
    this.setState({
      mapTracking: true,
      keepOnTracking: true,
      locationingOn: true,
      initialZoom: 16,
    });
    if (this.props.setCenterOfMap) {
      this.props.setCenterOfMap(null);
    }
    addAnalyticsEvent({
      category: 'Map',
      action: 'ReCenterToMyGeolocation',
      name: null,
    });
  };

  disableMapTrackingForZoomControl = () => {
    if (!this.state.keepOnTracking) {
      this.setState({
        mapTracking: false,
        keepOnTracking: false,
      });
    } else {
      this.setState({
        keepOnTracking: false,
      });
    }
  };

  disableMapTracking = () => {
    this.setState({
      mapTracking: false,
      keepOnTracking: false,
    });
  };

  updateCurrentBounds = () => {
    const newBounds = this.mapElement.leafletElement.getBounds();
    const { bounds } = this.state;
    if (bounds && bounds.equals(newBounds)) {
      return;
    }
    this.setState({
      bounds: newBounds,
    });
    if (this.props.setCenterOfMap && this.state.humanIsScrolling) {
      this.props.setCenterOfMap(this.mapElement);
    }
  };

  updateZoom(zoom) {
    this.setState({
      initialZoom: zoom,
    });
  }

  render() {
    const {
      position,
      config,
      children,
      renderCustomButtons,
      mapLayers,
      fitBounds,
      focusPoint,
      mapState,
      ...rest
    } = this.props;
    let useFitBounds = fitBounds;
    // Fitbounds should only be set when map is first loaded. If fitbounds is set to true after map is loaded, tracking functionality will break.
    let location = {};
    const leafletObjs = [];
    if (this.props.leafletObjs) {
      leafletObjs.push(...this.props.leafletObjs);
    }
    if (this.props.mapLayers.vehicles) {
      const currentZoom =
        this.mapElement && this.mapElement.leafletElement
          ? this.mapElement.leafletElement._zoom // eslint-disable-line no-underscore-dangle
          : this.state.initialZoom;
      const useLargeIcon = currentZoom >= this.props.config.stopsMinZoom;
      leafletObjs.push(
        <VehicleMarkerContainer
          key="vehicles"
          useLargeIcon={useLargeIcon}
          ignoreMode
        />,
      );
    }

    let btnClassName = 'map-with-tracking-buttons'; // DT-3470
    if (this.context.config.map.showZoomControl) {
      btnClassName = cx(btnClassName, 'roomForZoomControl');
    }
    let positionSet = true;
    const useMapCoords = this.mapElement;
    if (this.state.mapTracking && position.hasLocation) {
      location = position;
      positionSet = false;
    } else if (focusPoint) {
      const validPoint = focusPoint.lat;
      if (validPoint) {
        location = focusPoint;
        positionSet = false;
      } else {
        // FocusPoint is valid, but map is not loaded. Set location to focusPoint so that the map renders.
        location = focusPoint.lat
          ? focusPoint
          : position.hasLocation
          ? position
          : {};
        positionSet = true;
      }
    } else {
      location = position.hasLocation ? position : this.state.defaultMapCenter;
      positionSet = false;
    }
    if (positionSet && useMapCoords) {
      // Map has to be loaded first, so we need correct coordinates at start. But after that (leafletElement exists)
      // we don't need correct coordinates. In fact trying to inject coordinates will mess up zooming and tracking.
      // This will also prevent situation when mapTracking is set to false, focus goes back to focusPoint.
      location = {};
    }

    if (
      this.props.fitBoundsWithSetCenter &&
      this.state.mapTracking &&
      this.props.bounds.length
    ) {
      useFitBounds = true;
      location = {};
    }

    const positionAllowed =
      this.state.locationingOn &&
      ['found-location', 'found-address'].includes(position.status);
    // eslint-disable-next-line no-nested-ternary
    const img = positionAllowed
      ? this.state.mapTracking
        ? 'icon-tracking-on-v2'
        : 'icon-tracking-offline-v2'
      : 'icon-tracking-off-v2';
    const iconColor = this.state.mapTracking ? '#ff0000' : '#78909c';
    if (
      mapState === MAPSTATES.FITBOUNDSTOSEARCHPOSITION ||
      mapState === MAPSTATES.FITBOUNDSTOSTARTLOCATION
    ) {
      useFitBounds = true;
    }
    return (
      <Map
        lat={location ? location.lat : undefined}
        lon={location ? location.lon : undefined}
        zoom={this.state.initialZoom}
        fitBounds={useFitBounds}
        className="flex-grow"
        locationPopup={this.props.locationPopup}
        onSelectLocation={this.props.onSelectLocation}
        leafletEvents={{
          onDragstart: () => {
            this.disableMapTracking();
            this.setState({ humanIsScrolling: true });
          },
          onMoveend: () => this.setState({ keepOnTracking: false }),
          onDragend: () => {
            this.updateCurrentBounds();
            this.setState({ humanIsScrolling: false });
          },
          onZoomend: this.updateCurrentBounds,
          onZoomstart: this.disableMapTrackingForZoomControl,
        }}
        {...rest}
        leafletObjs={leafletObjs}
        mapRef={this.setMapElementRef}
        bottomButtons={
          <div className={btnClassName}>
            {renderCustomButtons && renderCustomButtons()}
            <ToggleMapTracking
              key="toggleMapTracking"
              img={img}
              iconColor={iconColor}
              handleClick={
                this.state.mapTracking
                  ? this.disableMapTracking
                  : this.enableMapTracking
              }
              className="icon-mapMarker-toggle-positioning"
            />
          </div>
        }
        mapLayers={mapLayers}
      >
        {children}
      </Map>
    );
  }
}

MapWithTrackingStateHandler.contextTypes = {
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
  config: PropTypes.object,
};

const MapWithTracking = connectToStores(
  getContext({
    config: PropTypes.shape({
      defaultMapCenter: dtLocationShape,
    }),
  })(MapWithTrackingStateHandler),
  [PositionStore],
  ({ getStore }) => {
    const position = getStore(PositionStore).getLocationState();
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

export { MapWithTracking as default, MapWithTrackingStateHandler as Component };
