import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  getMapIconScale,
  drawCitybikeIcon,
  drawSmallCitybikeMarker,
} from '../../../util/mapIconUtils';
import { showCitybikeNetwork } from '../../../util/modeUtils';

import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCitybikeCapacity,
  BIKEAVL_UNKNOWN,
} from '../../../util/citybikes';
import { getIdWithoutFeed } from '../../../util/feedScopedIdUtils';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';

const query = graphql`
  query BikeRentalStationsQuery($id: String!) {
    station: vehicleRentalStation(id: $id) {
      vehiclesAvailable
      operative
    }
  }
`;

const REALTIME_REFETCH_FREQUENCY = 60000; // 60 seconds

class BikeRentalStations {
  constructor(tile, config, mapLayers, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.citybikeImageSize =
      20 * this.scaleratio * getMapIconScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getMapIconScale(this.tile.coords.z);
    this.timeOfLastFetch = undefined;
    this.canHaveStationUpdates = true;
  }

  getPromise = lang => this.fetchAndDraw(lang);

  getLayerBaseUrl = zoomedIn => {
    return zoomedIn
      ? this.config.URL.REALTIME_RENTAL_STATION_MAP
      : this.config.URL.RENTAL_STATION_MAP;
  };

  getLayerName = zoomedIn => {
    return zoomedIn ? 'realtimeRentalStations' : 'rentalStations';
  };

  fetchAndDraw = lang => {
    const zoomedIn =
      this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom;
    const baseUrl = getLayerBaseUrl(this.getLayerBaseUrl(zoomedIn), lang);
    const tileUrl = `${baseUrl}${
      this.tile.coords.z + (this.tile.props.zoomOffset || 0)
    }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`;
    return fetchWithLanguageAndSubscription(tileUrl, this.config, lang)
      .then(res => {
        this.timeOfLastFetch = new Date().getTime();
        if (res.status !== 200) {
          return undefined;
        }

        return res.arrayBuffer().then(
          buf => {
            const vt = new VectorTile(new Protobuf(buf));

            this.features = [];

            const layer = vt.layers[this.getLayerName(zoomedIn)];

            if (layer) {
              for (let i = 0, ref = layer.length - 1; i <= ref; i++) {
                const feature = layer.feature(i);
                [[feature.geom]] = feature.loadGeometry();

                // TODO use feedScopedId here
                feature.properties.id = getIdWithoutFeed(feature.properties.id);

                this.features.push(pick(feature, ['geom', 'properties']));
              }
            }

            if (
              this.features.length === 0 ||
              !this.features.some(feature =>
                this.shouldShowStation(
                  feature.properties.id,
                  feature.properties.network,
                ),
              )
            ) {
              this.canHaveStationUpdates = false;
            } else {
              // if zoomed out and there is a highlighted station,
              // this value will be later reset to true
              this.canHaveStationUpdates = zoomedIn;
              this.features.forEach(feature => this.draw(feature, zoomedIn));
            }
          },
          // todo: console.error or even better remove it
          err => console.log(err), // eslint-disable-line no-console
        );
      })
      .catch(err => {
        this.timeOfLastFetch = new Date().getTime();
        console.error(err); // eslint-disable-line no-console
      });
  };

  draw = (feature, zoomedIn) => {
    const { id, network } = feature.properties;
    if (!this.shouldShowStation(id, network)) {
      return;
    }

    const iconName = getCityBikeNetworkIcon(
      getCityBikeNetworkConfig(getCityBikeNetworkId(network), this.config),
    );
    const isHilighted = this.tile.hilightedStops?.includes(id);

    if (zoomedIn) {
      this.drawLargeIcon(feature, iconName, isHilighted);
    } else if (isHilighted) {
      this.canHaveStationUpdates = true;
      this.drawHighlighted(feature, iconName);
    } else {
      this.drawSmallMarker(feature.geom, iconName);
    }
  };

  drawLargeIcon = (
    { geom, properties: { network, operative, vehiclesAvailable } },
    iconName,
    isHilighted,
  ) => {
    const citybikeCapacity = getCitybikeCapacity(this.config, network);

    drawCitybikeIcon(
      this.tile,
      geom,
      operative,
      vehiclesAvailable,
      iconName,
      citybikeCapacity !== BIKEAVL_UNKNOWN,
      isHilighted,
    );
  };

  drawHighlighted = ({ geom, properties: { id, network } }, iconName) => {
    const citybikeCapacity = getCitybikeCapacity(this.config, network);

    const callback = ({ station: result }) => {
      if (result) {
        drawCitybikeIcon(
          this.tile,
          geom,
          result.operative,
          result.vehiclesAvailable,
          iconName,
          citybikeCapacity !== BIKEAVL_UNKNOWN,
          true,
        );
      }
      return this;
    };

    const idForFetching = `${network}:${id}`;

    fetchQuery(
      this.relayEnvironment,
      query,
      { id: idForFetching },
      { force: true },
    ).then(callback);
  };

  drawSmallMarker = (geom, iconName) => {
    const iconColor =
      iconName.includes('secondary') &&
      this.config.colors.iconColors['mode-citybike-secondary']
        ? this.config.colors.iconColors['mode-citybike-secondary']
        : this.config.colors.iconColors['mode-citybike'];
    drawSmallCitybikeMarker(this.tile, geom, iconColor);
  };

  onTimeChange = lang => {
    const currentTime = new Date().getTime();
    if (
      this.canHaveStationUpdates &&
      (!this.timeOfLastFetch ||
        currentTime - this.timeOfLastFetch > REALTIME_REFETCH_FREQUENCY)
    ) {
      this.fetchAndDraw(lang);
    }
  };

  shouldShowStation = (id, network) =>
    (!this.tile.stopsToShow || this.tile.stopsToShow.includes(id)) &&
    showCitybikeNetwork(this.config.cityBike.networks[network]);

  static getName = () => 'citybike';
}

export default BikeRentalStations;
