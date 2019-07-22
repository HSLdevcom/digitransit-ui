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
import { isBrowser } from '../../util/browser';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import PositionStore from '../../store/PositionStore';
import GeoJsonStore from '../../store/GeoJsonStore';
import MessageStore from '../../store/MessageStore';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../../action/realTimeClientAction';
import { findFeatures } from '../../util/geo-utils';
import { updateMessage } from '../../action/MessageActions';

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

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};

const jsonModules = {
  GeoJSON: () => importLazy(import(/* webpackChunkName: "map" */ './GeoJSON')),
};

const Component = onlyUpdateCoordChanges(MapContainer);

class MapWithTrackingStateHandler extends React.Component {
  static propTypes = {
    getGeoJsonConfig: PropTypes.func.isRequired,
    getGeoJsonData: PropTypes.func.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
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
    }).isRequired,
    children: PropTypes.array,
    renderCustomButtons: PropTypes.func,
    mapLayers: mapLayerShape.isRequired,
    messages: PropTypes.array,
  };

  static defaultProps = {
    renderCustomButtons: undefined,
  };

  constructor(props) {
    super(props);
    const hasOriginorPosition =
      props.origin.ready ||
      props.position.hasLocation ||
      props.destination.ready;
    this.state = {
      geoJson: {},
      initialZoom: hasOriginorPosition ? FOCUS_ZOOM : DEFAULT_ZOOM,
      mapTracking: props.origin.gps && props.position.hasLocation,
      focusOnOrigin: props.origin.ready,
      focusOnDestination: !props.origin.ready && props.destination.ready,
      origin: props.origin,
      destination: props.destination,
      shouldShowDefaultLocation: !hasOriginorPosition,
    };
  }

  async componentDidMount() {
    const { config, getGeoJsonData, getGeoJsonConfig } = this.props;
    if (
      !isBrowser ||
      !config.geoJson ||
      (!Array.isArray(config.geoJson.layers) && !config.geoJson.layerConfigUrl)
    ) {
      return;
    }

    const layers = config.geoJson.layerConfigUrl
      ? await getGeoJsonConfig(config.geoJson.layerConfigUrl)
      : config.geoJson.layers;
    if (!Array.isArray(layers) || layers.length === 0) {
      return;
    }

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
    if (config.showAllBusses) {
      this.startClient();
    }

    if (this.state.focusOnOrigin || this.state.focusOnDestination) {
      const lat = this.state.focusOnDestination
        ? this.state.destination.lat
        : this.state.origin.lat;
      const lon = this.state.focusOnDestination
        ? this.state.destination.lon
        : this.state.origin.lon;
      this.triggerMessage(lat, lon);
    }
  }

  componentWillReceiveProps(newProps) {
    if (
      // "current position selected"
      newProps.origin.lat !== null &&
      newProps.origin.lon !== null &&
      newProps.origin.gps === true &&
      ((this.state.origin.ready === false && newProps.origin.ready === true) ||
        !this.state.origin.gps) // current position selected
    ) {
      this.usePosition(newProps.origin);
      this.triggerMessage(newProps.origin.lat, newProps.origin.lon);
    } else if (
      // "current position selected"
      newProps.destination.lat !== null &&
      newProps.destination.lon !== null &&
      newProps.destination.gps === true &&
      ((this.state.destination.ready === false &&
        newProps.destination.ready === true) ||
        !this.state.destination.gps) // current position selected
    ) {
      this.usePosition(newProps.destination);
      this.triggerMessage(newProps.destination.lat, newProps.destination.lon);
    } else if (
      // "poi selected"
      !newProps.origin.gps &&
      (newProps.origin.lat !== this.state.origin.lat ||
        newProps.origin.lon !== this.state.origin.lon) &&
      newProps.origin.lat != null &&
      newProps.origin.lon != null
    ) {
      this.useOrigin(newProps.origin);
      this.triggerMessage(newProps.origin.lat, newProps.origin.lon);
    } else if (
      // destination selected without poi
      !newProps.destination.gps &&
      (newProps.destination.lat !== this.state.destination.lat ||
        newProps.destination.lon !== this.state.destination.lon) &&
      newProps.destination.lat != null &&
      newProps.destination.lon != null
    ) {
      this.useDestination(newProps.destination);
      this.triggerMessage(newProps.destination.lat, newProps.destination.lon);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.config.showAllBusses &&
      (prevProps.origin.lat !== this.state.origin.lat ||
        prevProps.origin.lon !== this.state.origin.lon)
    ) {
      this.updateClient();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
    if (this.props.config.showAllBusses) {
      this.removeClient();
    }
  }

  updateCurrentBounds = () => {
    if (!this.mapElement || !this.mapElement.leafletElement) {
      return;
    }
    const newBounds = this.mapElement.leafletElement.getBounds();
    const { bounds } = this.state;
    if (bounds && bounds.equals(newBounds)) {
      return;
    }
    this.setState({
      bounds: newBounds,
    });
  };

  setMapElementRef = element => {
    if (element && this.mapElement !== element) {
      this.mapElement = element;
    }
  };

  disableMapTracking = () => {
    this.setState({
      mapTracking: false,
      focusOnOrigin: false,
      focusOnDestination: false,
    });
  };

  enableMapTracking = () => {
    this.setState({
      mapTracking: true,
      focusOnOrigin: false,
      focusOnDestination: false,
    });
  };

  createGeoHashBoundingBox = location => {
    const geoHashes = [];
    for (let i = -3; i <= 3; i++) {
      const lon = (location.lon + i * 0.01).toString();
      for (let j = -1; j <= 1; j++) {
        const lat = (location.lat + j * 0.01).toString();
        geoHashes.push([
          `${lat.substring(0, 2)};${lon.substring(0, 2)}`,
          lat.substring(3, 4) + lon.substring(3, 4),
          lat.substring(4, 5) + lon.substring(4, 5),
          '+',
        ]);
      }
    }
    return geoHashes;
  };

  triggerMessage = (lat, lon) => {
    const messages = this.props.messages.filter(
      msg => !msg.shouldTrigger && msg.content,
    );
    messages.forEach(msg => {
      return new Promise(resolve => {
        resolve(this.props.getGeoJsonData(msg.geoJson));
      }).then(value => {
        const data = findFeatures(
          { lat, lon },
          (value && value.data && value.data.features) || [],
        );
        if (data.length > 0) {
          msg.shouldTrigger = true; // eslint-disable-line no-param-reassign
          this.context.executeAction(updateMessage, msg);
        }
      });
    });
  };

  startClient() {
    const { realTime, defaultEndpoint } = this.props.config;
    const agency = this.props.config.feedIds[0];
    const source = realTime[agency];
    const location = this.props.origin.set
      ? this.props.origin
      : defaultEndpoint;
    const options = [];
    const geoHashes = this.createGeoHashBoundingBox(location);
    geoHashes.forEach(geoHash => {
      options.push({
        mode: '+',
        gtfsId: '+',
        headsign: '+',
        geoHash,
      });
    });
    if (source && source.active) {
      this.context.executeAction(startRealTimeClient, {
        ...source,
        agency,
        options,
      });
    }
  }

  updateClient() {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );
    if (client) {
      const { realTime, defaultEndpoint } = this.props.config;
      const agency = this.props.config.feedIds[0];
      const source = realTime[agency];
      const location = this.props.origin.set
        ? this.props.origin
        : defaultEndpoint;
      const options = [];
      const geoHashes = this.createGeoHashBoundingBox(location);
      geoHashes.forEach(geoHash => {
        options.push({
          mode: '+',
          gtfsId: '+',
          headsign: '+',
          geoHash,
        });
      });
      if (source && source.active) {
        this.context.executeAction(changeRealTimeClientTopics, {
          ...source,
          agency,
          options,
          client,
          oldTopics: topics,
        });
      }
    }
  }

  removeClient() {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  usePosition(origin) {
    this.setState(prevState => ({
      origin,
      mapTracking: true,
      focusOnOrigin: false,
      focusOnDestination: false,
      initialZoom:
        prevState.initialZoom === DEFAULT_ZOOM ? FOCUS_ZOOM : undefined,
      shouldShowDefaultLocation: false,
    }));
  }

  useOrigin(origin) {
    this.setState(prevState => ({
      origin,
      mapTracking: false,
      focusOnOrigin: true,
      focusOnDestination: false,
      initialZoom:
        prevState.initialZoom === DEFAULT_ZOOM ? FOCUS_ZOOM : undefined,
      shouldShowDefaultLocation: false,
    }));
  }

  useDestination(destination) {
    this.setState(prevState => ({
      destination,
      mapTracking: false,
      focusOnOrigin: false,
      focusOnDestination: true,
      initialZoom:
        prevState.initialZoom === DEFAULT_ZOOM ? FOCUS_ZOOM : undefined,
      shouldShowDefaultLocation: false,
    }));
  }

  render() {
    const {
      position,
      origin,
      destination,
      config,
      children,
      renderCustomButtons,
      mapLayers,
      ...rest
    } = this.props;
    const { geoJson } = this.state;
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
    } else if (
      this.state.focusOnDestination &&
      !this.state.destination.gps &&
      this.state.destination.lat != null &&
      this.state.destination.lon != null
    ) {
      location = this.state.destination;
    } else if (this.state.shouldShowDefaultLocation) {
      location = config.defaultMapCenter || config.defaultEndpoint;
    }
    const leafletObjs = [];
    if (mapLayers.showAllBusses) {
      const currentZoom =
        this.mapElement && this.mapElement.leafletElement
          ? this.mapElement.leafletElement._zoom // eslint-disable-line no-underscore-dangle
          : -1;
      const useLargeIcon = currentZoom >= this.props.config.stopsMinZoom;
      leafletObjs.push(
        <VehicleMarkerContainer
          key="vehicles"
          pattern="+"
          headsign="+"
          tripStart="+"
          useLargeIcon={useLargeIcon}
        />,
      );
    }

    if (origin && origin.ready === true) {
      leafletObjs.push(
        <LazilyLoad modules={locationMarkerModules} key="from">
          {({ LocationMarker }) => (
            <LocationMarker position={origin} type="from" />
          )}
        </LazilyLoad>,
      );
    }
    if (destination && destination.ready === true) {
      leafletObjs.push(
        <LazilyLoad modules={locationMarkerModules} key="to">
          {({ LocationMarker }) => (
            <LocationMarker position={destination} type="to" />
          )}
        </LazilyLoad>,
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
    return (
      <Component
        lat={location ? location.lat : null}
        lon={location ? location.lon : null}
        zoom={this.state.initialZoom}
        mapTracking={this.state.mapTracking}
        className="flex-grow"
        origin={origin}
        destination={destination}
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
        <div className="map-with-tracking-buttons">
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
};

// todo convert to use origin prop
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
