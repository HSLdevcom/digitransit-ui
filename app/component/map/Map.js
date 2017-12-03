import PropTypes from 'prop-types';
import React from 'react';
import elementResizeDetectorMaker from 'element-resize-detector';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PositionMarker from './PositionMarker';
import { boundWithMinimumArea } from '../../util/geo-utils';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { isBrowser, isDebugTiles } from '../../util/browser';
import { dtLocationShape } from '../../util/shapes';

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
  LeafletMap = require('react-leaflet/es/Map').default;
  TileLayer = require('react-leaflet/es/TileLayer').default;
  AttributionControl = require('react-leaflet/es/AttributionControl').default;
  ScaleControl = require('react-leaflet/es/ScaleControl').default;
  ZoomControl = require('react-leaflet/es/ZoomControl').default;
  L = require('leaflet');
  require('leaflet-active-area');
  // Webpack handles this by bundling it with the other css files
  require('leaflet/dist/leaflet.css');
}

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_minus"/></svg>`;

const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_plus"/></svg>`;

class Map extends React.Component {
  static propTypes = {
    animate: PropTypes.bool,
    bounds: PropTypes.array,
    boundsOptions: PropTypes.object,
    center: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    disableMapTracking: PropTypes.func,
    fitBounds: PropTypes.bool,
    hideOrigin: PropTypes.bool,
    hilightedStops: PropTypes.array,
    lang: PropTypes.string.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    leafletEvents: PropTypes.object,
    leafletObjs: PropTypes.array,
    leafletOptions: PropTypes.object,
    origin: dtLocationShape,
    padding: PropTypes.array,
    showStops: PropTypes.bool,
    zoom: PropTypes.number,
    showScaleBar: PropTypes.bool,
    loaded: PropTypes.func,
    disableZoom: PropTypes.bool,
    activeArea: PropTypes.string,
  };

  static defaultProps = {
    animate: true,
    loaded: () => {},
    origin: null,
    showScaleBar: false,
    activeArea: null,
  };

  static contextTypes = {
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

  renderVectorTileLayerContainer = ({ VectorTileLayerContainer }) => (
    <VectorTileLayerContainer
      hilightedStops={this.props.hilightedStops}
      showStops={this.props.showStops}
      disableMapTracking={this.props.disableMapTracking}
    />
  );

  renderStopMarkerContainer = ({ StopMarkerContainer }) => (
    <StopMarkerContainer
      hilightedStops={this.props.hilightedStops}
      disableMapTracking={this.props.disableMapTracking}
      updateWhenIdle={false}
    />
  );

  renderCityBikeMarkerContainer = ({ CityBikeMarkerContainer }) => (
    <CityBikeMarkerContainer />
  );

  render = () => {
    let map;
    let zoom;
    let leafletObjs;
    const { config } = this.context;

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

      leafletObjs.push(<PositionMarker key="position" />);

      const center =
        (!this.props.fitBounds &&
          this.props.lat &&
          this.props.lon && [this.props.lat, this.props.lon]) ||
        null;

      ({ zoom } = this.props);

      const { boundsOptions } = this.props;

      if (this.props.padding) {
        boundsOptions.paddingTopLeft = this.props.padding;
      }

      let mapUrl =
        (isDebugTiles && `${config.URL.OTP}inspector/tile/traversal/`) ||
        config.URL.MAP;
      if (mapUrl !== null && typeof mapUrl === 'object') {
        mapUrl = mapUrl[this.props.lang] || config.URL.MAP.default;
      }

      map = (
        <LeafletMap
          keyboard={false}
          ref={el => {
            this.map = el;
            if (el && this.props.activeArea) {
              el.leafletElement.setActiveArea(this.props.activeArea);
            }
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
          animate={this.props.animate}
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
          {this.props.showScaleBar && (
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />
          )}
          {this.context.breakpoint === 'large' &&
            !this.props.disableZoom && (
              <ZoomControl
                position={config.map.controls.zoom.position}
                zoomInText={zoomInText}
                zoomOutText={zoomOutText}
              />
            )}
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

export default connectToStores(Map, ['PreferencesStore'], context => ({
  lang: context.getStore('PreferencesStore').getLanguage(),
}));
