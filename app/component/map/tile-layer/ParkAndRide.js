import Relay from 'react-relay';
import { VectorTile } from 'vector-tile';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import Protobuf from 'pbf';

import config from '../../../config';
import { getImageFromSprite } from '../../../util/mapIconUtils';
import { Contour } from '../../../util/geo-utils';

const showFacilities = 17;

export default class ParkAndRide {
  constructor(tile) {
    this.tile = tile;
    const scaleratio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.width = 24 * scaleratio;
    this.height = 12 * scaleratio;
    this.promise = this.getPromise();
  }

  static getName = () => 'parkAndRide';

  getPromise() {
    return fetch(
      `${config.URL.PARK_AND_RIDE_MAP}${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}` +
      `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`
    )
    .then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(buf => {
        const vt = new VectorTile(new Protobuf(buf));

        this.features = [];

        if (this.tile.coords.z < showFacilities && vt.layers.hubs != null) {
          for (let i = 0, ref = vt.layers.hubs.length - 1; i <= ref; i++) {
            const feature = vt.layers.hubs.feature(i);
            const query = Relay.createQuery(Relay.QL`
            query ParkAndRide($ids: [String!]!){
              carParks(ids: $ids) {
                name
                maxCapacity
                spacesAvailable
                realtime
              }
            }`, { ids: JSON.parse(feature.properties.facilityIds) });
            Relay.Store.primeCache({
              query,
            }, readyState => {
              if (readyState.done) {
                const result = compact(Relay.Store.readQuery(query));
                if (!isEmpty(result)) {
                  feature.properties.facilities = result;
                  feature.geom = feature.loadGeometry()[0][0];
                  this.features.push(feature);
                  getImageFromSprite('icon-icon_park-and-ride', this.width, this.height)
                    .then(image => {
                      this.tile.ctx.drawImage(
                        image,
                        (feature.geom.x / this.tile.ratio) - (this.width / 2),
                        (feature.geom.y / this.tile.ratio) - (this.height / 2)
                      );
                    });
                }
              }
            });
          }
        } else if (this.tile.coords.z >= showFacilities && vt.layers.facilities != null) {
          for (let i = 0, ref = vt.layers.facilities.length - 1; i <= ref; i++) {
            const feature = vt.layers.facilities.feature(i);
            const query = Relay.createQuery(Relay.QL`
            query ParkAndRide($id: String!){
              carPark(id: $id) {
                name
                maxCapacity
                spacesAvailable
                realtime
              }
            }`, { id: feature.id });
            Relay.Store.primeCache({
              query,
            }, readyState => {
              if (readyState.done) {
                const result = compact(Relay.Store.readQuery(query));
                if (result != null && result.length !== 0) {
                  feature.properties.facility = result;
                  feature.geom = new Contour(feature.loadGeometry()[0]).centroid();
                  this.features.push(feature);
                  getImageFromSprite('icon-icon_park-and-ride', this.width, this.height)
                    .then(image => {
                      this.tile.ctx.drawImage(
                        image,
                        (feature.geom.x / this.tile.ratio) - (this.width / 2),
                        (feature.geom.y / this.tile.ratio) - (this.height / 2)
                      );
                    });
                }
              }
            });
          }
        }
      }, err => console.log(err));
    });
  }
}
