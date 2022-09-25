import ParkAndRide from './ParkAndRide';
import { ParkTypes } from '../../../constants';

export default class ParkAndRideForCars extends ParkAndRide {
  constructor(tile, config, mapLayers, relayEnvironment) {
    super(tile, config, relayEnvironment);
    this.promise = this.getPromise();
  }

  static getName = () => 'parkAndRide';

  getPromise() {
    return this.fetchAndDrawParks(ParkTypes.Car);
  }
}
