import { VectorTile } from 'vector-tile';

import Protobuf from 'pbf';
import memoize from 'lodash/memoize';
import glfun from 'mapbox-gl-function';
import getSelector from '../../../util/get-selector';
import config from '../../../config';

const getCaseRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1.5, 26],
}));

const getStopRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [11.9, 12, 22],
  range: [0, 1, 24],
}));

const getHubRadius = memoize(glfun({
  type: 'exponential',
  base: 1.15,
  domain: [14, 14.1, 22],
  range: [0, 1.5, 12],
}));

const getColor = memoize((mode) => {
  if (typeof mode === 'undefined' || mode == null) {
    return undefined;
  }
  const ref = getSelector(`.${mode.toLowerCase()}`);
  return ref != null ? ref.style.color : void 0;
});

class Stops {
  constructor(tile) {
    this.tile = tile;

    this.promise =
      fetch(
        `${config.URL.STOP_MAP}${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}` +
        `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`
      )
      .then(res => {
        if (res.status !== 200) {
          return undefined;
        }

        return res.arrayBuffer().then(buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          if (vt.layers.stops != null) {
            for (let i = 0, ref = vt.layers.stops.length - 1; i <= ref; i++) {
              const feature = vt.layers.stops.feature(i);
              if (feature.properties.type) {
                this.features.push(feature);
              }
            }
          }

          for (const i of this.features) {
            this.addFeature(i);
          }
        }, err => console.log(err));
      });
  }

  addFeature = (feature) => {
    const geom = feature.loadGeometry();

    const caseRadius = getCaseRadius({ $zoom: this.tile.coords.z });

    const stopRadius = getStopRadius({ $zoom: this.tile.coords.z });

    const hubRadius = getHubRadius({ $zoom: this.tile.coords.z });

    if (caseRadius > 0) {
      this.tile.ctx.beginPath();
      this.tile.ctx.fillStyle = '#fff';

      this.tile.ctx.arc(
        geom[0][0].x / this.tile.ratio,
        geom[0][0].y / this.tile.ratio,
        caseRadius * this.tile.scaleratio, 0, Math.PI * 2
      );

      this.tile.ctx.fill();
      this.tile.ctx.beginPath();
      this.tile.ctx.fillStyle = getColor(feature.properties.type);

      this.tile.ctx.arc(
        geom[0][0].x / this.tile.ratio,
        geom[0][0].y / this.tile.ratio,
        stopRadius * this.tile.scaleratio, 0, Math.PI * 2
      );

      this.tile.ctx.fill();

      if (hubRadius > 0) {
        this.tile.ctx.beginPath();
        this.tile.ctx.fillStyle = '#fff';

        this.tile.ctx.arc(
          geom[0][0].x / this.tile.ratio,
          geom[0][0].y / this.tile.ratio,
          hubRadius * this.tile.scaleratio, 0, Math.PI * 2
        );

        this.tile.ctx.fill();
      }
    }
  }

  static getName = () => 'stop';
}

export default Stops;
