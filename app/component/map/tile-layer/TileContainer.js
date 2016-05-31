import flatten from 'lodash/flatten';
import config from '../../../config';
import omit from 'lodash/omit';
import L from 'leaflet';

const markersMinZoom = Math.min(config.cityBike.cityBikeMinZoom, config.stopsMinZoom);

class TileContainer {
  constructor(coords, done, props) {
    this.coords = coords;
    this.props = props;
    this.extent = 4096;
    this.scaleratio = (typeof window !== 'undefined' ? window.devicePixelRatio : void 0) || 1;
    this.tileSize = (this.props.tileSize || 256) * this.scaleratio;
    this.ratio = this.extent / this.tileSize;
    this.el = this.createElement();

    if (this.coords.z < markersMinZoom || !this.el.getContext) {
      return;
    }

    this.ctx = this.el.getContext('2d');

    this.layers = this.props.layers.filter(Layer => {
      if (Layer.getName() === 'stop' && this.coords.z >= config.stopsMinZoom) {
        return true;
      } else if (
        Layer.getName() === 'citybike' && this.coords.z >= config.cityBike.cityBikeMinZoom
      ) {
        return true;
      }
      return false;
    }).map(Layer => new Layer(this));

    this.el.layers = this.layers.map(layer => omit(layer, 'tile'));

    Promise.all(this.layers.map(layer => layer.promise)).then(() => done(null, this.el));
  }

  createElement = () => {
    const el = document.createElement('canvas');
    el.setAttribute('class', 'leaflet-tile');
    el.setAttribute('height', this.tileSize);
    el.setAttribute('width', this.tileSize);
    el.onMapClick = this.onMapClick;
    return el;
  }

  onMapClick = (e, point) => {
    let coords;
    let nearest;
    let features;
    let localPoint;

    if (this.layers) {
      localPoint = [point[0] * this.scaleratio % this.tileSize,
                    point[1] * this.scaleratio % this.tileSize];

      features = flatten(this.layers.map(layer => (
        layer.features != null ? layer.features.map(feature =>
          ({
            layer: layer.constructor.getName(),
            feature,
          })
        ) : void 0)
      ));

      nearest = features.filter(feature => {
        if (!feature) { return false; }

        const g = feature.feature.loadGeometry()[0][0];

        const dist = Math.sqrt(Math.pow((localPoint[0] - (g.x / this.ratio)), 2) +
          Math.pow((localPoint[1] - (g.y / this.ratio)), 2));

        if (dist < 17 * this.scaleratio) {
          return true;
        }
        return false;
      });

      if (nearest.length === 0) {
        return this.onSelectableTargetClicked(false);
      } else if (nearest.length === 1) {
        L.DomEvent.stopPropagation(e);
        coords = nearest[0].feature.toGeoJSON(this.coords.x, this.coords.y, this.coords.z +
          (this.props.zoomOffset || 0)).geometry.coordinates;
        return this.onSelectableTargetClicked(nearest, L.latLng([coords[1], coords[0]]));
      }
      L.DomEvent.stopPropagation(e);
      return this.onSelectableTargetClicked(nearest, e.latlng);
    }
    return false;
  }
}

export default TileContainer;
