const isBrowser = typeof window !== 'undefined' && window !== null;
import React from 'react';
import elementResizeDetectorMaker from 'element-resize-detector';
import config from '../../config';

import PositionMarker from './position-marker';
import PlaceMarker from './place-marker';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { startMeasuring, stopMeasuring } from '../../util/jankmeter';


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

  StopMarkerContainer = require('./non-tile-layer/stop-marker-container');
  CityBikeMarkerContainer = require('./non-tile-layer/city-bike-marker-container');
}

class Map extends React.Component {
  static propTypes = {
    bounds: React.PropTypes.array,
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
  };

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    piwik: React.PropTypes.object,
  };

  componentDidMount = () => {
    L.control.attribution({
      position: 'bottomleft',
      prefix: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(this.refs.map.getLeafletElement());

    if (!this.props.disableZoom || L.Browser.touch) {
      L.control.zoom({ position: 'topleft' }).
        addTo(this.refs.map.getLeafletElement());
    }

    this.erd = elementResizeDetectorMaker({ strategy: 'scroll' });
    /* eslint-disable no-underscore-dangle */
    this.erd.listenTo(this.refs.map.getLeafletElement()._container, this.resizeMap);
  }

  componentWillUnmount = () => {
    this.erd.removeListener(this.refs.map.getLeafletElement()._container, this.resizeMap);
  }

  resizeMap = () => {
    this.refs.map.getLeafletElement().invalidateSize();
  }

  startMeasuring = () => (
    startMeasuring()
  );

  stopMeasuring = () => {
    const results = stopMeasuring();

    if (results && context.piwiki != null) {
      context.piwik.trackEvent('perf', 'map-drag', 'min', Math.round(results.min));
      context.piwik.trackEvent('perf', 'map-drag', 'max', Math.round(results.max));
      context.piwik.trackEvent('perf', 'map-drag', 'avg', Math.round(results.avg));
    }
  }

  render = () => {
    let map;
    let boundsOptions;
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

          if (config.cityBike.showCityBikes) {
            layers.push(CityBikes);
          }
        }

        leafletObjs.push(
          <TileLayerContainer
            key="tileLayer"
            layers={layers}
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

      if (origin != null ? origin.lat : void 0) {
        leafletObjs.push(
          <PlaceMarker
            position={origin}
            key="from"
            displayOriginPopup={this.props.displayOriginPopup}
          />);
      }

      leafletObjs.push(
        <PositionMarker key="position" displayOriginPopup={this.props.displayOriginPopup} />);

      const center = (() => {
        if (!this.props.fitBounds && this.props.lat && this.props.lon) {
          return [this.props.lat, this.props.lon];
        }
        return void 0;
      })();

      ({ zoom } = this.props);

      boundsOptions = (() => {
        if (this.props.padding) {
          return {
            paddingTopLeft: this.props.padding,
          };
        }
        return void 0;
      })();

      map = (
        <LeafletMap
          {...{
            ref: 'map',
            center,
            zoom,
            zoomControl: false,
            attributionControl: false,
            bounds: (this.props.fitBounds ? boundWithMinimumArea(this.props.bounds) : void 0),
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
