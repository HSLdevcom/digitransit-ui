import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { isBrowser } from '../../../util/browser';
import { drawIcon, drawStopIcon } from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [
    [13, 0.8],
    [20, 1.6],
  ],
});

class BikeParks {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.iconSize = 20 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.drawStatus);
  }

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.BIKE_PARKS_MAP}` +
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

          const layerData = vt.layers.parking || { length: 0 };
          const { length } = layerData;

          this.features = range(length)
            .map(index => {
              const feature = layerData.feature(index);
              [[feature.geom]] = feature.loadGeometry();
              return pick(feature, ['geom', 'properties']);
            })
            .map(i => {
              const ret = i;
              ret.properties.maxCapacity =
                i.properties['capacity.bicyclePlaces'];
              return ret;
            })
            .filter(i => i.properties.bicyclePlaces);

          this.features.forEach(actionFn);
        },
        // eslint-disable-next-line no-console
        err => console.error(err),
      );
    });

  static getIcon = ({ tags }) => {
    const type = BikeParks.getBikeParkType(tags);
    return `icon-${type}`;
    
  };

  static getBikeParkType = (tags) => {
    const splitTags = tags.split(',')
    const covered = splitTags.includes('osm:covered');
    const garage = splitTags.includes('osm:bicycle_parking=shed') || splitTags.includes('osm:bicycle_parking=garage');
    const lockers = splitTags.includes('osm:bicycle_parking=lockers');
    if (lockers) {
      return `bike-park-lockers`;
    } else if (garage) {
      return `bike-park-station`;
    } else if (covered) {
      return `bike-park-covered`;
    } else {
      return `bike-park`;
    }
  };

  drawStatus = ({ geom, properties }) => {
    if (this.tile.coords.z <= this.config.bikeParks.smallIconZoom) {
      return drawStopIcon(
        this.tile,
        geom,
        'bike-park',
        null,
        null,
        null,
        this.config.colors.iconColors,
      );
    }

    const icon = BikeParks.getIcon(properties);
    return drawIcon(icon, this.tile, geom, this.iconSize);
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.bikeParks.minZoom) {
      this.fetchWithAction(this.drawStatus);
    }
  };

  static getName = () => 'bikeParks';
}

export default BikeParks;
