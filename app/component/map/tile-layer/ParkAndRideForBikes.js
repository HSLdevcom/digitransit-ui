import { fetchQuery } from 'react-relay';
import { VectorTile } from '@mapbox/vector-tile';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';
import Protobuf from 'pbf';

import { drawParkAndRideForBikesIcon } from '../../../util/mapIconUtils';
import { Contour } from '../../../util/geo-utils';
import { isBrowser } from '../../../util/browser';

import bikeParksQuery from './bikeParks';
import bikeParkQuery from './bikePark';

const showFacilities = 17;

export default class ParkAndRideForBikes {
  constructor(tile, config, mapLayers, relayEnvironment) {
    this.tile = tile;
    this.config = config;
    this.relayEnvironment = relayEnvironment;
    const scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.width = 24 * scaleratio;
    this.height = 24 * scaleratio;
    this.promise = this.getPromise();
  }

  static getName = () => 'parkAndRideForBikes';

  getPromise() {
    return fetch(
      `${this.config.URL.PARK_AND_RIDE_MAP}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];

          if (this.tile.coords.z < showFacilities && vt.layers.hubs != null) {
            for (let i = 0, ref = vt.layers.hubs.length - 1; i <= ref; i++) {
              const feature = vt.layers.hubs.feature(i);
              fetchQuery(this.relayEnvironment, bikeParksQuery, {
                ids: JSON.parse(feature.properties.facilityIds).map(id =>
                  id.toString(),
                ),
              }).then(data => {
                const result = compact(data.bikeParks);
                if (!isEmpty(result)) {
                  feature.properties.facilities = result;
                  [[feature.geom]] = feature.loadGeometry();
                  this.features.push(pick(feature, ['geom', 'properties']));
                  drawParkAndRideForBikesIcon(
                    this.tile,
                    feature.geom,
                    this.width,
                    this.height,
                  );
                }
              });
            }
          } else if (
            this.tile.coords.z >= showFacilities &&
            vt.layers.facilities != null
          ) {
            for (
              let i = 0, ref = vt.layers.facilities.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.facilities.feature(i);
              fetchQuery(this.relayEnvironment, bikeParkQuery, {
                id: feature.id.toString(),
              }).then(data => {
                const result = data.bikePark;
                if (result != null && result.id != null) {
                  feature.properties.facility = result;
                  const isHilighted =
                    this.tile.hilightedStops &&
                    this.tile.hilightedStops.includes(
                      feature.properties?.facility?.bikeParkId,
                    );
                  feature.geom = new Contour(
                    feature.loadGeometry()[0],
                  ).centroid();
                  this.features.push(feature);
                  drawParkAndRideForBikesIcon(
                    this.tile,
                    feature.geom,
                    this.width,
                    this.height,
                    isHilighted,
                  );
                }
              });
            }
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}
