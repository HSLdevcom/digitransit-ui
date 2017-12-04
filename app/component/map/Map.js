import PropTypes from 'prop-types';
import React from 'react';

import elementResizeDetectorMaker from 'element-resize-detector';

import LeafletMap from 'react-leaflet/es/Map';
import TileLayer from 'react-leaflet/es/TileLayer';
import AttributionControl from 'react-leaflet/es/AttributionControl';
import ScaleControl from 'react-leaflet/es/ScaleControl';
import ZoomControl from 'react-leaflet/es/ZoomControl';
import L from 'leaflet';
import 'leaflet-active-area';
// Webpack handles this by bundling it with the other css files
import 'leaflet/dist/leaflet.css';

import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { isDebugTiles } from '../../util/browser';

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_minus"/></svg>`;

const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_plus"/></svg>`;

export default class Map extends React.Component {
  static propTypes = {
    animate: PropTypes.bool,
    bounds: PropTypes.array,
    boundsOptions: PropTypes.object,
    center: PropTypes.bool,
    disableMapTracking: PropTypes.func,
    fitBounds: PropTypes.bool,
    hilightedStops: PropTypes.array,
    lang: PropTypes.string.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    leafletEvents: PropTypes.object,
    leafletObjs: PropTypes.array,
    leafletOptions: PropTypes.object,
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

  render() {
    const { zoom, boundsOptions } = this.props;
    const { config } = this.context;

    const center =
      (!this.props.fitBounds &&
        this.props.lat &&
        this.props.lon && [this.props.lat, this.props.lon]) ||
      null;

    if (this.props.padding) {
      boundsOptions.paddingTopLeft = this.props.padding;
    }

    let mapUrl =
      (isDebugTiles && `${config.URL.OTP}inspector/tile/traversal/`) ||
      config.URL.MAP;
    if (mapUrl !== null && typeof mapUrl === 'object') {
      mapUrl = mapUrl[this.props.lang] || config.URL.MAP.default;
    }

    return (
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
        minZoom={config.map.minZoom}
        maxZoom={config.map.maxZoom}
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
          onLoad={this.setLoaded}
          url={`${mapUrl}{z}/{x}/{y}{size}.png`}
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
        {this.props.leafletObjs}
        <VectorTileLayerContainer
          hilightedStops={this.props.hilightedStops}
          showStops={this.props.showStops}
          disableMapTracking={this.props.disableMapTracking}
        />
        <PositionMarker key="position" />
      </LeafletMap>
    );
  }
}
