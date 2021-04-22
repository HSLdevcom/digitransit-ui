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
import { isBrowser } from '../../util/browser';
import PositionStore from '../../store/PositionStore';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { mapLayerShape } from '../../store/MapLayerStore';

const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'lat',
  'lon',
  'zoom',
  'bounds',
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
    zoom: PropTypes.number,
    position: PropTypes.shape({
      hasLocation: PropTypes.bool.isRequired,
      locationingFailed: PropTypes.bool,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    bounds: PropTypes.array,
    children: PropTypes.array,
    leafletObjs: PropTypes.array,
    renderCustomButtons: PropTypes.func,
    mapLayers: mapLayerShape.isRequired,
    mapTracking: PropTypes.bool,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
    fitBoundsWithSetCenter: PropTypes.bool,
    setCenterOfMap: PropTypes.func,
  };

  static defaultProps = {
    renderCustomButtons: undefined,
    locationPopup: 'reversegeocoding',
    onSelectLocation: () => null,
  };

  constructor(props) {
    super(props);
    this.state = {
      mapTracking: props.mapTracking,
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

  static getDerivedStateFromProps = nextProps => {
    let newState = null;
    if (nextProps.mapTracking) {
      newState = { mapTracking: true };
    } else if (nextProps.mapTracking === false) {
      newState = { mapTracking: false };
    }
    return newState;
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
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
    if (!this.props.position.hasLocation) {
      this.context.executeAction(startLocationWatch);
    }
    this.setState({
      mapTracking: true,
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

  disableMapTracking = () => {
    this.setState({
      mapTracking: false,
    });
  };

  updateCurrentBounds = () => {
    if (this.props.setCenterOfMap) {
      this.props.setCenterOfMap(this.mapElement);
    }
  };

  render() {
    const {
      lat,
      lon,
      zoom,
      position,
      children,
      renderCustomButtons,
      mapLayers,
      bounds,
      mapState,
      ...rest
    } = this.props;
    const { config } = this.context;

    const leafletObjs = [];
    if (this.props.leafletObjs) {
      leafletObjs.push(...this.props.leafletObjs);
    }
    if (this.props.mapLayers.vehicles) {
      // eslint-disable-next-line no-underscore-dangle
      const currentZoom = this.mapElement?.leafletElement?._zoom || zoom || 16;
      const useLargeIcon = currentZoom >= config.stopsMinZoom;
      leafletObjs.push(
        <VehicleMarkerContainer
          key="vehicles"
          useLargeIcon={useLargeIcon}
          ignoreMode
        />,
      );
    }

    let btnClassName = 'map-with-tracking-buttons'; // DT-3470
    if (config.map.showZoomControl) {
      btnClassName = cx(btnClassName, 'roomForZoomControl');
    }

    const naviProps = {}; // these define map center and zoom
    if (this.state.mapTracking && position.hasLocation) {
      naviProps.lat = position.lat;
      naviProps.lon = position.lon;
      if (zoom) {
        naviProps.zoom = zoom;
      }
    } else if (this.props.bounds) {
      naviProps.bounds = this.props.bounds;
    } else if (lat && lon) {
      naviProps.lat = lat;
      naviProps.lon = lon;
      if (zoom) {
        naviProps.zoom = zoom;
      }
    }

    // eslint-disable-next-line no-nested-ternary
    const img = position.locationingFailed
      ? 'icon-tracking-off-v2'
      : this.state.mapTracking
      ? 'icon-tracking-on-v2'
      : 'icon-tracking-offline-v2';

    const iconColor = this.state.mapTracking ? '#ff0000' : '#78909c';

    return (
      <Map
        className="flex-grow"
        locationPopup={this.props.locationPopup}
        onSelectLocation={this.props.onSelectLocation}
        leafletEvents={{
          onDragstart: this.disableMapTracking,
          onZoomend: this.updateCurrentBounds,
          onDragend: this.updateCurrentBounds,
        }}
        {...naviProps}
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
  config: PropTypes.shape({
    realTime: PropTypes.object.isRequired,
    feedIds: PropTypes.array.isRequired,
    stopsMinZoom: PropTypes.number.isRequired,
    geoJson: PropTypes.shape({
      layers: PropTypes.array,
      layerConfigUrl: PropTypes.string,
    }),
  }).isRequired,
};

const MapWithTracking = connectToStores(
  getContext({ config: PropTypes.object })(MapWithTrackingStateHandler),
  [PositionStore],
  ({ getStore }) => ({
    position: getStore(PositionStore).getLocationState(),
  }),
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
