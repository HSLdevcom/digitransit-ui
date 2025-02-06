import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';
import range from 'lodash-es/range';
import { drawIcon } from '../../../util/mapIconUtils';
import { getLayerByCode, templateTileUrl } from '../../../util/mapLayerUtils';
import { isBrowser } from '../../../util/browser';

export default class PoiVectorTileLayer {
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
      templateTileUrl(
        this.config.URL.PUBLIC_POIS_MAP,
        this.tile.coords.x,
        this.tile.coords.y,
        this.tile.coords.z + (this.tile.props.zoomOffset || 0),
      ),
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
              return pick(layerFeature, ['geom', 'properties']);
            })
            .filter(feature => {
              const poiLayer = getLayerByCode(
                feature.properties.category3,
                this.config,
              );
              return (
                PoiVectorTileLayer.visibleCategories[poiLayer.code] &&
                this.tile.coords.z >= poiLayer.properties.layer.min_zoom
              );
            });

          this.features.forEach(feature => {
            const layerCode = feature.properties.category3;

            const poiLayer = getLayerByCode(layerCode, this.config);
            if (poiLayer) {
              const { icon, layer } = poiLayer.properties;

              const parser = new DOMParser();
              const docs = parser.parseFromString(icon.svg, 'image/svg+xml');
              const svgElement = docs.querySelector('svg');

              if (svgElement) {
                svgElement.id = `icon-${layerCode}`;
                svgElement.style.zIndex = layer.priority;
                svgElement.style.display = 'none';

                document.body.appendChild(svgElement);

                drawIcon(
                  `icon-${feature.properties.category3}`,
                  this.tile,
                  feature.geom,
                  this.imageSize,
                  svgElement.style,
                );
              }
            }
          });
        }
      });
  }
}
