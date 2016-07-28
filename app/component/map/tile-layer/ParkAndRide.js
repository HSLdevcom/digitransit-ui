import Relay from 'react-relay';
import { VectorTile } from 'vector-tile';

import without from 'lodash/without';
import Protobuf from 'pbf';
import config from '../../../config';
import { drawRoundIcon } from '../../../util/mapIconUtils';

export default class ParkAndRide {
  constructor(tile) {
    this.tile = tile;
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

        if (vt.layers.hubs != null) {
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
            }`, { ids: feature.properties.facilityIds.split(',') });
            Relay.Store.primeCache({
              query,
            }, readyState => {
              if (readyState.done) {
                const result = without(Relay.Store.readQuery(query));
                if (result) {
                  feature.properties.facilities = result;
                  this.features.push(feature);
                  drawRoundIcon(this.tile, feature.loadGeometry(), 'bus');
                }
              }
            });
          }
        }
      }, err => console.log(err));
    });
  }
}
