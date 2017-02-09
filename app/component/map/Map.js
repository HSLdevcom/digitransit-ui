import React from 'react';
import elementResizeDetectorMaker from 'element-resize-detector';

import PositionMarker from './PositionMarker';
import PlaceMarker from './PlaceMarker';
import { boundWithMinimumArea } from '../../util/geo-utils';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { isBrowser } from '../../util/browser';
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
    bounds: React.PropTypes.array,
    boundsOptions: React.PropTypes.object,
    center: React.PropTypes.bool,
    className: React.PropTypes.string,
    children: React.PropTypes.node,
    disableMapTracking: React.PropTypes.func,
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
    config: React.PropTypes.object.isRequired,
    breakpoint: React.PropTypes.string.isRequired,
  };

  componentDidMount = () => {
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

  vectorTileLayerContainerModules = ({ VectorTileLayerContainer:
    () => importLazy(System.import('./tile-layer/VectorTileLayerContainer')),
  })

  stopMarkerContainerModules = { StopMarkerContainer:
    () => importLazy(System.import('./non-tile-layer/StopMarkerContainer')),
  }

  cityBikeMarkerContainerModules = { CityBikeMarkerContainer:
    () => importLazy(System.import('./non-tile-layer/CityBikeMarkerContainer')),
  }

  renderVectorTileLayerContainer = ({ VectorTileLayerContainer }) => (
    <VectorTileLayerContainer
      hilightedStops={this.props.hilightedStops}
      showStops={this.props.showStops}
      disableMapTracking={this.props.disableMapTracking}
    />
  )

  renderStopMarkerContainer = ({ StopMarkerContainer }) => (
    <StopMarkerContainer
      hilightedStops={this.props.hilightedStops}
      disableMapTracking={this.props.disableMapTracking}
      updateWhenIdle={false}
    />
  )

  renderCityBikeMarkerContainer = ({ CityBikeMarkerContainer }) => (<CityBikeMarkerContainer />)

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
          <LazilyLoad key="vector-tiles" modules={this.vectorTileLayerContainerModules}>
            {this.renderVectorTileLayerContainer}
          </LazilyLoad>,
        );
      } else if (this.props.showStops) {
        leafletObjs.push(
          <LazilyLoad key="stop-layer" modules={this.stopMarkerContainerModules}>
            {this.renderStopMarkerContainer}
          </LazilyLoad>,
          );

        if (config.cityBike.showCityBikes) {
          leafletObjs.push(
            <LazilyLoad key="citybikes" modules={this.cityBikeMarkerContainerModules}>
              {this.renderCityBikeMarkerContainer}
            </LazilyLoad>);
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

      let mapUrl = config.URL.MAP;
      if (mapUrl !== null && typeof mapUrl === 'object') {
        mapUrl = mapUrl[this.context.getStore('PreferencesStore').getLanguage()] || config.URL.MAP.default;
      }

      map = (
        <LeafletMap
          keyboard={false}
          ref="map"
          center={center}
          zoom={zoom}
          minZoom={1}
          zoomControl={false}
          attributionControl={false}
          bounds={(this.props.fitBounds && boundWithMinimumArea(this.props.bounds)) || undefined}
          animate
          {...this.props.leafletOptions}
          boundsOptions={boundsOptions}
          {...this.props.leafletEvents}
        >
          <TileLayer
            url={`${mapUrl}{z}/{x}/{y}{size}.png`}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            updateWhenIdle={false}
            size={(config.map.useRetinaTiles && L.Browser.retina) ? '@2x' : ''}
          />
          <AttributionControl
            position="bottomleft"
            prefix='&copy; <a tabindex="-1" href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          {this.props.showScaleBar && <ScaleControl imperial={false} position="bottomright" />}
          {this.context.breakpoint === 'large' && (
            <ZoomControl
              position="bottomleft"
              zoomInText={Icon.asString('icon-icon_plus')}
              zoomOutText={Icon.asString('icon-icon_minus')}
            />
          )}
          {leafletObjs}
        </LeafletMap>
      );
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
