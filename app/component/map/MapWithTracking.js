/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames'; // DT-3470
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import isEqual from 'lodash/isEqual';
import { startLocationWatch } from '../../action/PositionActions';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import ComponentUsageExample from '../ComponentUsageExample';
import MapContainer from './MapContainer';
import ToggleMapTracking from '../ToggleMapTracking';
import { dtLocationShape } from '../../util/shapes';
import { isBrowser } from '../../util/browser';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import PositionStore from '../../store/PositionStore';
import GeoJsonStore from '../../store/GeoJsonStore';
import MessageStore from '../../store/MessageStore';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import triggerMessage from '../../util/messageUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const DEFAULT_ZOOM = 12;
const FOCUS_ZOOM = 16;
const onlyUpdateCoordChanges = onlyUpdateForKeys([
  'lat',
  'lon',
  'zoom',
  'mapTracking',
  'showStops',
  'showScaleBar',
  'children',
]);

const jsonModules = {
  GeoJSON: () => importLazy(import(/* webpackChunkName: "map" */ './GeoJSON')),
};

const Component = onlyUpdateCoordChanges(MapContainer);

/* stop yet another eslint madness */
/* eslint-disable react/sort-comp */

let mapLoaded = false;
let previousFocusPoint = null;
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
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
    focusPoint: dtLocationShape,
    fitBounds: PropTypes.bool,
    position: PropTypes.shape({
      hasLocation: PropTypes.bool.isRequired,
      isLocationingInProgress: PropTypes.bool.isRequired,
      status: PropTypes.string,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    }).isRequired,
    config: PropTypes.shape({
      defaultMapCenter: dtLocationShape,
      defaultEndpoint: dtLocationShape.isRequired,
      realTime: PropTypes.object.isRequired,
      feedIds: PropTypes.array.isRequired,
      showAllBusses: PropTypes.bool.isRequired,
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
    messages: PropTypes.array,
    setInitialMapTracking: PropTypes.bool,
    initialZoom: PropTypes.number,
    disableLocationPopup: PropTypes.bool,
    showLocationMessages: PropTypes.bool,
    defaultMapCenter: PropTypes.object.isRequired,
    fitBoundsWithSetCenter: PropTypes.bool,
  };

  static defaultProps = {
    focusPoint: undefined,
    renderCustomButtons: undefined,
    setInitialMapTracking: false,
    initialZoom: undefined,
    disableLocationPopup: false,
    fitBounds: false,
    showLocationMessages: false,
    fitBoundsWithSetCenter: false,
  };

  constructor(props) {
    super(props);
    const defaultZoom = this.focusPoint ? DEFAULT_ZOOM : FOCUS_ZOOM;
    this.state = {
      locationingOn: false,
      geoJson: {},
      defaultMapCenter: props.defaultMapCenter,
      initialZoom: props.initialZoom ? props.initialZoom : defaultZoom,
      mapTracking: props.setInitialMapTracking,
    };
  }

  async componentDidMount() {
    if (!isBrowser) {
      return;
    }
    const {
      config,
      getGeoJsonData,
      getGeoJsonConfig,
      showLocationMessages,
    } = this.props;
    if (
      config.geoJson &&
      (Array.isArray(config.geoJson.layers) || config.geoJson.layerConfigUrl)
    ) {
      const layers = config.geoJson.layerConfigUrl
        ? await getGeoJsonConfig(config.geoJson.layerConfigUrl)
        : config.geoJson.layers;
      if (Array.isArray(layers) && layers.length > 0) {
        const json = await Promise.all(
          layers.map(async ({ url, name, isOffByDefault, metadata }) => ({
            url,
            isOffByDefault,
            data: await getGeoJsonData(url, name, metadata),
          })),
        );
        if (this.isCancelled) {
          return;
        }
        const { geoJson } = this.state;
        json.forEach(({ url, data, isOffByDefault }) => {
          geoJson[url] = { ...data, isOffByDefault };
        });
        this.setState(geoJson);
      }
    }

    if (this.focusPoint && showLocationMessages) {
      const { lat, lon } = this.focusPoint;
      await triggerMessage(lat, lon, this.context, this.props.messages);
    }

    if (this.props.mapLayers.showAllBusses) {
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
    if (newProps.mapTracking || newProps.initialMapWithTracking) {
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
      if (newProps.focusPoint) {
        triggerMessage(
          newProps.focusPoint.lat,
          newProps.focusPoint.lon,
          this.context,
          this.props.messages,
        );
      }
    }
    if (newProps.mapLayers.showAllBusses) {
      if (!this.props.mapLayers.showAllBusses) {
        startClient(this.context);
      }
    } else if (this.props.mapLayers.showAllBusses) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      if (client) {
        this.context.executeAction(stopRealTimeClient, client);
      }
    }
  }

  componentWillUnmount() {
    previousFocusPoint = null;
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
      locationingOn: true,
      initialZoom: 16,
    });
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
    const newBounds = this.mapElement.leafletElement.getBounds();
    const { bounds } = this.state;
    if (bounds && bounds.equals(newBounds)) {
      return;
    }
    this.setState({
      bounds: newBounds,
    });
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
      ...rest
    } = this.props;
    let useFitBounds = fitBounds;
    // Fitbounds should only be set when map is first loaded. If fitbounds is set to true after map is loaded, tracking functionality will break.
    if (mapLoaded) {
      useFitBounds = false;
    }
    const { geoJson } = this.state;
    let location = {};
    const leafletObjs = [];
    if (this.props.leafletObjs) {
      leafletObjs.push(...this.props.leafletObjs);
    }
    if (this.props.mapLayers.showAllBusses) {
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

    if (geoJson) {
      const { bounds } = this.state;
      Object.keys(geoJson)
        .filter(
          key =>
            mapLayers.geoJson[key] !== false &&
            (mapLayers.geoJson[key] === true ||
              geoJson[key].isOffByDefault !== true),
        )
        .forEach(key => {
          leafletObjs.push(
            <LazilyLoad modules={jsonModules} key={key}>
              {({ GeoJSON }) => (
                <GeoJSON bounds={bounds} data={geoJson[key].data} />
              )}
            </LazilyLoad>,
          );
        });
    }

    let btnClassName = 'map-with-tracking-buttons'; // DT-3470
    if (this.context.config.map.showZoomControl) {
      btnClassName = cx(btnClassName, 'roomForZoomControl');
    }
    let positionSet = true;
    const useMapCoords = this.mapElement;
    mapLoaded = useMapCoords;
    if (this.state.mapTracking && position.hasLocation) {
      location = position;
      positionSet = false;
    } else if (focusPoint) {
      const validPoint =
        focusPoint.ready &&
        !focusPoint.gps &&
        mapLoaded &&
        !isEqual(focusPoint, previousFocusPoint);
      if (validPoint) {
        location = focusPoint;
        previousFocusPoint = focusPoint;
        positionSet = false;
      } else if (mapLoaded) {
        location = {};
        positionSet = false;
      } else {
        // FocusPoint is valid, but map is not loaded. Set location to focusPoint so that the map renders.
        location = focusPoint.ready
          ? focusPoint
          : position.hasLocation
          ? position
          : {};
        positionSet = true;
      }
    } else {
      location =
        position.hasLocation && !mapLoaded
          ? position
          : mapLoaded
          ? {}
          : this.state.defaultMapCenter;
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
    const iconColor = this.state.mapTracking ? undefined : '#78909c';

    return (
      <Component
        lat={location ? location.lat : undefined}
        lon={location ? location.lon : undefined}
        zoom={this.state.initialZoom}
        mapTracking={this.state.mapTracking}
        fitBounds={useFitBounds}
        className="flex-grow"
        disableLocationPopup={this.props.disableLocationPopup}
        leafletEvents={{
          onDragstart: this.disableMapTracking,
          onDragend: this.updateCurrentBounds,
          onZoomend: this.updateCurrentBounds,
        }}
        disableMapTracking={this.disableMapTracking}
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
      >
        {this.props.breakpoint === 'large' && (
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
        )}
        {children}
      </Component>
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
  [PositionStore, MapLayerStore, GeoJsonStore, MessageStore],
  ({ getStore }) => {
    const position = getStore(PositionStore).getLocationState();
    const mapLayers = getStore(MapLayerStore).getMapLayers();
    const { getGeoJsonConfig, getGeoJsonData } = getStore(GeoJsonStore);
    const messages = getStore(MessageStore).getMessages();

    return { position, mapLayers, getGeoJsonConfig, getGeoJsonData, messages };
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
