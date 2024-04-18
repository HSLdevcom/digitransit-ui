import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { graphql, fetchQuery } from 'react-relay';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  getMapIconScale,
  drawScooterIcon,
  drawSmallVehicleRentalMarker,
} from '../../../util/mapIconUtils';

import {
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
} from '../../../util/vehicleRentalUtils';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';
import { TransportMode } from '../../../constants';

const query = graphql`
  query RentalVehiclesQuery($id: String!) {
    station: rentalVehicle(id: $id) {
      vehicleId
      name
    }
  }
`;

const REALTIME_REFETCH_FREQUENCY = 60000; // 60 seconds

class RentalVehicles {
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
    let baseUrl = zoomedIn
      ? getLayerBaseUrl(this.config.URL.REALTIME_RENTAL_VEHICLE_MAP, lang)
      : getLayerBaseUrl(this.config.URL.RENTAL_VEHICLE_MAP, lang);

    if (this.tile.coords.z >= 14) {
      baseUrl = getLayerBaseUrl(
        this.config.URL.RENTAL_VEHICLE_CLUSTER_MEDIUM_MAP, // 100m
        lang,
      );
    }
    if (this.tile.coords.z >= 16) {
      baseUrl = getLayerBaseUrl(
        this.config.URL.RENTAL_VEHICLE_CLUSTER_CLOSE_MAP, // 50m
        lang,
      );
    }
    if (this.tile.coords.z >= 18) {
      baseUrl = getLayerBaseUrl(
        this.config.URL.RENTAL_VEHICLE_MAP, // No clustering
        lang,
      );
    }

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
            const layer =
              vt.layers.rentalVehicles ||
              vt.layers.realtimeRentalVehicles ||
              vt.layers.rentalVehicleClusterClose ||
              vt.layers.rentalVehicleClusterMedium ||
              vt.layers.rentalVehicleClusterFar;

            if (layer) {
              for (let i = 0, ref = layer.length - 1; i <= ref; i++) {
                const feature = layer.feature(i);
                [[feature.geom]] = feature.loadGeometry();
                this.features.push(pick(feature, ['geom', 'properties']));
              }
            }
            if (
              this.features.length === 0 ||
              !this.features.some(feature =>
                this.shouldShowRentalVehicle(
                  feature.properties.id,
                  feature.properties.network,
                  feature.properties.isDisabled,
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
          err => console.log(err), // eslint-disable-line no-console
        );
      })
      .catch(err => {
        this.timeOfLastFetch = new Date().getTime();
        console.log(err); // eslint-disable-line no-console
      });
  };

  draw = (feature, zoomedIn) => {
    const { id, network } = feature.properties;
    if (!this.shouldShowRentalVehicle(id, network)) {
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
      this.drawSmallScooterMarker(feature.geom, iconName);
    }
  };

  drawLargeIcon = (
    { geom, properties: { operative, vehiclesAvailable } },
    iconName,
    isHilighted,
  ) => {
    drawScooterIcon(
      this.tile,
      geom,
      operative,
      vehiclesAvailable,
      iconName,
      isHilighted,
    );
  };

  drawHighlighted = ({ geom, properties: { id } }, iconName) => {
    const callback = ({ station: result }) => {
      if (result) {
        drawScooterIcon(
          this.tile,
          geom,
          result.operative,
          result.vehiclesAvailable,
          iconName,
          true,
        );
      }
      return this;
    };

    fetchQuery(this.relayEnvironment, query, { id }, { force: true })
      .toPromise()
      .then(callback);
  };

  drawSmallScooterMarker = (geom, iconName) => {
    const iconColor =
      iconName.includes('secondary') &&
      this.config.colors.iconColors['mode-scooter-secondary']
        ? this.config.colors.iconColors['mode-scooter-secondary']
        : this.config.colors.iconColors['mode-scooter'];
    drawSmallVehicleRentalMarker(
      this.tile,
      geom,
      iconColor,
      TransportMode.Scooter,
    );
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

  shouldShowRentalVehicle = (id, network, isDisabled) =>
    (!this.tile.stopsToShow || this.tile.stopsToShow.includes(id)) &&
    this.config.cityBike.networks[network].enabled &&
    !isDisabled;

  static getName = () => 'scooter';
}

export default RentalVehicles;
