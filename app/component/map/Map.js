import React from 'react';
import elementResizeDetectorMaker from 'element-resize-detector';

import config from '../../config';
import PositionMarker from './PositionMarker';
import PlaceMarker from './PlaceMarker';
import { boundWithMinimumArea } from '../../util/geo-utils';

const isBrowser = typeof window !== 'undefined' && window !== null;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
let LeafletMap;
let TileLayer;
let L;

let TileLayerContainer;
let CityBikes;
let Stops;
let ParkAndRide;

let StopMarkerContainer;
let CityBikeMarkerContainer;

if (isBrowser) {
  LeafletMap = require('react-leaflet/lib/Map').default;
  TileLayer = require('react-leaflet/lib/TileLayer').default;
  L = require('leaflet');
  // Webpack handles this by bundling it with the other css files
  require('leaflet/dist/leaflet.css');

  TileLayerContainer = require('./tile-layer/TileLayerContainer').default;
  CityBikes = require('./tile-layer/CityBikes').default;
  Stops = require('./tile-layer/Stops').default;
  ParkAndRide = require('./tile-layer/ParkAndRide').default;

  StopMarkerContainer = require('./non-tile-layer/StopMarkerContainer').default;
  CityBikeMarkerContainer = require('./non-tile-layer/CityBikeMarkerContainer').default;
}

class Map extends React.Component {
  static propTypes = {
    bounds: React.PropTypes.array,
    boundsOptions: React.PropTypes.object,
    center: React.PropTypes.bool,
    className: React.PropTypes.string,
    children: React.PropTypes.node,
    disableMapTracking: React.PropTypes.func,
    disableZoom: React.PropTypes.bool,
    displayOriginPopup: React.PropTypes.bool,
    fitBounds: React.PropTypes.bool,
    hilightedStops: React.PropTypes.array,
    lat: React.PropTypes.number,
    lon: React.PropTypes.number,
    leafletEvents: React.PropTypes.object,
    leafletObjs: React.PropTypes.array,
    leafletOptions: React.PropTypes.object,
    padding: React.PropTypes.array,
    showStops: React.PropTypes.bool,
    zoom: React.PropTypes.number,
    showScaleBar: React.PropTypes.bool,
  };

  static defaultProps ={
    showScaleBar: false,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    piwik: React.PropTypes.object,
  };

  componentDidMount = () => {
    L.control.attribution({
      position: 'bottomleft',
      prefix: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(this.refs.map.leafletElement);

    if (this.props.showScaleBar) {
      L.control.scale({ imperial: false, position: 'bottomright' }).addTo(this.refs.map.leafletElement);
    }

    if (!this.props.disableZoom || L.Browser.touch) {
      L.control.zoom({ position: 'topleft' })
        .addTo(this.refs.map.leafletElement);
    }

    this.erd = elementResizeDetectorMaker({ strategy: 'scroll' });
    /* eslint-disable no-underscore-dangle */
    this.erd.listenTo(this.refs.map.leafletElement._container, this.resizeMap);
  }

  componentWillUnmount = () => {
    this.erd.removeListener(this.refs.map.leafletElement._container, this.resizeMap);
  }

  resizeMap = () => {
    if (this.refs.map) {
      this.refs.map.leafletElement.invalidateSize(false);
      if (this.props.fitBounds) {
        this.refs.map.leafletElement.fitBounds(
          boundWithMinimumArea(this.props.bounds),
          this.props.boundsOptions,
        );
      }
    }
  }

  render = () => {
    let map;
    let zoom;
    let origin;
    let layers;
    let leafletObjs;

    if (isBrowser) {
      leafletObjs = this.props.leafletObjs || [];

      if (config.map.useVectorTiles) {
        layers = [];

        if (this.props.showStops) {
          layers.push(Stops);

          if (config.cityBike && config.cityBike.showCityBikes) {
            layers.push(CityBikes);
          }

          if (config.parkAndRide && config.parkAndRide.showParkAndRide) {
            layers.push(ParkAndRide);
          }
        }

        leafletObjs.push(
          <TileLayerContainer
            key="tileLayer"
            layers={layers}
            hilightedStops={this.props.hilightedStops}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            disableMapTracking={this.props.disableMapTracking}
          />);
      } else if (this.props.showStops) {
        leafletObjs.push(
          <StopMarkerContainer
            key="stops"
            hilightedStops={this.props.hilightedStops}
            disableMapTracking={this.props.disableMapTracking}
            updateWhenIdle={false}
          />);

        if (config.cityBike.showCityBikes) {
          leafletObjs.push(<CityBikeMarkerContainer key="cityBikes" />);
        }
      }

      origin = this.context.getStore('EndpointStore').getOrigin();

      if (origin && origin.lat) {
        leafletObjs.push(
          <PlaceMarker
            position={origin}
            key="from"
            displayOriginPopup={this.props.displayOriginPopup}
          />);
      }

      leafletObjs.push(
        <PositionMarker key="position" displayOriginPopup={this.props.displayOriginPopup} />);

      const center = (!this.props.fitBounds && this.props.lat && this.props.lon &&
        [this.props.lat, this.props.lon]) || null;

      ({ zoom } = this.props);

      const boundsOptions = this.props.boundsOptions;

      if (this.props.padding) {
        boundsOptions.paddingTopLeft = this.props.padding;
      }

      map = (
        <LeafletMap
          {...{
            ref: 'map',
            center,
            zoom,
            zoomControl: false,
            attributionControl: false,
            bounds: (this.props.fitBounds && boundWithMinimumArea(this.props.bounds)) || undefined,
            animate: true,
            ...this.props.leafletOptions,
            boundsOptions,
            ...this.props.leafletEvents }}
        >
          <TileLayer
            url={`${config.URL.MAP}{z}/{x}/{y}{size}.png`}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            updateWhenIdle={false}
            size={(config.map.useRetinaTiles && L.Browser.retina) ? '@2x' : ''}
          />
          {leafletObjs}
        </LeafletMap>);
    }
    return (
      <div className={`map ${this.props.className ? this.props.className : ''}`}>
        {map}
        <div className="background-gradient" />
        {this.props.children}
      </div>);
  }
}

export default Map;
