import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isEqual } from 'lodash';
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

const lastFetch = {};

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
    this.promise = this.fetchWithAction(this.fetchStations);
  }

  fetchWithAction = actionFn =>
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
          actionFn(this.features);
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });

  fetchStations = features => {
    const stationIds = features.map(feature => feature.properties.id);
    const networks = features[0] && features[0].properties?.networks;
    if (
      (this.tile.stopsToShow && !isEqual(this.tile.stopsToShow, stationIds)) ||
      !showCitybikeNetwork(this.config.cityBike.networks[networks])
    ) {
      return;
    }

    // Draw stops in callback after fetch
    const callback = ({ stations }) => {
      stations.forEach(station => {
        lastFetch[station.stationId] = new Date().getTime();
        const vtGeom = features.find(
          feature => feature.properties.id === station.stationId,
        ).geom;
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
      });
    };

    // Force refetch for stations that are new or haven't been queried in 30 seconds, normal for others
    const currentTime = new Date().getTime();
    const forceStationIds = stationIds.filter(
      stationId =>
        !lastFetch[stationId] || currentTime - lastFetch[stationId] >= 30000,
    );
    const upToDateStations = stationIds.filter(
      stationId => !forceStationIds.includes(stationId),
    );

    if (forceStationIds.length > 0) {
      fetchQuery(
        this.relayEnvironment,
        query,
        { ids: forceStationIds },
        { force: true },
      ).then(callback);
    }

    fetchQuery(this.relayEnvironment, query, { ids: upToDateStations }).then(
      callback,
    );
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchStations);
    }
  };

  static getName = () => 'citybike';
}

export default CityBikes;
