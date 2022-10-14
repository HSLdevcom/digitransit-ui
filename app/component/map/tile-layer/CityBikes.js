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

const fetchedStations = {};
let lastFetch = new Date().getTime();

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
  }

  fetchWithAction = () =>
    fetchWithSubscription(
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
          this.featureGeoms = {};

          if (vt.layers.stations != null) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              if (
                showCitybikeNetwork(
                  this.config.cityBike.networks[feature.properties.networks],
                )
              ) {
                [[feature.geom]] = feature.loadGeometry();
                if (!this.featureGeoms[feature.properties.id]) {
                  this.featureGeoms[feature.properties.id] = feature.geom;
                }
                this.features.push(pick(feature, ['geom', 'properties']));
              }
            }
          }
          const currentTime = new Date().getTime();
          const stationIds = this.features.map(
            feature => feature.properties.id,
          );
          const shouldFetch = !stationIds.every(
            stationId => fetchedStations[stationId],
          );

          const drawCitybikeIcons = station => {
            const iconName = getCityBikeNetworkIcon(
              getCityBikeNetworkConfig(
                getCityBikeNetworkId(station.networks),
                this.config,
              ),
            );
            const citybikeCapacity = getCitybikeCapacity(
              this.config,
              station.networks,
            );
            const iconColor =
              iconName.includes('secondary') &&
              this.config.colors.iconColors['mode-citybike-secondary']
                ? this.config.colors.iconColors['mode-citybike-secondary']
                : this.config.colors.iconColors['mode-citybike'];
            const isHilighted = this.tile.hilightedStops?.includes(
              station.stationId,
            );
            const vtGeom = this.featureGeoms[station.stationId];
            drawCitybikeIcon(
              this.tile,
              vtGeom,
              station.state,
              station.bikesAvailable,
              iconName,
              citybikeCapacity !== BIKEAVL_UNKNOWN,
              iconColor,
              isHilighted,
            );
          };

          // Fetch if stations haven't been fetched at all or more than 30 seconds ago
          if (
            (stationIds.length > 0 && shouldFetch) ||
            !lastFetch ||
            currentTime - lastFetch > 30000
          ) {
            fetchQuery(
              this.relayEnvironment,
              query,
              { ids: stationIds },
              { force: true },
            ).then(({ stations }) => {
              lastFetch = currentTime;
              stations.forEach(station => {
                if (!fetchedStations[station.stationId]) {
                  fetchedStations[station.stationId] = station;
                }
                drawCitybikeIcons(station);
              });
            });
          } else {
            // Only draw if nothing needs to be fetched
            stationIds.forEach(id => {
              const fetchedStation = fetchedStations[id];
              drawCitybikeIcons(fetchedStation);
            });
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction();
    }
  };

  static getName = () => 'citybike';
}

export default CityBikes;
