import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';
import { isNumber } from 'lodash';
import SimpleOpeningHours from 'simple-opening-hours';
import range from 'lodash-es/range';
import omit from 'lodash/omit';
import { isBrowser } from '../../../util/browser';
import { getIcon } from '../sidebar/DynamicParkingLotsContent';
import {
  drawIcon,
  drawAvailabilityBadge,
  drawStopIcon,
} from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

const getScale = glfun({
  base: 1,
  stops: [
    [13, 0.8],
    [20, 1.6],
  ],
});

class ParkAndRideForCars {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.parkingLotImageSize =
      20 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getScale(this.tile.coords.z);
  }

  // map display is language independent, so no lang param required
  getPromise = () => this.fetchWithAction(this.fetchAndDrawStatus);

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.PARK_AND_RIDE_MAP}` +
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
            .filter(i => i.properties.anyCarPlaces)
            .map(i => {
              return {
                ...i,
                properties: {
                  ...omit(i.properties, [
                    'availability.wheelchairAccessibleCarPlaces',
                    'capacity.wheelchairAccessibleCarPlaces',
                    'availability.carPlaces',
                    'capacity.carPlaces',
                  ]),
                  freeDisabled:
                    i.properties['availability.wheelchairAccessibleCarPlaces'],
                  totalDisabled:
                    i.properties['capacity.wheelchairAccessibleCarPlaces'],
                  free: i.properties['availability.carPlaces'],
                  total: i.properties['capacity.carPlaces'],
                },
              };
            });

          this.features.forEach(actionFn);
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });

  fetchAndDrawStatus = ({ geom, properties }) => {
    if (this.tile.coords.z <= this.config.parkAndRide.smallIconZoom) {
      return drawStopIcon(
        this.tile,
        geom,
        'car',
        null,
        null,
        null,
        this.config.colors.iconColors,
      );
    }

    const tags = properties.tags.split(',').reduce((newTags, tag) => {
      return { ...newTags, [tag.split(':')[0]]: tag.split(':')[1] };
    }, {});

    const icon = getIcon(tags.lot_type);

    let isOpenNow = true;
    if (properties.opening_hours) {
      const opening = new SimpleOpeningHours(properties.opening_hours);
      isOpenNow = opening.isOpen();
    }

    return drawIcon(
      `icon-icon_${icon}`,
      this.tile,
      geom,
      this.parkingLotImageSize,
    ).then(() => {
      const { state, free, total, freeDisabled, totalDisabled } = properties;
      const hasBothDisabledAndRegular =
        isNumber(free) && isNumber(freeDisabled);
      const hasOnlyRegular = isNumber(free) && !isNumber(freeDisabled);
      const hasOnlyDisabled = !isNumber(free) && isNumber(freeDisabled);
      const percentFree = free / total;
      const percentFreeDisabled = freeDisabled / totalDisabled;

      // what percentage needs to be free in order to get a green icon
      const percentFreeBadgeThreshold = 0.1;

      let avail;
      if (
        (hasOnlyRegular && free === 0) ||
        (hasOnlyDisabled && freeDisabled === 0) ||
        !isOpenNow ||
        state === 'closed'
      ) {
        avail = 'no';
      } else if (
        (hasBothDisabledAndRegular || hasOnlyRegular) &&
        percentFree < percentFreeBadgeThreshold
      ) {
        avail = 'poor';
      } else if (percentFreeDisabled < percentFreeBadgeThreshold) {
        avail = 'poor';
      } else if (
        percentFree > percentFreeBadgeThreshold ||
        percentFreeDisabled > percentFreeBadgeThreshold
      ) {
        avail = 'good';
      }
      if (avail) {
        drawAvailabilityBadge(
          avail,
          this.tile,
          geom,
          this.parkingLotImageSize,
          this.availabilityImageSize,
          this.scaleratio,
        );
      }
    });
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'parkAndRide';
}

export default ParkAndRideForCars;
