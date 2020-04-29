import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { includes } from 'lodash-es';
import { isBrowser } from '../../../util/browser';
import { drawRoundIcon, iconExists } from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [[13, 0.8], [20, 1.6]],
});

const categoriesToRemove = ['vending_machine', 'public_transport_tickets'];

class Covid19OpeningHours {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.poiImageSize = 9 * this.scaleratio * getScale(this.tile.coords.z);

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

          this.features = range(length)
            .map(index => {
              const feature = pois.feature(index);
              [[feature.geom]] = feature.loadGeometry();
              return pick(feature, ['geom', 'properties']);
            })
            .filter(f => !includes(categoriesToRemove, f.properties.cat));

          this.features.forEach(actionFn);
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  };

  // eslint-disable-next-line camelcase
  static getIcon = (cat, normalized_cat) => {
    const catIcon = `poi_${cat}`;
    // some subcategories don't have icons so we show the root category
    if (iconExists(catIcon)) {
      // eslint-disable-next-line camelcase
      return catIcon;
    }
    // eslint-disable-next-line camelcase
    return `poi_${normalized_cat || 'other'}`;
  };

  getIconStatus = status => {
    switch (status) {
      case 'open':
      case 'open_adapted':
        return 'poi-open';
      case 'closed':
        return 'poi-closed';
      case 'partial':
        return 'poi-partial';
      default:
        return 'poi';
    }
  };

  fetchAndDrawStatus = ({ geom, properties }) => {
    const status = this.getIconStatus(properties.status);

    if (this.tile.coords.z <= this.config.covid19.smallIconZoom) {
      return drawRoundIcon(this.tile, geom, status);
    }

    const icon = Covid19OpeningHours.getIcon(
      properties.cat,
      properties.normalized_cat,
    );
    return drawRoundIcon(
      this.tile,
      geom,
      status,
      null,
      null,
      icon,
      this.poiImageSize,
    );
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.covid19.smallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'covid19';
}

export default Covid19OpeningHours;
