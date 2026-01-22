import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawParkAndRideIcon } from '../../../util/mapIconUtils';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import { ParkTypes } from '../../../constants';
import { getLayerBaseUrl } from '../../../util/mapLayerUtils';

const showParking = 15;
const iconSizeMap = {
  12: {
    width: 12,
    height: 12,
  },
  13: {
    width: 12,
    height: 12,
  },
  14: {
    width: 18,
    height: 18,
  },
  15: {
    width: 24,
    height: 24,
  },
  16: {
    width: 28,
    height: 28,
  },
  17: {
    width: 30,
    height: 30,
  },
};

export default class ParkAndRide {
  constructor(tile, config, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    const scaleratio = window.devicePixelRatio || 1;
    const zoom = tile.coords.z;
    // limit index between min and max values of lookup map
    const zoomIndex = Math.min(Math.max(zoom, 12), 17);
    this.width = iconSizeMap[zoomIndex].width * scaleratio;
    this.height = iconSizeMap[zoomIndex].height * scaleratio;
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
                const isHighlighted =
                  this.tile.highlightedStops &&
                  this.tile.highlightedStops.includes(feature.properties.id);
                drawParkAndRideIcon(
                  parkType,
                  this.tile,
                  feature.geom,
                  this.width,
                  this.height,
                  isHighlighted,
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
