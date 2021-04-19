import PropTypes from 'prop-types';
import React from 'react';

import elementResizeDetectorMaker from 'element-resize-detector';

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

import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { isDebugTiles } from '../../util/browser';
import { BreakpointConsumer } from '../../util/withBreakpoint';
import events from '../../util/events';

import GeoJSON from './GeoJSON';

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_minus"/></svg>`;

const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_plus"/></svg>`;

export default class Map extends React.Component {
  static propTypes = {
    animate: PropTypes.bool,
    bounds: PropTypes.array,
    boundsOptions: PropTypes.object,
    center: PropTypes.bool,
    fitBounds: PropTypes.bool,
    hilightedStops: PropTypes.array,
    stopsToShow: PropTypes.array,
    lang: PropTypes.string.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    leafletEvents: PropTypes.object,
    leafletObjs: PropTypes.array,
    leafletOptions: PropTypes.object,
    stopsNearYouMode: PropTypes.string,
    zoom: PropTypes.number,
    showScaleBar: PropTypes.bool,
    mapRef: PropTypes.func,
    locationPopup: PropTypes.string,
    onSelectLocation: PropTypes.func,
    mapBottomPadding: PropTypes.number,
    buttonBottomPadding: PropTypes.number,
    bottomButtons: PropTypes.node,
    geoJson: PropTypes.object,
    mapLayers: PropTypes.object,
  };

  static defaultProps = {
    animate: true,
    showScaleBar: false,
    mapRef: null,
    locationPopup: 'reversegeocoding',
    boundsOptions: {},
    mapBottomPadding: 0,
    buttonBottomPadding: 0,
    bottomButtons: null,
    mapLayers: { geoJson: {} },
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
    this.erd.removeListener(this.map.leafletElement._container, this.resizeMap);
  }

  onPopupopen = () => events.emit('popupOpened');

  resizeMap = () => {
    if (this.map) {
      this.map.leafletElement.invalidateSize(false);
      if (this.props.fitBounds) {
        this.map.leafletElement.fitBounds(
          boundWithMinimumArea(this.props.bounds),
          this.props.boundsOptions,
        );
      }
      this.mapZoomLvl = this.map.leafletElement._zoom;
    }
  };

  render() {
    const {
      zoom,
      boundsOptions,
      locationPopup,
      onSelectLocation,
      leafletObjs,
      geoJson,
      mapLayers,
    } = this.props;
    const { config } = this.context;
    const center =
      (!this.props.fitBounds &&
        this.props.lat &&
        this.props.lon && [this.props.lat, this.props.lon]) ||
      null;
    if (center && zoom) {
      boundsOptions.maxZoom = zoom;
    }
    if (this.props.mapBottomPadding) {
      boundsOptions.paddingBottomRight = [0, this.props.mapBottomPadding];
    }
    let mapUrl =
      (isDebugTiles && `${config.URL.OTP}inspector/tile/traversal/`) ||
      config.URL.MAP;
    if (mapUrl !== null && typeof mapUrl === 'object') {
      mapUrl = mapUrl[this.props.lang] || config.URL.MAP.default;
    }
    leafletObjs.push(
      <VectorTileLayerContainer
        key="vectorTileLayerContainer"
        hilightedStops={this.props.hilightedStops}
        stopsNearYouMode={this.props.stopsNearYouMode}
        stopsToShow={this.props.stopsToShow}
        locationPopup={locationPopup}
        onSelectLocation={onSelectLocation}
        mapLayers={this.props.mapLayers}
      />,
    );

    let attribution = get(config, 'map.attribution');
    if (!isString(attribution) || isEmpty(attribution)) {
      attribution = false;
    }

    if (this.map) {
      this.mapZoomLvl = this.map.leafletElement._zoom;
    }

    if (geoJson) {
      // bounds are only used when geojson only contains point geometries
      Object.keys(geoJson)
        .filter(
          key =>
            mapLayers?.geoJson[key] !== false &&
            (mapLayers.geoJson[key] === true ||
              geoJson[key]?.isOffByDefault !== true),
        )
        .forEach((key, i) => {
          leafletObjs.push(
            <GeoJSON
              key={key.concat(i)}
              bounds={null}
              data={geoJson[key].data}
              geoJsonZoomLevel={this.mapZoomLvl ? this.mapZoomLvl : 9}
              locationPopup={locationPopup}
              onSelectLocation={onSelectLocation}
            />,
          );
        });
    }
    return (
      <div aria-hidden="true">
        <span
          className="overlay-mover"
          style={{
            transform: `translate(0, -${this.props.buttonBottomPadding}px)`,
          }}
        >
          {this.props.bottomButtons}
        </span>
        <LeafletMap
          className={`z${this.mapZoomLvl ? this.mapZoomLvl : 9}`}
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
          onPopupopen={this.onPopupopen}
          closePopupOnClick={false}
        >
          <TileLayer
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
          {this.props.showScaleBar && config.map.showScaleBar && (
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
          {leafletObjs}
          <PositionMarker key="position" />
        </LeafletMap>
      </div>
    );
  }
}
