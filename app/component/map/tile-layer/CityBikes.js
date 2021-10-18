import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  getMapIconScale,
  drawCitybikeIcon,
  getStopIconStyles,
} from '../../../util/mapIconUtils';
import { showCitybikeNetwork } from '../../../util/modeUtils';

import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCitybikeCapacity,
  BIKEAVL_UNKNOWN,
} from '../../../util/citybikes';

const timeOfLastFetch = {};

const query = graphql`
  query CityBikesQuery($id: String!) {
    station: bikeRentalStation(id: $id) {
      stationId
      bikesAvailable
      networks
      state
      rentalUris {
        web
      }
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
              if (
                feature.properties.networks !== 'cargo-bike' ||
                this.config.cityBike.networks['cargo-bike']
              ) {
                this.features.push(pick(feature, ['geom', 'properties']));
              }
            }
          }

          this.features.forEach(actionFn);
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });

  fetchAndDrawStatus = ({ geom, properties: { id, networks } }) => {
    // FIXME remove network rewrite as soon as config/OTP is updated
    let patchedNetworks = networks;
    if (patchedNetworks === 'taxi') {
      patchedNetworks = 'de.mfdz.gbfs.taxi.herrenberg';
    } else if (patchedNetworks === 'de.openbikebox.stadt-herrenberg') {
      patchedNetworks = 'cargo-bike';
    } else {
      console.log(patchedNetworks);
    }
    if (
      (this.tile.stopsToShow && !this.tile.stopsToShow.includes(id)) ||
      !showCitybikeNetwork(this.config.cityBike.networks[patchedNetworks])
    ) {
      return;
    }
    const lastFetch = timeOfLastFetch[id];
    const currentTime = new Date().getTime();

    const iconName = getCityBikeNetworkIcon(
      getCityBikeNetworkConfig(getCityBikeNetworkId(patchedNetworks), this.config),
    );
    const citybikeCapacity = getCitybikeCapacity(this.config, patchedNetworks);
    const iconColor =
      iconName.includes('secondary') &&
      this.config.colors.iconColors['mode-citybike-secondary']
        ? this.config.colors.iconColors['mode-citybike-secondary']
        : this.config.colors.iconColors['mode-citybike'];

    const isHilighted = this.tile.hilightedStops?.includes(id);

    const callback = ({ station: result }) => {
      timeOfLastFetch[id] = new Date().getTime();
      if (result) {
        drawCitybikeIcon(
          this.tile,
          geom,
          result.state,
          result.bikesAvailable,
          iconName,
          citybikeCapacity !== BIKEAVL_UNKNOWN,
          iconColor,
          isHilighted,
        );
      }
      return this;
    };

    const zoom = this.tile.coords.z - 1;
    // If small icon is shown, enough information is within vector tile
    // and no need to fetch additional data from routing
    if (getStopIconStyles('citybike', zoom, isHilighted)?.style === 'small') {
      drawCitybikeIcon(
        this.tile,
        geom,
        undefined,
        undefined,
        iconName,
        citybikeCapacity !== BIKEAVL_UNKNOWN,
        iconColor,
        false,
      );
    } else if (lastFetch && currentTime - lastFetch <= 30000) {
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
