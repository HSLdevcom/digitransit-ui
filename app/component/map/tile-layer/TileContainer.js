import flatten from 'lodash/flatten';
import omit from 'lodash/omit';
import L from 'leaflet';
import { isEqual, some } from 'lodash';
import { isBrowser } from '../../../util/browser';
import { isLayerEnabled } from '../../../util/mapLayerUtils';
import { getStopIconStyles } from '../../../util/mapIconUtils';

import { getCityBikeMinZoomOnStopsNearYou } from '../../../util/citybikes';
import events from '../../../util/events';

class TileContainer {
  constructor(
    coords,
    done,
    props,
    config,
    mergeStops,
    relayEnvironment,
    hilightedStops,
    vehicles,
    stopsToShow,
  ) {
    const markersMinZoom = Math.min(
      getCityBikeMinZoomOnStopsNearYou(
        config,
        props.mapLayers.citybikeOverrideMinZoom,
      ),
      config.stopsMinZoom,
      config.terminalStopsMinZoom,
    );
    this.coords = coords;
    this.mergeStops = mergeStops;
    this.props = props;
    this.extent = 4096;
    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.tileSize = (this.props.tileSize || 256) * this.scaleratio;
    this.ratio = this.extent / this.tileSize;
    this.el = this.createElement();
    this.clickCount = 0;
    this.hilightedStops = hilightedStops;
    this.vehicles = vehicles;
    this.stopsToShow = stopsToShow;

    if (events.listenerCount('vehiclesChanged') === 0) {
      events.on('vehiclesChanged', this.onVehiclesChange);
    }

    let ignoreMinZoomLevel =
      hilightedStops &&
      hilightedStops.length > 0 &&
      !hilightedStops.every(stop => stop === '');
    if (vehicles && vehicles.length > 0) {
      ignoreMinZoomLevel = vehicles.every(
        v => v.mode === 'ferry' && v.mode === 'rail' && v.mode === 'subway',
      );
    }

    if (
      (!ignoreMinZoomLevel && this.coords.z < markersMinZoom) ||
      !this.el.getContext
    ) {
      setTimeout(() => done(null, this.el), 0);
      return;
    }

    this.ctx = this.el.getContext('2d');

    this.layers = this.props.layers
      .filter(Layer => {
        const layerName = Layer.getName();

        // stops and terminals are drawn on same layer
        const isEnabled =
          isLayerEnabled(layerName, this.props.mapLayers) ||
          (layerName === 'stop' &&
            isLayerEnabled('terminal', this.props.mapLayers));

        if (
          layerName === 'stop' &&
          (ignoreMinZoomLevel ||
            this.coords.z >= config.stopsMinZoom ||
            this.coords.z >= config.terminalStopsMinZoom)
        ) {
          return isEnabled;
        }
        if (
          layerName === 'citybike' &&
          this.coords.z >=
            getCityBikeMinZoomOnStopsNearYou(
              config,
              props.mapLayers.citybikeOverrideMinZoom,
            )
        ) {
          return isEnabled;
        }
        if (
          layerName === 'parkAndRide' &&
          config.parkAndRide &&
          this.coords.z >= config.parkAndRide.parkAndRideMinZoom
        ) {
          return isEnabled;
        }
        if (
          layerName === 'dynamicParkingLots' &&
          this.coords.z >= config.dynamicParkingLots.dynamicParkingLotsMinZoom
        ) {
          return isEnabled;
        }
        if (
          layerName === 'weatherStations' &&
          this.coords.z >= config.weatherStations.minZoom
        ) {
          return isEnabled;
        }
        if (
          layerName === 'chargingStations' &&
          this.coords.z >= config.chargingStations.minZoom
        ) {
          return isEnabled;
        }
        if (
          layerName === 'bikeParks' &&
          this.coords.z >= config.bikeParks.minZoom
        ) {
          return isEnabled;
        }
        if (
          layerName === 'roadworks' &&
          this.coords.z >= config.roadworks.roadworksMinZoom
        ) {
          return isEnabled;
        }
        return false;
      })
      .map(
        Layer =>
          new Layer(
            this,
            config,
            this.props.mapLayers,
            relayEnvironment,
            mergeStops,
          ),
      );

    this.el.layers = this.layers.map(layer => omit(layer, 'tile'));

    Promise.all(this.layers.map(layer => layer.promise)).then(() =>
      done(null, this.el),
    );
  }

  onVehiclesChange = vehicles => {
    if (!isEqual(this.vehicles, vehicles)) {
      this.vehicles = { ...vehicles };
    }
  };

  project = point => {
    const size =
      this.extent * 2 ** (this.coords.z + (this.props.zoomOffset || 0));
    const x0 = this.extent * this.coords.x;
    const y0 = this.extent * this.coords.y;
    const y1 = 180 - ((point.y + y0) * 360) / size;
    return {
      lon: ((point.x + x0) * 360) / size - 180,
      lat: (360 / Math.PI) * Math.atan(Math.exp(y1 * (Math.PI / 180))) - 90,
    };
  };

  latLngToPoint = (lat, lon) => {
    const size =
      this.extent * 2 ** (this.coords.z + (this.props.zoomOffset || 0));

    const x0 = this.extent * this.coords.x;
    const y0 = this.extent * this.coords.y;

    const x = ((lon + 180) * size) / 360;
    const pointX = x - x0;

    const y1 =
      180 * (Math.log(Math.tan(((lat + 90) * Math.PI) / 360)) / Math.PI);
    const y2 = Math.abs((y1 - 180) * size) / 360;
    const pointY = y2 - y0;
    return { x: pointX, y: pointY };
  };

  createElement = () => {
    const el = document.createElement('canvas');
    el.setAttribute('class', 'leaflet-tile');
    el.setAttribute('height', this.tileSize);
    el.setAttribute('width', this.tileSize);
    el.onMapClick = this.onMapClick;
    return el;
  };

  onMapClick = (e, point) => {
    let nearest;
    let features;
    let localPoint;

    const vehicleKeys = Object.keys(this.vehicles);

    const projectedVehicles = vehicleKeys.map(key => {
      const vehicle = this.vehicles[key];
      const pointGeom = this.latLngToPoint(vehicle.lat, vehicle.long);
      return {
        layer: 'realTimeVehicle',
        feature: { geom: pointGeom, vehicle, properties: {} },
      };
    });

    if (this.layers) {
      localPoint = [
        (point[0] * this.scaleratio) % this.tileSize,
        (point[1] * this.scaleratio) % this.tileSize,
      ];

      features = flatten(
        this.layers.map(
          layer =>
            layer.features &&
            layer.features.map(feature => ({
              layer: layer.constructor.getName(),
              feature,
            })),
        ),
      );
      features = projectedVehicles.concat(features);

      nearest = features.filter((feature, index) => {
        if (!feature) {
          return false;
        }

        if (!feature.feature.polyline) {
          const g = feature.feature.geom;

          // collision check for stops and citybike stations is different for different icons which depend on zoom level
          const featureX = g.x / this.ratio;
          let featureY = g.y / this.ratio;

          let isCombo = false;
          let secondY;
          if (
            (feature.layer === 'stop' && !feature.feature.properties.stops) ||
            feature.layer === 'citybike'
          ) {
            const zoom = this.coords.z;
            // hitbox is same for stop and citybike
            const iconStyles = getStopIconStyles('stop', zoom);
            if (iconStyles) {
              const { style } = iconStyles;
              let { height, width } = iconStyles;
              width *= this.scaleratio;
              height *= this.scaleratio;
              const circleRadius = width / 2;
              if (style === 'large' || feature.layer === 'realTimeVehicle') {
                featureY -= height - circleRadius;
              }
              // combo stops have a larger hitbox that is not circular
              // use two points for collision detection, lower and upper center of icon
              // features array is sorted by y coord so combo stops should be next to each other
              if (
                index > 0 &&
                features[index - 1].feature.properties.code ===
                  feature.feature.properties.code
              ) {
                isCombo = true;
              }
              if (
                index < features.length - 1 &&
                features[index + 1].feature.properties.code ===
                  feature.feature.properties.code
              ) {
                isCombo = true;
              }
              if (isCombo && style === 'large') {
                secondY = featureY - width;
              }
            }
          }
          let dist = Math.sqrt(
            (localPoint[0] - featureX) ** 2 + (localPoint[1] - featureY) ** 2,
          );
          if (isCombo) {
            dist = Math.min(
              dist,
              Math.sqrt(
                (localPoint[0] - featureX) ** 2 +
                  (localPoint[1] - secondY) ** 2,
              ),
            );
          }
          if (dist < 22 * this.scaleratio) {
            return true;
          }
          return false;
        }

        // collision check for polyline
        return some(feature.feature.polyline, p => {
          const dist = Math.sqrt(
            (localPoint[0] - p.x / this.ratio) ** 2 +
              (localPoint[1] - p.y / this.ratio) ** 2,
          );

          return dist < 22 * this.scaleratio;
        });
      });

      if (nearest.length === 0 && e.type === 'click') {
        // Must filter double clicks used for map navigation
        if (!this.timer) {
          this.timer = setTimeout(() => {
            this.timer = null;
            return this.onSelectableTargetClicked([], e.latlng);
          }, 300);
        } else {
          clearTimeout(this.timer);
          this.timer = null;
        }
        return false;
      }
      if (nearest.length === 0 && e.type === 'contextmenu') {
        // no need to check double clicks
        return this.onSelectableTargetClicked([], e.latlng);
      }
      if (nearest.length === 1) {
        L.DomEvent.stopPropagation(e);
        // open menu for single stop
        let latLon = L.latLng(this.project(nearest[0].feature.geom));
        if (nearest[0].feature.polyline) {
          latLon = e.latlng;
        }
        return this.onSelectableTargetClicked(nearest, latLon, true);
      }
      L.DomEvent.stopPropagation(e);
      return this.onSelectableTargetClicked(nearest, e.latlng, true); // open menu for a list of stops
    }
    return false;
  };
}

export default TileContainer;
