import { VectorTile } from '@mapbox/vector-tile';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawParkAndRideIcon } from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';
import { fetchWithSubscription } from '../../../util/fetchUtils';
import { ParkTypes } from '../../../constants';

const showFacilities = 17;

export default class ParkAndRide {
  constructor(tile, config, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.width = 24 * scaleratio;
    this.height = 24 * scaleratio;
    this.promise = this.getPromise();
  }

  fetchAndDrawParks(parkType) {
    const hasSpaces = (type, feature) => {
      return type === ParkTypes.Car
        ? feature.properties.anyCarPlaces
        : feature.properties.bicyclePlaces;
    };

    return fetchWithSubscription(
      `${this.config.URL.PARK_AND_RIDE_MAP}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
      this.config,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];

          // TODO use vehicle parking groups here
          if (
            this.tile.coords.z < showFacilities &&
            vt.layers.vehicleParkings != null
          ) {
            for (let i = 0; i < vt.layers.vehicleParkings.length; i++) {
              const feature = vt.layers.vehicleParkings.feature(i);
              if (hasSpaces(parkType, feature)) {
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
          } else if (
            this.tile.coords.z >= showFacilities &&
            vt.layers.vehicleParkings != null
          ) {
            for (let i = 0; i < vt.layers.vehicleParkings.length; i++) {
              const feature = vt.layers.vehicleParkings.feature(i);
              if (hasSpaces(parkType, feature)) {
                [[feature.geom]] = feature.loadGeometry();
                this.features.push(feature);
                const isHilighted =
                  this.tile.hilightedStops &&
                  this.tile.hilightedStops.includes(
                    feature.properties.id.split(':')[1],
                  );
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
