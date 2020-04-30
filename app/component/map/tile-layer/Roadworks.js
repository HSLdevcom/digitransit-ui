import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import { drawIcon } from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [[13, 0.8], [20, 1.6]],
});

class Roadworks {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.iconSize = 36 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.fetchAndDrawStatus);
  }

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

          const layerData = vt.layers.roadworks;

          if (layerData != null) {
            for (let i = 0, ref = layerData.length - 1; i <= ref; i++) {
              const feature = layerData.feature(i);
              [[feature.geom]] = feature.loadGeometry();
              this.features.push(pick(feature, ['geom', 'properties']));
            }
          }

          this.features.forEach(actionFn);
        },
        // eslint-disable-next-line no-console
        err => console.error(err),
      );
    });

  static getIconSuffix = properties => {
    let suffix = '';
    if (properties.Vollsperrung === 1) {
      suffix = '-full-closure';
    } else if (properties.Halbseitige_Sperrung === 1) {
      suffix = '-oneway-closure';
    }
    return suffix;
  };

  fetchAndDrawStatus = ({ geom, properties }) => {
    const suffix = Roadworks.getIconSuffix(properties);
    return drawIcon(
      `icon-icon_roadworks${suffix}`,
      this.tile,
      geom,
      this.iconSize,
    );
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.roadworks.roadworksMinZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'roadworks';
}

export default Roadworks;
