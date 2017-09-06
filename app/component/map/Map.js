import PropTypes from 'prop-types';
import React from 'react';
import elementResizeDetectorMaker from 'element-resize-detector';

import PositionMarker from './PositionMarker';
import PlaceMarker from './PlaceMarker';
import { boundWithMinimumArea } from '../../util/geo-utils';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { isBrowser, isDebugTiles } from '../../util/browser';
import Icon from '../Icon';

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
let LeafletMap;
let TileLayer;
let AttributionControl;
let ScaleControl;
let ZoomControl;
let L;

if (isBrowser) {
  LeafletMap = require('react-leaflet/lib/Map').default;
  TileLayer = require('react-leaflet/lib/TileLayer').default;
  AttributionControl = require('react-leaflet/lib/AttributionControl').default;
  ScaleControl = require('react-leaflet/lib/ScaleControl').default;
  ZoomControl = require('react-leaflet/lib/ZoomControl').default;
  L = require('leaflet');
  // Webpack handles this by bundling it with the other css files
  require('leaflet/dist/leaflet.css');
}

class Map extends React.Component {
  static propTypes = {
    bounds: PropTypes.array,
    boundsOptions: PropTypes.object,
    center: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    disableMapTracking: PropTypes.func,
    displayOriginPopup: PropTypes.bool,
    fitBounds: PropTypes.bool,
    hideOrigin: PropTypes.bool,
    hilightedStops: PropTypes.array,
    lat: PropTypes.number,
    lon: PropTypes.number,
    leafletEvents: PropTypes.object,
    leafletObjs: PropTypes.array,
    leafletOptions: PropTypes.object,
    padding: PropTypes.array,
    showStops: PropTypes.bool,
    zoom: PropTypes.number,
    showScaleBar: PropTypes.bool,
    loaded: PropTypes.function,
  };

  static defaultProps = {
    showScaleBar: false,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    piwik: PropTypes.object,
    config: PropTypes.object.isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  componentDidMount = () => {
    this.erd = elementResizeDetectorMaker({ strategy: 'scroll' });
    /* eslint-disable no-underscore-dangle */
    this.erd.listenTo(this.map.leafletElement._container, this.resizeMap);
  };

  componentWillUnmount = () => {
    this.erd.removeListener(this.map.leafletElement._container, this.resizeMap);
  };

  setLoaded = () => {
    this.props.loaded();
  };

  resizeMap = () => {
    if (this.map) {
      this.map.leafletElement.invalidateSize(false);
      if (this.props.fitBounds) {
        this.map.leafletElement.fitBounds(
          boundWithMinimumArea(this.props.bounds),
          this.props.boundsOptions,
        );
      }
    }
  };

  vectorTileLayerContainerModules = {
    VectorTileLayerContainer: () =>
      importLazy(
        import(/* webpackChunkName: "vector-tiles" */ './tile-layer/VectorTileLayerContainer'),
      ),
  };

  stopMarkerContainerModules = {
    StopMarkerContainer: () =>
      importLazy(
        import(/* webpackChunkName: "vector-tiles" */ './non-tile-layer/StopMarkerContainer'),
      ),
  };

  cityBikeMarkerContainerModules = {
    CityBikeMarkerContainer: () =>
      importLazy(
        import(/* webpackChunkName: "vector-tiles" */ './non-tile-layer/CityBikeMarkerContainer'),
      ),
  };

  renderVectorTileLayerContainer = ({ VectorTileLayerContainer }) =>
    <VectorTileLayerContainer
      hilightedStops={this.props.hilightedStops}
      showStops={this.props.showStops}
      disableMapTracking={this.props.disableMapTracking}
    />;

  renderStopMarkerContainer = ({ StopMarkerContainer }) =>
    <StopMarkerContainer
      hilightedStops={this.props.hilightedStops}
      disableMapTracking={this.props.disableMapTracking}
      updateWhenIdle={false}
    />;

  renderCityBikeMarkerContainer = ({ CityBikeMarkerContainer }) =>
    <CityBikeMarkerContainer />;

  render = () => {
    let map;
    let zoom;
    let origin;
    let leafletObjs;
    const config = this.context.config;

    if (isBrowser) {
      leafletObjs = this.props.leafletObjs || [];

      if (config.map.useVectorTiles) {
        leafletObjs.push(
          <LazilyLoad
            key="vector-tiles"
            modules={this.vectorTileLayerContainerModules}
          >
            {this.renderVectorTileLayerContainer}
          </LazilyLoad>,
        );
      } else if (this.props.showStops) {
        leafletObjs.push(
          <LazilyLoad
            key="stop-layer"
            modules={this.stopMarkerContainerModules}
          >
            {this.renderStopMarkerContainer}
          </LazilyLoad>,
        );

        if (config.cityBike.showCityBikes) {
          leafletObjs.push(
            <LazilyLoad
              key="citybikes"
              modules={this.cityBikeMarkerContainerModules}
            >
              {this.renderCityBikeMarkerContainer}
            </LazilyLoad>,
          );
        }
      }

      origin = this.context.getStore('EndpointStore').getOrigin();

      if (origin && origin.lat && !this.props.hideOrigin) {
        leafletObjs.push(
          <PlaceMarker
            position={origin}
            key="from"
            displayOriginPopup={this.props.displayOriginPopup}
          />,
        );
      }

      leafletObjs.push(
        <PositionMarker
          key="position"
          displayOriginPopup={this.props.displayOriginPopup}
        />,
      );

      const center =
        (!this.props.fitBounds &&
        this.props.lat &&
        this.props.lon && [this.props.lat, this.props.lon]) ||
        null;

      ({ zoom } = this.props);

      const boundsOptions = this.props.boundsOptions;

      if (this.props.padding) {
        boundsOptions.paddingTopLeft = this.props.padding;
      }

      let mapUrl =
        (isDebugTiles && `${config.URL.OTP}inspector/tile/traversal/`) ||
        config.URL.MAP;
      if (mapUrl !== null && typeof mapUrl === 'object') {
        mapUrl =
          mapUrl[this.context.getStore('PreferencesStore').getLanguage()] ||
          config.URL.MAP.default;
      }

      map = (
        <LeafletMap
          keyboard={false}
          ref={el => {
            this.map = el;
          }}
          center={center}
          zoom={zoom}
          minZoom={this.context.config.map.minZoom}
          maxZoom={this.context.config.map.maxZoom}
          zoomControl={false}
          attributionControl={false}
          bounds={
            (this.props.fitBounds && boundWithMinimumArea(this.props.bounds)) ||
            undefined
          }
          animate={false}
          {...this.props.leafletOptions}
          boundsOptions={boundsOptions}
          {...this.props.leafletEvents}
        >
          <TileLayer
            onLoad={() => this.setLoaded()}
            url={`${mapUrl}{z}/{x}/{y}{size}.png`}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            updateWhenIdle={false}
            size={
              config.map.useRetinaTiles && L.Browser.retina && !isDebugTiles
                ? '@2x'
                : ''
            }
            minZoom={this.context.config.map.minZoom}
            maxZoom={this.context.config.map.maxZoom}
          />
          <AttributionControl
            position="bottomleft"
            prefix="&copy; <a tabindex=&quot;-1&quot; href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a>"
          />
          {this.props.showScaleBar &&
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />}
          {this.context.breakpoint === 'large' &&
            <ZoomControl
              position={config.map.controls.zoom.position}
              zoomInText={Icon.asString('icon-icon_plus')}
              zoomOutText={Icon.asString('icon-icon_minus')}
            />}
          {leafletObjs}
        </LeafletMap>
      );
    }
    return (
      <div
        className={`map ${this.props.className ? this.props.className : ''}`}
      >
        {map}
        <div className="background-gradient" />
        {this.props.children}
      </div>
    );
  };
}

export default Map;
