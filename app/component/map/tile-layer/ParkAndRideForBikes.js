import ParkAndRide from './ParkAndRide.js';
import { ParkTypes } from '../../../constants.js';

export default class ParkAndRideForBikes extends ParkAndRide {
  constructor(tile, config, mapLayers, relayEnvironment, lang) {
    super(tile, config, relayEnvironment, lang);
  }

  static getName = () => 'parkAndRideForBikes';

  getPromise(lang) {
    return this.fetchAndDrawParks(ParkTypes.Bicycle, lang);
  }
}
