import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  drawAvailabilityBadge,
  drawAvailabilityValue,
  drawIcon,
  drawRoundIcon,
  getMapIconScale,
} from '../../../util/mapIconUtils';

import {
  BIKESTATION_ON,
  BIKESTATION_OFF,
  BIKESTATION_CLOSED,
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../../../util/citybikes';

const timeOfLastFetch = {};

const query = graphql`
  query CityBikesQuery($id: String!) {
    station: bikeRentalStation(id: $id) {
      bikesAvailable
      spacesAvailable
      networks
      state
    }
  }
`;

class CityBikes {
  constructor(tile, config, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.citybikeImageSize =
      20 * this.scaleratio * getMapIconScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getMapIconScale(this.tile.coords.z);

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
        err => console.log(err), // eslint-disable-line no-console
      );
    });

  fetchAndDrawStatus = ({ geom, properties: { id } }) => {
    const lastFetch = timeOfLastFetch[id];
    const currentTime = new Date().getTime();

    const callback = ({ station: result }) => {
      timeOfLastFetch[id] = new Date().getTime();

      if (result) {
        if (this.tile.coords.z <= this.config.cityBike.cityBikeSmallIconZoom) {
          let mode;
          if (result.state !== BIKESTATION_ON) {
            mode = 'citybike-off';
          } else {
            mode = 'citybike';
          }
          return drawRoundIcon(this.tile, geom, mode);
        }

        const iconName = getCityBikeNetworkIcon(
          getCityBikeNetworkConfig(
            getCityBikeNetworkId(result.networks),
            this.config,
          ),
        );

        if (result.state === BIKESTATION_CLOSED) {
          // Draw just plain grey base icon
          return drawIcon(
            `${iconName}_off`,
            this.tile,
            geom,
            this.citybikeImageSize,
          );
        }

        if (result.state === BIKESTATION_OFF) {
          return drawIcon(
            `${iconName}_off`,
            this.tile,
            geom,
            this.citybikeImageSize,
          ).then(() =>
            drawAvailabilityBadge(
              'no',
              this.tile,
              geom,
              this.citybikeImageSize,
              this.availabilityImageSize,
              this.scaleratio,
            ),
          );
        }

        if (result.state === BIKESTATION_ON) {
          return drawIcon(
            iconName,
            this.tile,
            geom,
            this.citybikeImageSize,
          ).then(() => {
            drawAvailabilityValue(
              this.tile,
              geom,
              result.bikesAvailable,
              this.citybikeImageSize,
              this.availabilityImageSize,
              this.scaleratio,
            );
          });
        }
      }
      return this;
    };

    if (lastFetch && currentTime - lastFetch <= 30000) {
      fetchQuery(this.relayEnvironment, query, { id }).then(callback);
    } else {
      fetchQuery(this.relayEnvironment, query, { id }, { force: true }).then(
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
