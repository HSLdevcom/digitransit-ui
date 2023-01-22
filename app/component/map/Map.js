import PropTypes from 'prop-types';
import React from 'react';
import LeafletMap from 'react-leaflet/es/Map';
import TileLayer from 'react-leaflet/es/TileLayer';
import AttributionControl from 'react-leaflet/es/AttributionControl';
import ScaleControl from 'react-leaflet/es/ScaleControl';
import ZoomControl from 'react-leaflet/es/ZoomControl';
import L from 'leaflet';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
// Webpack handles this by bundling it with the other css files
import 'leaflet/dist/leaflet.css';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { isDebugTiles } from '../../util/browser';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import events from '../../util/events';
import { getLayerBaseUrl } from '../../util/mapLayerUtils';

import GeoJSON from './GeoJSON';

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_minus"/></svg>`;
const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_plus"/></svg>`;

/* foo-eslint-disable react/sort-comp */

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

export default class Map extends React.Component {
  static propTypes = {
    animate: PropTypes.bool,
    lat: PropTypes.number,
    lon: PropTypes.number,
    zoom: PropTypes.number,
    bounds: PropTypes.array,
    boundsOptions: PropTypes.object,
    hilightedStops: PropTypes.array,
    stopsToShow: PropTypes.array,
    lang: PropTypes.string.isRequired,
    leafletEvents: PropTypes.object,
    leafletObjs: PropTypes.array,
    mergeStops: PropTypes.bool,
    mapRef: PropTypes.func,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
    mapBottomPadding: PropTypes.number,
    buttonBottomPadding: PropTypes.number,
    bottomButtons: PropTypes.node,
    topButtons: PropTypes.node,
    geoJson: PropTypes.object,
    mapLayers: PropTypes.object,
  };

  static defaultProps = {
    animate: true,
    mapRef: null,
    locationPopup: 'reversegeocoding',
    boundsOptions: {},
    mapBottomPadding: 0,
    buttonBottomPadding: 0,
    bottomButtons: null,
    topButtons: null,
    mergeStops: true,
    mapLayers: { geoJson: {} },
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func,
    config: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { zoom: 14 };
  }

  updateZoom = () => {
    // eslint-disable-next-line no-underscore-dangle
    const zoom = this.map?.leafletElement?._zoom || this.props.zoom || 16;
    if (zoom !== this.state.zoom) {
      this.setState({ zoom });
    }
  };

  componentDidMount() {
    if (this.props.mapLayers.vehicles) {
      startClient(this.context);
    }
    this.updateZoom();
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    this.updateZoom();
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

  componentDidUpdate() {
    // move leaflet attribution control elements according to given padding
    // leaflet api doesn't allow controlling element position so have to use this hack
    const bottomControls = document.getElementsByClassName('leaflet-bottom');
    Array.prototype.forEach.call(bottomControls, elem => {
      // eslint-disable-next-line no-param-reassign
      elem.style.transform = `translate(0, -${this.props.buttonBottomPadding}px)`;
    });
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  onPopupopen = () => events.emit('popupOpened');

  zoomEnd = () => {
    this.props.leafletEvents?.onZoomend?.(); // pass event to parent
    this.updateZoom();
  };

  render() {
    const {
      zoom,
      lat,
      lon,
      boundsOptions,
      locationPopup,
      onSelectLocation,
      leafletObjs,
      geoJson,
      mapLayers,
    } = this.props;
    const { config } = this.context;

    const naviProps = {}; // these define map center and zoom
    if (this.props.bounds) {
      // bounds overrule center & zoom
      naviProps.bounds = boundWithMinimumArea(this.props.bounds); // validate
    } else if (lat && lon) {
      if (this.props.mapBottomPadding && this.props.mapBottomPadding > 0) {
        // bounds fitting can take account the wanted padding, so convert to bounds
        naviProps.bounds = boundWithMinimumArea([[lat, lon]], zoom);
      } else {
        naviProps.center = [lat, lon];
        if (zoom) {
          naviProps.zoom = zoom;
        }
      }
    }

    // When this option is set, the map restricts the view to the given geographical bounds,
    // bouncing the user back if the user tries to pan outside the view.
    const mapAreaBounds = L.latLngBounds(
      L.latLng(
        config.map.areaBounds.corner1[0],
        config.map.areaBounds.corner1[1],
      ),
      L.latLng(
        config.map.areaBounds.corner2[0],
        config.map.areaBounds.corner2[1],
      ),
    );
    naviProps.maxBounds = mapAreaBounds;

    if (naviProps.bounds || (naviProps.center && naviProps.zoom)) {
      this.ready = true;
    }

    if (!this.ready) {
      return null;
    }

    if (this.props.mapBottomPadding) {
      boundsOptions.paddingBottomRight = [0, this.props.mapBottomPadding];
    }
    const mapBaseUrl =
      (isDebugTiles &&
        `${config.URL.OTP}inspector/tile/traversal/{z}/{x}/{y}{size}.png`) ||
      getLayerBaseUrl(config.URL.MAP, this.props.lang);
    const mapUrl = config.hasAPISubscriptionQueryParameter
      ? `${mapBaseUrl}?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
      : mapBaseUrl;

    const leafletObjNew = leafletObjs.concat([
      <VectorTileLayerContainer
        key="vectorTileLayerContainer"
        hilightedStops={this.props.hilightedStops}
        mergeStops={this.props.mergeStops}
        stopsToShow={this.props.stopsToShow}
        locationPopup={locationPopup}
        onSelectLocation={onSelectLocation}
        mapLayers={this.props.mapLayers}
      />,
    ]);

    if (this.props.mapLayers.vehicles) {
      const useLargeIcon = this.state.zoom >= config.stopsMinZoom;
      leafletObjNew.push(
        <VehicleMarkerContainer key="vehicles" useLargeIcon={useLargeIcon} />,
      );
    }

    let attribution = get(config, 'map.attribution');
    if (!isString(attribution) || isEmpty(attribution)) {
      attribution = false;
    }

    if (geoJson) {
      Object.keys(geoJson)
        .filter(
          key =>
            mapLayers.geoJson[key] !== false &&
            (mapLayers.geoJson[key] === true ||
              geoJson[key].isOffByDefault !== true),
        )
        .forEach((key, i) => {
          leafletObjNew.push(
            <GeoJSON
              key={key.concat(i)}
              data={geoJson[key].data}
              geoJsonZoomLevel={this.state.zoom}
              locationPopup={locationPopup}
              onSelectLocation={onSelectLocation}
            />,
          );
        });
    }

    const leafletEvents = {
      ...this.props.leafletEvents,
      onZoomend: this.zoomEnd,
    };

    return (
      <div aria-hidden="true">
        <span>{this.props.topButtons}</span>
        <span
          className="overlay-mover"
          style={{
            transform: `translate(0, -${this.props.buttonBottomPadding}px)`,
          }}
        >
          {this.props.bottomButtons}
        </span>
        <LeafletMap
          {...naviProps}
          className={`z${this.state.zoom}`}
          keyboard={false}
          ref={el => {
            this.map = el;
            if (this.props.mapRef) {
              this.props.mapRef(el);
            }
          }}
          minZoom={config.map.minZoom}
          maxZoom={config.map.maxZoom}
          zoomControl={false}
          attributionControl={false}
          animate={this.props.animate}
          boundsOptions={boundsOptions}
          {...leafletEvents}
          onPopupopen={this.onPopupopen}
          closePopupOnClick={false}
        >
          <TileLayer
            url={mapUrl}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            updateWhenIdle={false}
            size={
              config.map.useRetinaTiles && L.Browser.retina && !isDebugTiles
                ? '@2x'
                : ''
            }
            minZoom={config.map.minZoom}
            maxZoom={config.map.maxZoom}
            attribution={attribution}
          />
          <BreakpointConsumer>
            {breakpoint =>
              attribution && (
                <AttributionControl
                  position={
                    breakpoint === 'large' ? 'bottomright' : 'bottomleft'
                  }
                  prefix=""
                />
              )
            }
          </BreakpointConsumer>
          {config.map.showScaleBar && (
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />
          )}
          <BreakpointConsumer>
            {breakpoint =>
              breakpoint === 'large' &&
              config.map.showZoomControl && (
                <ZoomControl
                  position={config.map.controls.zoom.position}
                  zoomInText={zoomInText}
                  zoomOutText={zoomOutText}
                />
              )
            }
          </BreakpointConsumer>
          {leafletObjNew}
          <PositionMarker key="position" />
        </LeafletMap>
      </div>
    );
  }
}
