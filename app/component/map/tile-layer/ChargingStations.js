import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { isBrowser } from '../../../util/browser';
import {
  drawIcon,
  drawStopIcon,
  drawAvailabilityBadge,
} from '../../../util/mapIconUtils';
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
    this.chargingStationImageSize =
      20 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getScale(this.tile.coords.z);
    this.iconSize = 20 * this.scaleratio * getScale(this.tile.coords.z);
  }

  // map display is language independent, so no lang param required
  getPromise = () => this.fetchWithAction(this.drawStatus);

  fetchWithAction = actionFn => {
    const url = this.config.URL.CHARGING_STATIONS_MAP.replaceAll(
      '{x}',
      this.tile.coords.x,
    )
      .replaceAll('{y}', this.tile.coords.y)
      .replaceAll(
        '{z}',
        this.tile.coords.z + (this.tile.props.zoomOffset || 0),
      );
    return fetch(url).then(res => {
      if (!res.ok) {
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
  };

  drawStatus = ({ geom, properties }) => {
    if (this.tile.coords.z <= this.config.chargingStations.smallIconZoom) {
      return drawStopIcon(
        this.tile,
        geom,
        'charging-station',
        null,
        null,
        null,
        this.config.colors.iconColors,
      );
    }

    const icon = getIcon(properties);
    return drawIcon(icon, this.tile, geom, this.iconSize).then(() => {
      const { c, ca, cu, cs } = properties;
      const availableStatus = this.getAvailabilityStatus(c, ca, cu + cs);
      if (availableStatus) {
        drawAvailabilityBadge(
          availableStatus,
          this.tile,
          geom,
          this.chargingStationImageSize,
          this.availabilityImageSize,
          this.scaleratio,
        );
      }
    });
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.chargingStations.minZoom) {
      this.promise = this.fetchWithAction(this.drawStatus);
    }
  };

  getAvailabilityStatus = (total, available, statusUnknown) => {
    if (total === statusUnknown) {
      return null;
    }
    if (available > 1) {
      return 'good';
    }
    if (available === 1) {
      return 'poor';
    }

    return 'no';
  };

  static getName = () => 'chargingStations';
}

export default ChargingStations;
