import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';
import range from 'lodash-es/range';
import { drawDatahubTileIcon } from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';

export default class DatahubTiles {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.imageSize = 20 * scaleratio;
    this.promise = this.getPromise();
  }

  static getName = () => 'datahubTiles';

  getPromise() {
    return fetch(
      `${this.config.URL.DATAHUB_TILES_MAP}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];

          const layerData = vt.layers['public.geo_locations'] || { length: 0 };
          const { length } = layerData;

          if (layerData != null) {
            this.features = range(length).map(index => {
              const feature = layerData.feature(index);
              [[feature.geom]] = feature.loadGeometry();
              return pick(feature, ['geom', 'properties', 'id']);
            });

            this.features.forEach(feature => {
              if (
                this.tile.coords.z <= this.config.datahubTiles.smallIconZoom
              ) {
                return drawDatahubTileIcon(this.tile, feature.geom, null);
              }
              return drawDatahubTileIcon(this.tile, feature.geom, true);
            });
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}
