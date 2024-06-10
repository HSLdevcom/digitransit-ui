import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  getMapIconScale,
  drawCitybikeIcon,
  drawSmallVehicleRentalMarker,
} from '../../../util/mapIconUtils';
import { showCitybikeNetwork } from '../../../util/modeUtils';

import {
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
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
    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
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
      this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom;
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
                this.features.push(pick(feature, ['geom', 'properties']));
              }
            }

            // Must filter out stations that are not shown as there can be a large amount of invisible rental stations,
            // which are often accidentally clicked
            this.features = this.features.filter(feature =>
              this.shouldShowStation(
                feature.properties.id,
                feature.properties.network,
                feature.properties.formFactors,
              ),
            );
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
    const { id, network, formFactors } = feature.properties;
    if (!this.shouldShowStation(id, network, formFactors)) {
      return;
    }

    const iconName = getVehicleRentalStationNetworkIcon(
      getVehicleRentalStationNetworkConfig(network, this.config),
    );
    const isHilighted = this.tile.hilightedStops?.includes(id);

    if (zoomedIn) {
      this.drawLargeIcon(feature, iconName, isHilighted);
    } else if (isHilighted) {
      this.canHaveStationUpdates = true;
      this.drawHighlighted(feature, iconName);
    } else {
      this.drawSmallMarker(feature.geom, iconName, formFactors);
    }
  };

  drawLargeIcon = (
    { geom, properties: { network, operative, vehiclesAvailable } },
    iconName,
    isHilighted,
  ) => {
    const citybikeCapacity = getVehicleCapacity(this.config, network);

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
        );
      }
      return this;
    };

    fetchQuery(this.relayEnvironment, query, { id }, { force: true })
      .toPromise()
      .then(callback);
  };

  drawSmallMarker = (geom, iconName, formFactor) => {
    const citybikeIconColor =
      iconName.includes('secondary') &&
      this.config.colors.iconColors['mode-citybike-secondary']
        ? this.config.colors.iconColors['mode-citybike-secondary']
        : this.config.colors.iconColors['mode-citybike'];
    const iconColor =
      formFactor === 'SCOOTER'
        ? this.config.colors.iconColors['mode-scooter']
        : citybikeIconColor;
    drawSmallVehicleRentalMarker(this.tile, geom, iconColor, formFactor);
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
    this.config.cityBike.networks[network].showRentalStations &&
    (!this.tile.stopsToShow || this.tile.stopsToShow.includes(id)) &&
    !this.tile.objectsToHide.vehicleRentalStations.includes(id) &&
    showCitybikeNetwork(this.config.cityBike.networks[network]);

  static getName = () => 'citybike';
}

export default VehicleRentalStations;
