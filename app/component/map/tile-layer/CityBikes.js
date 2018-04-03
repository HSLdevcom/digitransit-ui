import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import Relay from 'react-relay/classic';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  drawRoundIcon,
  drawCitybikeIcon,
  drawCitybikeOffIcon,
  drawAvailabilityBadge,
} from '../../../util/mapIconUtils';
import glfun from '../../../util/glfun';

import { BIKESTATION_ON, BIKESTATION_OFF } from '../../../util/citybikes';

const getScale = glfun({
  base: 1,
  stops: [[13, 0.8], [20, 1.6]],
});

const timeOfLastFetch = {};

class CityBikes {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.citybikeImageSize =
      16 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      8 * this.scaleratio * getScale(this.tile.coords.z);
    this.notInUseImageSize =
      12 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.fetchAndDrawStatus);
  }

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.CITYBIKE_MAP}` +
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

          if (vt.layers.stations != null) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              [[feature.geom]] = feature.loadGeometry();
              this.features.push(pick(feature, ['geom', 'properties']));
            }
          }

          this.features.forEach(actionFn);
        },
        err => console.log(err),
      );
    });

  fetchAndDrawStatus = ({ geom, properties: { id } }) => {
    const query = Relay.createQuery(
      Relay.QL`
    query Test($id: String!){
      bikeRentalStation(id: $id) {
        bikesAvailable
        spacesAvailable
        state
      }
    }`,
      { id },
    );

    const lastFetch = timeOfLastFetch[id];
    const currentTime = new Date().getTime();

    const callback = readyState => {
      if (readyState.done) {
        timeOfLastFetch[id] = new Date().getTime();
        const result = Relay.Store.readQuery(query)[0];

        if (result) {
          if (
            this.tile.coords.z <= this.config.cityBike.cityBikeSmallIconZoom
          ) {
            let mode;
            if (result.state !== BIKESTATION_ON) {
              mode = 'citybike-off';
            } else {
              mode = 'citybike';
            }
            return drawRoundIcon(this.tile, geom, mode);
          }

          if (result.state !== BIKESTATION_ON) {
            drawCitybikeOffIcon(this.tile, geom, this.citybikeImageSize);
            if (result.state !== BIKESTATION_OFF) {
              return this; // Draw just plain grey base icon
            }
          } else {
            drawCitybikeIcon(this.tile, geom, this.citybikeImageSize);
          }
          if (result.state === BIKESTATION_OFF || result.bikesAvailable === 0) {
            drawAvailabilityBadge(
              'no',
              this.tile,
              geom,
              this.citybikeImageSize,
              this.availabilityImageSize,
              this.scaleratio,
            );
          } else if (
            result.bikesAvailable > this.config.cityBike.fewAvailableCount
          ) {
            drawAvailabilityBadge(
              'good',
              this.tile,
              geom,
              this.citybikeImageSize,
              this.availabilityImageSize,
              this.scaleratio,
            );
          } else {
            drawAvailabilityBadge(
              'poor',
              this.tile,
              geom,
              this.citybikeImageSize,
              this.availabilityImageSize,
              this.scaleratio,
            );
          }
        }
      }
      return this;
    };

    if (lastFetch && currentTime - lastFetch <= 30000) {
      Relay.Store.primeCache(
        {
          query,
        },
        callback,
      );
    } else {
      Relay.Store.forceFetch(
        {
          query,
        },
        callback,
      );
    }
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'citybike';
}

export default CityBikes;
