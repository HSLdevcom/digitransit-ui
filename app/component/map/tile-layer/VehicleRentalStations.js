import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import {
  getMapIconScale,
  drawCitybikeIcon,
  drawSmallVehicleRentalMarker,
} from '../../../util/mapIconUtils';
import { showCitybikeNetwork } from '../../../util/modeUtils';

import {
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getVehicleCapacity,
  BIKEAVL_UNKNOWN,
} from '../../../util/vehicleRentalUtils';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';

const query = graphql`
  query VehicleRentalStationsQuery($id: String!) {
    station: vehicleRentalStation(id: $id) {
      availableVehicles {
        total
      }
      operative
    }
  }
`;

const REALTIME_REFETCH_FREQUENCY = 60000; // 60 seconds

class VehicleRentalStations {
  constructor(tile, config, mapLayers, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    this.scaleratio = window.devicePixelRatio || 1;
    this.citybikeImageSize =
      20 * this.scaleratio * getMapIconScale(this.tile.coords.z);
    this.availabilityImageSize =
      14 * this.scaleratio * getMapIconScale(this.tile.coords.z);
    this.timeOfLastFetch = undefined;
    this.canHaveStationUpdates = true;
  }

  getPromise = lang => this.fetchAndDraw(lang);

  fetchAndDraw = lang => {
    const zoomedIn =
      this.tile.coords.z > this.config.vehicleRental.cityBikeSmallIconZoom;
    const baseUrl = zoomedIn
      ? getLayerBaseUrl(this.config.URL.REALTIME_RENTAL_STATION_MAP, lang)
      : getLayerBaseUrl(this.config.URL.RENTAL_STATION_MAP, lang);
    const tileUrl = `${baseUrl}${
      this.tile.coords.z + (this.tile.props.zoomOffset || 0)
    }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`;
    return fetchWithLanguageAndSubscription(tileUrl, this.config, lang)
      .then(res => {
        this.timeOfLastFetch = Date.now();
        if (res.status !== 200) {
          return undefined;
        }

        return res.arrayBuffer().then(
          buf => {
            const vt = new VectorTile(new Protobuf(buf));

            this.features = [];

            const layer =
              vt.layers.rentalStations || vt.layers.realtimeRentalStations;

            if (layer) {
              for (let i = 0, ref = layer.length - 1; i <= ref; i++) {
                const feature = layer.feature(i);
                [[feature.geom]] = feature.loadGeometry();
                // Must filter out stations that are not shown as there can be a large amount
                // of invisible rental stations, which are often accidentally clicked
                if (
                  this.shouldShowStation(
                    feature.properties.id,
                    feature.properties.network,
                  )
                ) {
                  this.features.push(pick(feature, ['geom', 'properties']));
                }
              }
            }

            if (this.features.length === 0) {
              this.canHaveStationUpdates = false;
            } else {
              // if zoomed out and there is a highlighted station,
              // this value will be later reset to true
              this.canHaveStationUpdates = zoomedIn;
              this.features.forEach(feature => this.draw(feature, zoomedIn));
            }
          },
          err => console.log(err), // eslint-disable-line no-console
        );
      })
      .catch(err => {
        this.timeOfLastFetch = Date.now();
        console.log(err); // eslint-disable-line no-console
      });
  };

  draw = (feature, zoomedIn) => {
    const { id, network, formFactors, operative } = feature.properties;
    const isHighlighted = this.tile.highlightedStops?.includes(id);
    let name = getRentalNetworkIcon(
      getRentalNetworkConfig(network, this.config),
    );
    let color;
    if (formFactors === 'SCOOTER') {
      color = this.config.colors.iconColors['mode-scooter'];
    } else if (name.includes('secondary')) {
      color = this.config.colors.iconColors['mode-citybike-secondary'];
    } else {
      color = this.config.colors.iconColors['mode-citybike'];
    }
    if (operative === false) {
      name = 'icon_citybike';
      color = '#BBB';
    }

    if (zoomedIn) {
      this.drawLargeIcon(feature, name, color, isHighlighted);
    } else if (isHighlighted) {
      this.canHaveStationUpdates = true;
      this.drawHighlighted(feature, name, color);
    } else {
      drawSmallVehicleRentalMarker(this.tile, feature.geom, color, formFactors);
    }
  };

  drawLargeIcon = (
    { geom, properties: { network, operative, vehiclesAvailable } },
    iconName,
    color,
    isHighlighted,
  ) => {
    const citybikeCapacity = getVehicleCapacity(this.config, network);

    drawCitybikeIcon(
      this.tile,
      geom,
      operative,
      vehiclesAvailable,
      iconName,
      citybikeCapacity !== BIKEAVL_UNKNOWN,
      isHighlighted,
      color,
    );
  };

  drawHighlighted = (
    { geom, properties: { id, network } },
    iconName,
    color,
  ) => {
    const citybikeCapacity = getVehicleCapacity(this.config, network);
    const callback = ({ station: result }) => {
      if (result) {
        drawCitybikeIcon(
          this.tile,
          geom,
          result.operative,
          result.availableVehicles.total,
          iconName,
          citybikeCapacity !== BIKEAVL_UNKNOWN,
          true,
          color,
        );
      }
      return this;
    };

    fetchQuery(this.relayEnvironment, query, { id }, { force: true })
      .toPromise()
      .then(callback);
  };

  onTimeChange = lang => {
    const currentTime = Date.now();
    if (
      this.canHaveStationUpdates &&
      (!this.timeOfLastFetch ||
        currentTime - this.timeOfLastFetch > REALTIME_REFETCH_FREQUENCY)
    ) {
      this.fetchAndDraw(lang);
    }
  };

  shouldShowStation = (id, network) =>
    this.config.vehicleRental.networks[network] &&
    (this.config.vehicleRental.networks[network].showRentalStations ===
      undefined ||
      this.config.vehicleRental.networks[network].showRentalStations) &&
    (!this.tile.stopsToShow || this.tile.stopsToShow.includes(id)) &&
    !this.tile.objectsToHide.vehicleRentalStations.includes(id) &&
    showCitybikeNetwork(this.config.vehicleRental.networks[network]);

  static getName = () => 'citybike';
}

export default VehicleRentalStations;
