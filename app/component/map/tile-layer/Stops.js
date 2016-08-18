import { VectorTile } from 'vector-tile';

import Protobuf from 'pbf';
import config from '../../../config';
import { drawRoundIcon, drawTerminalIcon } from '../../../util/mapIconUtils';

class Stops {
  constructor(tile) {
    this.tile = tile;
    this.promise = this.getPromise();
  }

  static getName = () => 'stop';

  getPromise() {
    return fetch(
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
            if (feature.properties.type && (feature.properties.parentStation === 'null' ||
              config.terminalStopsMaxZoom <= this.tile.coords.z + (this.tile.props.zoomOffset || 0))
            ) {
              this.features.push(feature);
              drawRoundIcon(
                this.tile,
                feature.loadGeometry(),
                feature.properties.type,
                this.tile.props.hilightedStops &&
                  this.tile.props.hilightedStops.includes(feature.properties.gtfsId)
              );
            }
          }
        }
        if (vt.layers.stations != null &&
            config.terminalStopsMaxZoom > this.tile.coords.z + (this.tile.props.zoomOffset || 0)
        ) {
          for (let i = 0, ref = vt.layers.stations.length - 1; i <= ref; i++) {
            const feature = vt.layers.stations.feature(i);
            if (feature.properties.type) {
              this.features.push(feature);
              drawTerminalIcon(
                this.tile,
                feature.loadGeometry(),
                feature.properties.type,
              );
            }
          }
        }
      }, err => console.log(err));
    });
  }
}

export default Stops;
