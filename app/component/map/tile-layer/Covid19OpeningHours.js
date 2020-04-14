import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { isBrowser } from '../../../util/browser';
import {
  drawRoundIcon,
  drawIcon,
  drawAvailabilityBadge,
} from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [[13, 0.8], [20, 1.6]],
});

class Covid19OpeningHours {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.poiImageSize = 20 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.fetchAndDrawStatus);
  }

  fetchWithAction = actionFn => {
    const z = this.tile.coords.z + (this.tile.props.zoomOffset || 0);
    const url = this.config.URL.COVID19_MAP.replace('{z}', z)
      .replace('{x}', this.tile.coords.x)
      .replace('{y}', this.tile.coords.y);

    fetch(url).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          const pois = vt.layers['public.poi_osm_light'] || { length: 0 };
          const { length } = pois;

          this.features = range(length).map(index => {
            const feature = pois.feature(index);
            [[feature.geom]] = feature.loadGeometry();
            return pick(feature, ['geom', 'properties']);
          });

          this.features.forEach(actionFn);
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  };

  getIcon = category => {
    return 'poi_other';
  };

  getSmallIcon = status => {
    switch (status) {
      case 'open':
        return 'poi-open';
      case 'closed':
        return 'poi-closed';
      default:
        return 'poi';
    }
  };

  fetchAndDrawStatus = ({ geom, properties }) => {
    if (this.tile.coords.z <= this.config.covid19.smallIconZoom) {
      const icon = this.getSmallIcon(properties.status);
      return drawRoundIcon(this.tile, geom, icon);
    }

    const icon = this.getIcon(properties.cat);

    return drawIcon(icon, this.tile, geom, this.poiImageSize);
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'covid19';
}

export default Covid19OpeningHours;
