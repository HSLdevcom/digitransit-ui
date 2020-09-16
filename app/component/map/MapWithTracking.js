import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames'; // DT-3470
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import getContext from 'recompose/getContext';
import isEqual from 'lodash/isEqual';
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
    setInitialZoom: PropTypes.number,
    disableLocationPopup: PropTypes.bool,
    showLocationMessages: PropTypes.bool,
    defaultMapCenter: PropTypes.object.isRequired,
  };

  static defaultProps = {
    focusPoint: undefined,
    renderCustomButtons: undefined,
    setInitialMapTracking: false,
    setInitialZoom: undefined,
    disableLocationPopup: false,
    fitBounds: false,
    showLocationMessages: false,
  };

  constructor(props) {
    super(props);
    this.focusPoint = props.focusPoint;
    const defaultZoom = this.focusPoint ? DEFAULT_ZOOM : FOCUS_ZOOM;
    this.state = {
      geoJson: {},
      defaultMapCenter: props.defaultMapCenter,
      focusPoint: props.focusPoint,
      initialZoom: props.setInitialZoom ? props.setInitialZoom : defaultZoom,
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
    if (!isEqual(newProps.focusPoint, this.state.focusPoint)) {
      this.usePosition(newProps.focusPoint, newProps.initialZoom);
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
    this.setState({
      mapTracking: true,
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

  usePosition(focusPoint, zoom) {
    this.setState({
      focusPoint,
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

    const useMapCoords = this.mapElement;
    mapLoaded = useMapCoords;
    if (this.state.mapTracking && position.hasLocation) {
      location = position;
    } else if (focusPoint) {
      location = focusPoint;
    } else if (useMapCoords) {
      // Map has to be loaded first, so we need correct coordinates at start. But after that (leafletElement exists)
      // we don't need correct coordinates. In fact trying to inject coordinates will mess up zooming and tracking.
      // This will also prevent situation when mapTracking is set to false, focus goes back to focusPoint.
      location = {};
    } else {
      location = this.state.defaultMapCenter;
    }
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
      >
        {children}
        <div className={btnClassName}>
          {renderCustomButtons && renderCustomButtons()}
          {position.hasLocation && (
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
