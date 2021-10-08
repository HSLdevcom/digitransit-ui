import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import range from 'lodash-es/range';
import { isBrowser } from '../../../util/browser';
import {
  drawAvailabilityBadge,
  drawIcon,
  getMemoizedStopIcon,
} from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [
    [13, 0.8],
    [20, 1.6],
  ],
});

const BikeParkingType = {
  Unknown: {
    icon: 'bike-park',
    smallIconZoom: 17,
  },
  Lockers: {
    icon: 'bike-park-lockers',
    smallIconZoom: 15,
  },
  Station: {
    icon: 'bike-park-station',
    smallIconZoom: 15,
  },
  Covered: {
    icon: 'bike-park-covered',
    smallIconZoom: 15,
  },
};

class BikeParks {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.iconSize = 20 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getScale(this.tile.coords.z);

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
    return `icon-${type.icon}`;
  };

  static getBikeParkType = tags => {
    const splitTags = tags.split(',');
    const covered = splitTags.includes('osm:covered');
    const garage =
      splitTags.includes('osm:bicycle_parking=shed') ||
      splitTags.includes('osm:bicycle_parking=garage');
    const lockers = splitTags.includes('osm:bicycle_parking=lockers');
    if (lockers) {
      return BikeParkingType.Lockers;
    }
    if (garage) {
      return BikeParkingType.Station;
    }
    if (covered) {
      return BikeParkingType.Covered;
    }
    return BikeParkingType.Unknown;
  };

  static getAvailability(properties) {
    const available = properties['availability.bicyclePlaces'];
    if (available === 0) {
      return 'no';
    }
    /* if (available === 1) {
      return 'poor';
    } */
    return 'good';
  }

  drawStatus = ({ geom, properties }) => {
    const type = BikeParks.getBikeParkType(properties.tags);
    if (this.tile.coords.z <= type.smallIconZoom) {
      const mode = `mode-bike-park`;
      const color = this.config.colors.iconColors[mode];
      let width = 10;
      width *= this.tile.scaleratio;

      const radius = width / 2;
      const x = geom.x / this.tile.ratio - radius;
      const y = geom.y / this.tile.ratio - radius;
      getMemoizedStopIcon(type, radius, color, false).then(image => {
        this.tile.ctx.drawImage(image, x, y);
      });
    } else {
      const icon = BikeParks.getIcon(properties);
      drawIcon(icon, this.tile, geom, this.iconSize).then(() => {
        if (typeof properties['availability.bicyclePlaces'] === 'number') {
          drawAvailabilityBadge(
            BikeParks.getAvailability(properties),
            this.tile,
            geom,
            this.iconSize,
            this.availabilityImageSize,
            this.scaleratio,
          );
        }
      });
    }
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.bikeParks.minZoom) {
      this.fetchWithAction(this.drawStatus);
    }
  };

  static getName = () => 'bikeParks';
}

export default BikeParks;
