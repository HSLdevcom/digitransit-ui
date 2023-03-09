import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';
import last from 'lodash/last';

import range from 'lodash/range';
import { isBrowser } from '../../../util/browser';
import { drawIcon } from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [
    [13, 0.8],
    [20, 1.6],
  ],
});

const IncidentType = {
  RoadClosed: 'ROAD_CLOSED',
};

const DirectionsType = {
  BothDirections: 'BOTH_DIRECTIONS',
  OneDirection: 'ONE_DIRECTION',
};

class Roadworks {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.iconSize = 20 * this.scaleratio * getScale(this.tile.coords.z);
  }

  getPromise = () => this.fetchWithAction(this.drawStatus);

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.ROADWORKS_MAP}` +
        `${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}/` +
        `${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          const layerData = vt.layers.cifs || { length: 0 };
          const { length } = layerData;

          this.features = range(length).map(index => {
            const feature = layerData.feature(index);
            const geometry = feature.loadGeometry();
            [[feature.geom]] = geometry;
            [feature.polyline] = geometry;
            return pick(feature, ['geom', 'polyline', 'properties']);
          });

          this.features.forEach(actionFn);
        },
        // eslint-disable-next-line no-console
        err => console.error(err),
      );
    });

  static getIconSuffix = properties => {
    let suffix = '';
    if (
      properties.type === IncidentType.RoadClosed &&
      properties['location.direction'] === DirectionsType.BothDirections
    ) {
      suffix = '-full-closure';
    }
    return suffix;
  };

  drawStatus = ({ polyline, properties }) => {
    const suffix = Roadworks.getIconSuffix(properties);
    const { ctx } = this.tile;

    if (Date.parse(properties.starttime) > Date.now()) {
      ctx.globalAlpha = 0.5;
    }

    ctx.lineWidth = 6;
    ctx.setLineDash([0.1, 12]);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#cc2808';

    const first = polyline[0];
    ctx.moveTo(first.x / this.tile.ratio, first.y / this.tile.ratio);
    ctx.beginPath();

    polyline.forEach(point => {
      ctx.lineTo(point.x / this.tile.ratio, point.y / this.tile.ratio);
    });
    ctx.stroke();

    return drawIcon(
      `icon-icon_roadworks${suffix}`,
      this.tile,
      polyline[0],
      this.iconSize,
    ).then(
      properties['location.direction'] === DirectionsType.BothDirections &&
        drawIcon(
          `icon-icon_roadworks${suffix}`,
          this.tile,
          last(polyline),
          this.iconSize,
        ),
    );
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.roadworks.roadworksMinZoom) {
      this.fetchWithAction(this.drawStatus);
    }
  };

  static getName = () => 'roadworks';
}

export default Roadworks;
