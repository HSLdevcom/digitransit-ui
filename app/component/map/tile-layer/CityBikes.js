import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import { getMapIconScale, drawCitybikeIcon } from '../../../util/mapIconUtils';

import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  BIKEAVL_UNKNOWN,
} from '../../../util/citybikes';

const timeOfLastFetch = {};

const query = graphql`
  query CityBikesQuery($id: String!) {
    station: bikeRentalStation(id: $id) {
      stationId
      bikesAvailable
      spacesAvailable
      capacity
      networks
      state
    }
  }
`;

class CityBikes {
  constructor(tile, config, mapLayers, relayEnvironment) {
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

          const layer = vt.layers.citybikes;

          if (layer != null) {
            for (let i = 0, ref = layer.length - 1; i <= ref; i++) {
              const feature = layer.feature(i);
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
      const isHilighted = this.tile.hilightedStops?.includes(result.stationId);
      timeOfLastFetch[id] = new Date().getTime();
      if (result) {
        const iconName = getCityBikeNetworkIcon(
          getCityBikeNetworkConfig(
            getCityBikeNetworkId(result.networks),
            this.config,
          ),
        );
        if (
          !this.tile.stopsToShow ||
          this.tile.stopsToShow.includes(result.stationId)
        ) {
          drawCitybikeIcon(
            this.tile,
            geom,
            result.state,
            result.bikesAvailable,
            iconName,
            this.config.cityBike.capacity !== BIKEAVL_UNKNOWN,
            this.config.colors.iconColors['mode-citybike'],
            isHilighted,
          );
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
