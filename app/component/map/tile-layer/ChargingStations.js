import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { isBrowser } from '../../../util/browser';
import { drawIcon, drawStopIcon } from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';
import { getIcon } from '../sidebar/ChargingStationContent';

const getScale = glfun({
  base: 1,
  stops: [
    [13, 0.8],
    [20, 1.6],
  ],
});

class ChargingStations {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.iconSize = 20 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.drawStatus);
  }

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.CHARGING_STATIONS_MAP}` +
        `${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}/` +
        `${this.tile.coords.x}/${this.tile.coords.y}.mvt`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          const layerData = vt.layers.chargepoints || { length: 0 };
          const { length } = layerData;

          this.features = range(length).map(index => {
            const feature = layerData.feature(index);
            [[feature.geom]] = feature.loadGeometry();
            return pick(feature, ['geom', 'properties']);
          });

          this.features.forEach(actionFn);
        },
        // eslint-disable-next-line no-console
        err => console.error(err),
      );
    });

  drawStatus = ({ geom, properties }) => {
    if (this.tile.coords.z <= this.config.chargingStations.smallIconZoom) {
      return drawStopIcon(this.tile, geom, 'charging-station');
    }

    const icon = getIcon(properties);
    return drawIcon(icon, this.tile, geom, this.iconSize);
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.chargingStations.minZoom) {
      this.fetchWithAction(this.drawStatus);
    }
  };

  static getName = () => 'chargingStations';
}

export default ChargingStations;
