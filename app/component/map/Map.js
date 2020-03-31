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

import { withRouter, routerShape } from 'react-router';
import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { isDebugTiles } from '../../util/browser';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import events from '../../util/events';
import { MapMode } from '../../constants';

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_minus"/></svg>`;

const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_plus"/></svg>`;

class Map extends React.Component {
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
    mapRef: PropTypes.func,
    mapMode: PropTypes.string,
  };

  static defaultProps = {
    animate: true,
    loaded: () => {},
    showScaleBar: false,
    activeArea: null,
    mapRef: null,
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape,
  };

  componentDidMount() {
    this.erd = elementResizeDetectorMaker({ strategy: 'scroll' });
    /* eslint-disable no-underscore-dangle */
    this.erd.listenTo(this.map.leafletElement._container, this.resizeMap);
  }

  componentWillUnmount() {
    this.erd.removeListener(this.map.leafletElement._container, this.resizeMap);
  }

  onPopupopen = () => events.emit('popupOpened');

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

  loadMapLayers(mapUrl) {
    return (
      <TileLayer
        onLoad={this.setLoaded}
        url={mapUrl}
        tileSize={this.context.config.map.tileSize || 256}
        zoomOffset={this.context.config.map.zoomOffset || 0}
        updateWhenIdle={false}
        size={
          this.context.config.map.useRetinaTiles &&
          L.Browser.retina &&
          !isDebugTiles
            ? '@2x'
            : ''
        }
        minZoom={this.context.config.map.minZoom}
        maxZoom={this.context.config.map.maxZoom}
      />
    );
  }

  render() {
    const { zoom, boundsOptions } = this.props;
    const { config, router } = this.context;

    const center =
      (!this.props.fitBounds &&
        this.props.lat &&
        this.props.lon && [this.props.lat, this.props.lon]) ||
      null;

    if (this.props.padding) {
      boundsOptions.paddingTopLeft = this.props.padding;
    }

    const mapUrls = [];
    if (isDebugTiles) {
      mapUrls.push(`${config.URL.OTP}inspector/tile/traversal/{z}/{x}/{y}.png`);
    } else if (router.location.query.mapMode === MapMode.Satellite) {
      mapUrls.push(config.URL.MAP.satellite);
      mapUrls.push(config.URL.MAP.semiTransparent);
    } else if (router.location.query.mapMode === MapMode.Bicycle) {
      mapUrls.push(config.URL.MAP.bikeMap);
    } else {
      mapUrls.push(config.URL.MAP.default);
    }

    /*
    if (mapUrl !== null && typeof mapUrl === 'object') {
      mapUrl = mapUrl[this.props.lang] || config.URL.MAP.default;
    }
    */

    const attribution = config.map.attribution[router.location.query.mapMode];

    return (
      <div aria-hidden="true">
        <LeafletMap
          keyboard={false}
          ref={el => {
            this.map = el;
            if (this.props.mapRef) {
              this.props.mapRef(el);
            }
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
          onPopupopen={this.onPopupopen}
          closePopupOnClick={false}
        >
          {mapUrls.map(url => this.loadMapLayers(url))}
          <AttributionControl
            position="bottomright"
            prefix={
              attribution ||
              '&copy; <a tabindex=-1 href=http://osm.org/copyright>OpenStreetMap</a>'
            }
          />
          {this.props.showScaleBar && (
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />
          )}
          <BreakpointConsumer>
            {breakpoint =>
              breakpoint === 'large' &&
              !this.props.disableZoom && (
                <ZoomControl
                  position={config.map.controls.zoom.position}
                  zoomInText={zoomInText}
                  zoomOutText={zoomOutText}
                />
              )
            }
          </BreakpointConsumer>
          {this.props.leafletObjs}
          <VectorTileLayerContainer
            hilightedStops={this.props.hilightedStops}
            showStops={this.props.showStops}
            disableMapTracking={this.props.disableMapTracking}
          />
          <PositionMarker key="position" />
        </LeafletMap>
      </div>
    );
  }
}

export default withRouter(Map);
