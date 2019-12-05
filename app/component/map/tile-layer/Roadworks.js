import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import Relay from 'react-relay/classic';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  drawRoundIcon,
  drawIcon,
  drawAvailabilityValue,
} from '../../../util/mapIconUtils';
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
    this.parkingLotImageSize =
      20 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getScale(this.tile.coords.z);

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

          console.log(vt.layers);

          if (vt.layers.roadwork != null) {
            for (
              let i = 0, ref = vt.layers.roadwork.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.roadwork.feature(i);
              [[feature.geom]] = feature.loadGeometry();
              this.features.push(pick(feature, ['geom', 'properties']));
            }
          }

          this.features.forEach(actionFn);
        },
        err => console.log(err),
      );
    });

  fetchAndDrawStatus = ({ geom, properties}) => {
    console.log("DRAW", geom, properties)


    return drawIcon(
      "icon-icon_car",
      this.tile,
      geom,
      this.parkingLotImageSize,
    ).then(() => {
      drawAvailabilityValue(
        this.tile,
        geom,
        properties.free,
        this.parkingLotImageSize,
        this.availabilityImageSize,
        this.scaleratio,
      );

    });

  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'roadworks';
}

export default Roadworks;
