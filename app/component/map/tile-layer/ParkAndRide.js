import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawParkAndRideIcon } from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { ParkTypes } from '../../../constants';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';

const showParking = 17;

export default class ParkAndRide {
  constructor(tile, config, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.width = 24 * scaleratio;
    this.height = 24 * scaleratio;
  }

  fetchAndDrawParks(parkType, lang) {
    const hubHasSpaces = (type, feature) => {
      const { vehicleParking } = feature.properties;
      if (Array.isArray(vehicleParking)) {
        for (let i = 0; i < vehicleParking.length; i++) {
          const park = vehicleParking[i];
          if (type === ParkTypes.Car ? park.carPlaces : park.bicyclePlaces) {
            return true;
          }
        }
      }
      return false;
    };

    const hasSpaces = (type, feature) => {
      return type === ParkTypes.Car
        ? feature.properties.anyCarPlaces
        : feature.properties.bicyclePlaces;
    };

    if (this.tile.coords.z < showParking) {
      return fetchWithLanguageAndSubscription(
        `${getLayerBaseUrl(this.config.URL.PARK_AND_RIDE_GROUP_MAP, lang)}${
          this.tile.coords.z + (this.tile.props.zoomOffset || 0)
        }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
        this.config,
        lang,
      ).then(res => {
        if (res.status !== 200) {
          return undefined;
        }

        return res.arrayBuffer().then(
          buf => {
            const vt = new VectorTile(new Protobuf(buf));
            this.features = [];

            if (vt.layers.vehicleParkingGroups != null) {
              for (let i = 0; i < vt.layers.vehicleParkingGroups.length; i++) {
                const feature = vt.layers.vehicleParkingGroups.feature(i);
                feature.properties.vehicleParking = feature.properties
                  .vehicleParking
                  ? JSON.parse(feature.properties.vehicleParking)
                  : undefined;
                if (hubHasSpaces(parkType, feature)) {
                  [[feature.geom]] = feature.loadGeometry();
                  this.features.push(pick(feature, ['geom', 'properties']));
                  drawParkAndRideIcon(
                    parkType,
                    this.tile,
                    feature.geom,
                    this.width,
                    this.height,
                  );
                }
              }
            }
          },
          err => console.log(err), // eslint-disable-line no-console
        );
      });
    }

    return fetchWithLanguageAndSubscription(
      `${getLayerBaseUrl(this.config.URL.PARK_AND_RIDE_MAP, lang)}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
      this.config,
      lang,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];

          if (vt.layers.vehicleParking != null) {
            for (let i = 0; i < vt.layers.vehicleParking.length; i++) {
              const feature = vt.layers.vehicleParking.feature(i);
              if (hasSpaces(parkType, feature)) {
                [[feature.geom]] = feature.loadGeometry();
                this.features.push(feature);
                const isHilighted =
                  this.tile.hilightedStops &&
                  this.tile.hilightedStops.includes(feature.properties.id);
                drawParkAndRideIcon(
                  parkType,
                  this.tile,
                  feature.geom,
                  this.width,
                  this.height,
                  isHilighted,
                );
              }
            }
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}
