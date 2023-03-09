import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';
import range from 'lodash-es/range';
import { drawDatahubTileIcon } from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';

export default class DatahubTiles {
  constructor(tile, layerConfig, config) {
    this.tile = tile;

    this.baseUrl = layerConfig.baseUrl;
    this.vectorTileLayer = layerConfig.vectorTileLayer;

    this.config = config;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.imageSize = 20 * scaleratio;
  }

  static getName = () => 'datahubTiles';

  // map display is language independent, so no lang param required
  getPromise() {
    return fetch(
      `${this.baseUrl}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (!res.ok) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          if (buf.byteLength === 0) {
            return;
          }

          const vt = new VectorTile(new Protobuf(buf));
          const layerData = vt.layers[this.vectorTileLayer] || { length: 0 };
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
                return drawDatahubTileIcon(
                  this.tile,
                  feature.geom,
                  null,
                  feature.properties,
                );
              }
              return drawDatahubTileIcon(
                this.tile,
                feature.geom,
                true,
                feature.properties,
              );
            });
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}
