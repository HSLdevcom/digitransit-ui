import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames'; // DT-3470
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
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

const MapCont = onlyUpdateCoordChanges(MapContainer);

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
    onStartNavigation: PropTypes.func,
    onEndNavigation: PropTypes.func,
    onMapTracking: PropTypes.func,
    setMWTRef: PropTypes.func,
    mapRef: PropTypes.func,
    leafletEvents: PropTypes.object,
  };

  static defaultProps = {
    renderCustomButtons: undefined,
    locationPopup: 'reversegeocoding',
    onSelectLocation: () => null,
    leafletEvents: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      mapTracking: props.mapTracking,
    };
    this.naviProps = {};
  }

  async componentDidMount() {
    if (!isBrowser) {
      return;
    }

    if (this.props.mapLayers.vehicles) {
      startClient(this.context);
      const currentZoom = // eslint-disable-next-line no-underscore-dangle
        this.mapElement?.leafletElement?._zoom || this.props.zoom || 16;
      if (currentZoom !== this.state.vehicleZoom) {
        this.setState({ vehicleZoom: currentZoom });
      }
    }
    if (this.props.setMWTRef) {
      this.props.setMWTRef(this);
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    let newState;
    if (newProps.mapTracking && !this.state.mapTracking) {
      newState = { mapTracking: true };
    } else if (newProps.mapTracking === false && this.state.mapTracking) {
      newState = { mapTracking: false };
    }
    if (newProps.mapLayers.vehicles) {
      const currentZoom = // eslint-disable-next-line no-underscore-dangle
        this.mapElement?.leafletElement?._zoom || newProps.zoom || 16;
      if (currentZoom !== this.state.vehicleZoom) {
        newState = newState || {};
        newState.vehicleZoom = currentZoom;
      }
    }
    if (newState) {
      this.setState(newState);
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
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  setMapElementRef = element => {
    if (element && this.mapElement !== element) {
      this.mapElement = element;
      if (this.props.mapRef) {
        this.props.mapRef(element);
      }
    }
  };

  enableMapTracking = () => {
    if (!this.props.position.hasLocation) {
      this.context.executeAction(startLocationWatch);
    }
    this.setState({
      mapTracking: true,
    });
    if (this.props.onMapTracking) {
      this.props.onMapTracking();
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

  forceRefresh = () => {
    this.refresh = true;
  };

  startNavigation = () => {
    if (this.props.onStartNavigation) {
      this.props.onStartNavigation(this.mapElement);
    }
    if (this.state.mapTracking && !this.ignoreNavigation) {
      this.disableMapTracking();
    }
  };

  endNavigation = () => {
    if (this.props.onEndNavigation) {
      this.props.onEndNavigation(this.mapElement);
    }
    this.navigated = true;
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.mapElement?.leafletElement?._zoom;
    if (this.props.mapLayers.vehicles && zoom !== this.state.vehicleZoom) {
      this.setState({ vehicleZoom: zoom });
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
      leafletEvents,
      ...rest
    } = this.props;
    const { config } = this.context;
    const leafletObjs = [];
    if (this.props.leafletObjs) {
      leafletObjs.push(...this.props.leafletObjs);
    }
    if (this.props.mapLayers.vehicles) {
      const useLargeIcon = this.state.vehicleZoom >= config.stopsMinZoom;
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
    // eslint-disable-next-line no-underscore-dangle
    const currentZoom = this.mapElement?.leafletElement?._zoom || zoom || 16;

    if (this.state.mapTracking && position.hasLocation) {
      this.naviProps.lat = position.lat;
      this.naviProps.lon = position.lon;
      if (zoom) {
        this.naviProps.zoom = zoom;
      } else if (!this.naviProps.zoom) {
        this.naviProps.zoom = currentZoom;
      }
      if (this.navigated) {
        // force map update by changing the coordinate slightly. looks crazy but is the easiest way
        this.naviProps.lat += 0.000001 * Math.random();
        this.navigated = false;
      }
      delete this.naviProps.bounds;
    } else if (
      this.props.bounds &&
      (!isEqual(this.oldBounds, this.props.bounds) || this.refresh)
    ) {
      this.naviProps.bounds = cloneDeep(this.props.bounds);
      if (this.refresh) {
        // bounds is defined by [min, max] point pair. Substract min lat a bit
        this.naviProps.bounds[0][0] -= 0.000001 * Math.random();
      }
      this.oldBounds = cloneDeep(this.props.bounds);
    } else if (
      lat &&
      lon &&
      ((lat !== this.oldLat && lon !== this.oldLon) || this.refresh)
    ) {
      this.naviProps.lat = lat;
      if (this.refresh) {
        this.naviProps.lat += 0.000001 * Math.random();
      }
      this.naviProps.lon = lon;
      this.oldLat = lat;
      this.oldLon = lon;
      if (zoom) {
        this.naviProps.zoom = zoom;
      }
      delete this.naviProps.bounds;
    }
    this.refresh = false;

    // eslint-disable-next-line no-nested-ternary
    const img = position.locationingFailed
      ? 'icon-tracking-off-v2'
      : this.state.mapTracking
      ? 'icon-tracking-on-v2'
      : 'icon-tracking-offline-v2';

    const iconColor = this.state.mapTracking ? '#ff0000' : '#78909c';
    return (
      <MapCont
        className="flex-grow"
        locationPopup={this.props.locationPopup}
        onSelectLocation={this.props.onSelectLocation}
        leafletEvents={{
          ...this.props.leafletEvents,
          onDragstart: this.startNavigation,
          onZoomstart: this.startNavigation,
          onZoomend: this.endNavigation,
          onDragend: this.endNavigation,
        }}
        {...this.naviProps}
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
              handleClick={() => {
                if (this.state.mapTracking) {
                  this.disableMapTracking();
                } else {
                  // enabling tracking will trigger same navigation events as user navigation
                  // this hack prevents those events from clearing tracking
                  this.ignoreNavigation = true;
                  setTimeout(() => {
                    this.ignoreNavigation = false;
                  }, 500);
                  this.enableMapTracking();
                }
              }}
              className="icon-mapMarker-toggle-positioning"
            />
          </div>
        }
        mapLayers={mapLayers}
      >
        {children}
      </MapCont>
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
