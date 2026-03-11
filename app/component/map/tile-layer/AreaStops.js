import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';

class AreaStops {
  constructor(tile, config, mapLayers, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.mapLayers = mapLayers;
    this.relayEnvironment = relayEnvironment;
  }

  static getName = () => 'areaStop';

  drawAreaLine(geom, lineProps) {
    this.tile.ctx.beginPath();
    geom.forEach(polygon => {
      polygon.forEach((coord, index) => {
        const x = coord.x / this.tile.ratio;
        const y = coord.y / this.tile.ratio;
        if (index === 0) {
          this.tile.ctx.moveTo(x, y);
        } else {
          this.tile.ctx.lineTo(x, y);
        }
      });
    });
    this.tile.ctx.setLineDash(lineProps.dash);
    this.tile.ctx.lineWidth = lineProps.width;
    this.tile.ctx.strokeStyle = lineProps.color;
    this.tile.ctx.globalAlpha = lineProps.opacity;
    this.tile.ctx.stroke();
  }

  getPromise(lang) {
    const zoomWithOffset =
      this.tile.coords.z + (this.tile.props.zoomOffset || 0);
    const stopsUrl = this.config.URL.AREA_STOP_MAP;
    return fetchWithLanguageAndSubscription(
      `${getLayerBaseUrl(stopsUrl, lang)}${zoomWithOffset}/${
        this.tile.coords.x
      }/${this.tile.coords.y}.pbf`,
      this.config,
      lang,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }
      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          const areaStopsLayer = vt.layers.areaStops;

          if (areaStopsLayer) {
            for (let i = 0; i < areaStopsLayer.length; i += 1) {
              const feature = areaStopsLayer.feature(i);
              if (
                feature.properties.name?.includes(
                  this.mapLayers.areaStop.routeGtfsId,
                )
              ) {
                const geom = feature.loadGeometry();
                this.drawAreaLine(geom, {
                  dash: [5, 5],
                  width: 1.5,
                  color: '#0074BF',
                  opacity: 1,
                });
                this.drawAreaLine(geom, {
                  dash: [],
                  width: this.tile.coords.z,
                  color: '#0074BF',
                  opacity: 0.2,
                });
              }
            }
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}

export default AreaStops;
