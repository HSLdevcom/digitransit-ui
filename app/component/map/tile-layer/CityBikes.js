import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import { getMapIconScale, drawCitybikeIcon } from '../../../util/mapIconUtils';
import { showCitybikeNetwork } from '../../../util/modeUtils';

import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCitybikeCapacity,
  BIKEAVL_UNKNOWN,
} from '../../../util/citybikes';

import { fetchWithSubscription } from '../../../util/fetchUtils';

const query = graphql`
  query CityBikesQuery($ids: [String!]) {
    stations: bikeRentalStations(ids: $ids) {
      stationId
      bikesAvailable
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
    this.promise = this.fetchWithAction();
    this.lastFetch = new Date().getTime();
  }

  fetchWithAction = () => {
    return fetchWithSubscription(
      `${this.config.URL.CITYBIKE_MAP}` +
        `${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}/` +
        `${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
      this.config,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }
      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];
          this.featureMap = {};
          if (vt.layers.stations != null) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              const { id } = feature.properties;
              if (
                (!this.tile.stopsToShow ||
                  this.tile.stopsToShow.includes(id)) &&
                showCitybikeNetwork(
                  this.config.cityBike.networks[feature.properties.networks],
                )
              ) {
                [[feature.geom]] = feature.loadGeometry();
                this.featureMap[id] = pick(feature, ['geom', 'properties']);
                this.features.push(this.featureMap[id]); // tilelayer wants an array
              }
            }
          }
          this.updateStations();
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  };

  updateStations = () => {
    this.lastFetch = new Date().getTime();
    if (this.features?.length) {
      const stationIds = this.features.map(feature => feature.properties.id);
      fetchQuery(
        this.relayEnvironment,
        query,
        { ids: stationIds },
        { force: true },
      ).then(({ stations }) => {
        stations.forEach(station => {
          this.drawIcon(station, this.featureMap[station.stationId].geom);
        });
      });
    }
    return true;
  };

  drawIcon = (station, geom) => {
    const iconName = getCityBikeNetworkIcon(
      getCityBikeNetworkConfig(
        getCityBikeNetworkId(station.networks),
        this.config,
      ),
    );
    const citybikeCapacity = getCitybikeCapacity(this.config, station.networks);
    const iconColor =
      iconName.includes('secondary') &&
      this.config.colors.iconColors['mode-citybike-secondary']
        ? this.config.colors.iconColors['mode-citybike-secondary']
        : this.config.colors.iconColors['mode-citybike'];
    const isHilighted = this.tile.hilightedStops?.includes(station.stationId);
    drawCitybikeIcon(
      this.tile,
      geom,
      station.state,
      station.bikesAvailable,
      iconName,
      citybikeCapacity !== BIKEAVL_UNKNOWN,
      iconColor,
      isHilighted,
    );
  };

  onTimeChange = () => {
    const currentTime = new Date().getTime();
    if (
      this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom &&
      currentTime - this.lastFetch > 30000
    ) {
      this.updateStations();
    }
  };

  static getName = () => 'citybike';
}

export default CityBikes;
