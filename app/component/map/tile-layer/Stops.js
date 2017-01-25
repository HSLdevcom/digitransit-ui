import { VectorTile } from 'vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import { drawRoundIcon, drawTerminalIcon } from '../../../util/mapIconUtils';

class Stops {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;
    this.promise = this.getPromise();
  }

  static getName = () => 'stop';

  drawStop(feature) {
    if (feature.properties.type === 'FERRY') {
      drawTerminalIcon(
        this.tile,
        feature.geom,
        feature.properties.type,
        this.tile.coords.z >= this.config.terminalNamesZoom ? feature.properties.name : false,
      );
      return;
    }
    drawRoundIcon(
      this.tile,
      feature.geom,
      feature.properties.type,
      this.tile.props.hilightedStops &&
        this.tile.props.hilightedStops.includes(feature.properties.gtfsId),
      feature.properties.platform !== 'null' ? feature.properties.platform : false,
    );
  }

  getPromise() {
    return fetch(
      `${this.config.URL.STOP_MAP}${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}` +
      `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    )
    .then((res) => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then((buf) => {
        const vt = new VectorTile(new Protobuf(buf));

        this.features = [];

        if (vt.layers.stops != null && this.tile.coords.z >= this.config.stopsMinZoom) {
          for (let i = 0, ref = vt.layers.stops.length - 1; i <= ref; i++) {
            const feature = vt.layers.stops.feature(i);
            if (feature.properties.type && (feature.properties.parentStation === 'null' ||
              this.config.terminalStopsMaxZoom - 1 <=
              this.tile.coords.z + (this.tile.props.zoomOffset || 0))
            ) {
              feature.geom = feature.loadGeometry()[0][0];
              this.features.push(pick(feature, ['geom', 'properties']));
              this.drawStop(feature);
            }
          }
        }
        if (vt.layers.stations != null &&
            this.config.terminalStopsMaxZoom > this.tile.coords.z +
              (this.tile.props.zoomOffset || 0) &&
            this.tile.coords.z >= this.config.terminalStopsMinZoom
        ) {
          for (let i = 0, ref = vt.layers.stations.length - 1; i <= ref; i++) {
            const feature = vt.layers.stations.feature(i);
            if (feature.properties.type) {
              feature.geom = feature.loadGeometry()[0][0];
              this.features.unshift(pick(feature, ['geom', 'properties']));
              drawTerminalIcon(
                this.tile,
                feature.geom,
                feature.properties.type,
                this.tile.coords.z >= this.config.terminalNamesZoom ?
                  feature.properties.name : false,
              );
            }
          }
        }
      }, err => console.log(err));
    });
  }
}

export default Stops;
