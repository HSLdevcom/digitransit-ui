import ParkAndRide from './ParkAndRide';
import { ParkTypes } from '../../../constants';

export default class ParkAndRideForCars extends ParkAndRide {
  constructor(tile, config, mapLayers, relayEnvironment, lang) {
    super(tile, config, relayEnvironment, lang);
  }

  static getName = () => 'parkAndRide';

  getPromise(lang) {
    return this.fetchAndDrawParks(ParkTypes.Car, lang);
  }
}
