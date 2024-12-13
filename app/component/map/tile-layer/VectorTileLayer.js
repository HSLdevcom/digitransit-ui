import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';
import range from 'lodash-es/range';
import { drawIcon } from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';

import layers from '../../../../layers.json';

const healthAndSocialLayers = layers
  .filter(layer => layer.code === 'health_and_social_services')
  .flatMap(({ categories }) => categories);

export default class VectorTileLayer {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.imageSize = 20 * scaleratio;
  }

  static visibleCategories;

  static getName = () => 'publicPois';

  getPromise() {
    return fetch(
      `https://features.stadtnavi.eu/public.pois/${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    )
      .then(
        res => {
          if (res.status !== 200) {
            return undefined;
          }

          if (
            res.headers.has('x-protobuf-encoding') &&
            res.headers.get('x-protobuf-encoding') === 'base64'
          ) {
            return res.text().then(text => Buffer.from(text, 'base64'));
          }
          return res.arrayBuffer();
        },
        // eslint-disable-next-line no-console
        err => console.log(err),
      )
      .then(buf => {
        const vt = new VectorTile(new Protobuf(buf));

        this.features = [];

        const layerData = vt.layers['public.pois'] || { length: 0 };
        const { length } = layerData;

        if (layerData != null) {
          this.features = range(length)
            .map(index => {
              const layerFeature = layerData.feature(index);

              [[layerFeature.geom]] = layerFeature.loadGeometry();
              const feature = pick(layerFeature, ['geom', 'properties']);

              if (
                !VectorTileLayer.visibleCategories[feature.properties.category3]
              ) {
                return null;
              }
              return feature;
            })
            .filter(Boolean);

          this.features.forEach(feature => {
            const { svg } = healthAndSocialLayers
              .find(({ code }) => code === feature.properties.category2)
              .categories.find(
                ({ code }) => code === feature.properties.category3,
              ).properties.icon;

            const parser = new DOMParser();
            const docs = parser.parseFromString(svg, 'image/svg+xml');
            const svgElement = docs.querySelector('svg');

            svgElement.id = `icon-${feature.properties.category3}`;

            document.body.appendChild(svgElement);

            return drawIcon(
              `icon-${feature.properties.category3}`,
              this.tile,
              feature.geom,
              this.imageSize,
            );
          });
        }
      });
  }
}
