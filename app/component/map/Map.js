import PropTypes from 'prop-types';
import React from 'react';

import elementResizeDetectorMaker from 'element-resize-detector';

import LeafletMap from 'react-leaflet/es/Map';
import TileLayer from 'react-leaflet/es/TileLayer';
import AttributionControl from 'react-leaflet/es/AttributionControl';
import ScaleControl from 'react-leaflet/es/ScaleControl';
import ZoomControl from 'react-leaflet/es/ZoomControl';
import L from 'leaflet';
// Webpack handles this by bundling it with the other css files
import 'leaflet/dist/leaflet.css';

import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { isDebugTiles } from '../../util/browser';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import events from '../../util/events';

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
    stopsNearYouMode: PropTypes.string,
    zoom: PropTypes.number,
    showScaleBar: PropTypes.bool,
    loaded: PropTypes.func,
    disableZoom: PropTypes.bool,
    mapRef: PropTypes.func,
    originFromMap: PropTypes.bool,
    destinationFromMap: PropTypes.bool,
    disableLocationPopup: PropTypes.bool,
  };

  static defaultProps = {
    animate: true,
    loaded: () => {},
    showScaleBar: false,
    mapRef: null,
    disableLocationPopup: false,
    boundsOptions: {},
  };

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
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

  render() {
    const {
      zoom,
      boundsOptions,
      disableLocationPopup,
      leafletObjs,
    } = this.props;
    const { config } = this.context;
    const center =
      (!this.props.fitBounds &&
        this.props.lat &&
        this.props.lon && [this.props.lat, this.props.lon]) ||
      null;

    if (this.props.padding) {
      boundsOptions.paddingTopLeft = this.props.padding;
    }
    if (center && zoom) {
      boundsOptions.maxZoom = zoom;
    }
    let mapUrl =
      (isDebugTiles && `${config.URL.OTP}inspector/tile/traversal/`) ||
      config.URL.MAP;
    if (mapUrl !== null && typeof mapUrl === 'object') {
      mapUrl = mapUrl[this.props.lang] || config.URL.MAP.default;
    }
    if (!this.props.originFromMap && !this.props.destinationFromMap) {
      leafletObjs.push(
        <VectorTileLayerContainer
          hilightedStops={this.props.hilightedStops}
          stopsNearYouMode={this.props.stopsNearYouMode}
          showStops={this.props.showStops}
          disableMapTracking={this.props.disableMapTracking}
          disableLocationPopup={disableLocationPopup}
        />,
      );
    }
    return (
      <div aria-hidden="true">
        <LeafletMap
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
          bounds={
            this.props.fitBounds
              ? boundWithMinimumArea(this.props.bounds)
              : boundWithMinimumArea([center])
          }
          animate={this.props.animate}
          {...this.props.leafletOptions}
          boundsOptions={boundsOptions}
          {...this.props.leafletEvents}
          onPopupopen={
            !this.props.originFromMap && !this.props.destinationFromMap
              ? this.onPopupopen
              : null
          }
          closePopupOnClick={false}
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
          <BreakpointConsumer>
            {breakpoint =>
              config.map.showOSMCopyright && (
                <AttributionControl
                  position={
                    breakpoint === 'large' ? 'bottomright' : 'bottomleft'
                  }
                  prefix='<a tabindex="-1" href="http://osm.org/copyright">&copy; OpenStreetMap</a>'
                />
              )
            }
          </BreakpointConsumer>
          {this.props.showScaleBar && config.map.showScaleBar && (
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />
          )}
          <BreakpointConsumer>
            {breakpoint =>
              breakpoint === 'large' &&
              !this.props.disableZoom &&
              config.map.showZoomControl && (
                <ZoomControl
                  position={config.map.controls.zoom.position}
                  zoomInText={zoomInText}
                  zoomOutText={zoomOutText}
                />
              )
            }
          </BreakpointConsumer>
          {leafletObjs}

          {!this.props.originFromMap && !this.props.destinationFromMap && (
            <PositionMarker key="position" />
          )}
        </LeafletMap>
      </div>
    );
  }
}
