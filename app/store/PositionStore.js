import Store from 'fluxible/addons/BaseStore';
import { getPositioningHasSucceeded, setPositioningHasSucceeded } from './localStorage';

export default class PositionStore extends Store {
  static storeName = 'PositionStore';

  static STATUS_NO_LOCATION = 'no-location';
  static STATUS_SEARCHING_LOCATION = 'searching-location';
  static STATUS_GEOLOCATION_PROMPT = 'prompt';
  static STATUS_FOUND_LOCATION = 'found-location';
  static STATUS_FOUND_ADDRESS = 'found-address';
  static STATUS_GEOLOCATION_DENIED = 'geolocation-denied';
  static STATUS_GEOLOCATION_TIMEOUT = 'geolocation-timeout';
  static STATUS_GEOLOCATION_WATCH_TIMEOUT = 'geolocation-watch-timeout';
  static STATUS_GEOLOCATION_NOT_SUPPORTED = 'geolocation-not-supported';


  constructor(dispatcher) {
    super(dispatcher);
    this.removeLocation();
    this.positioningHasSucceeded = getPositioningHasSucceeded();
  }

  removeLocation() {
    this.lat = 0;
    this.lon = 0;
    this.heading = null;
    this.address = '';
    this.status = PositionStore.STATUS_NO_LOCATION;
    this.emitChange();
  }

  geolocationSearch() {
    this.status = PositionStore.STATUS_SEARCHING_LOCATION;
    this.address = '';
    this.emitChange();
  }

  geolocationNotSupported() {
    this.status = PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED;
    this.emitChange();
  }

  geolocationDenied() {
    this.status = PositionStore.STATUS_GEOLOCATION_DENIED;
    this.emitChange();
  }

  geolocationTimeout() {
    this.status = PositionStore.STATUS_GEOLOCATION_TIMEOUT;
    this.emitChange();
  }

  geolocationWatchTimeout() {
    this.status = PositionStore.STATUS_GEOLOCATION_WATCH_TIMEOUT;
    this.emitChange();
  }

  geolocationPrompt() {
    this.status = PositionStore.STATUS_GEOLOCATION_PROMPT;
    this.emitChange();
  }

  storeLocation(location) {
    if (!this.positioningHasSucceeded) {
      setPositioningHasSucceeded(true);
      this.positioningHasSucceeded = true;
    }

    const statusChanged = this.hasStatusChanged(true);

    if (location && location.disableFiltering !== true) {
      this.lat = this.lat !== 0 ? (this.lat + location.lat) / 2 : location.lat;
      this.lon = this.lon !== 0 ? (this.lon + location.lon) / 2 : location.lon;
    } else {
      this.lat = location.lat;
      this.lon = location.lon;
    }

    this.heading = location.heading ? location.heading : this.heading;
    this.status = PositionStore.STATUS_FOUND_LOCATION;

    this.emitChange({
      statusChanged,
    });
  }

  storeAddress(location) {
    this.address = `${location.address}, ${location.city}`;
    this.status = PositionStore.STATUS_FOUND_ADDRESS;
    this.emitChange();
  }

  hasStatusChanged = hasLocation => hasLocation !== this.getLocationState().hasLocation;

  getLocationState() {
    return {
      lat: this.lat,
      lon: this.lon,
      address: this.address,
      status: this.status,
      hasLocation:
        (this.status === PositionStore.STATUS_FOUND_ADDRESS ||
          this.status === PositionStore.STATUS_FOUND_LOCATION) &&
        (this.lat !== 0 || this.lon !== 0),
      // Locationing is in progress when browser is:
      //   searching address or
      //   reverse geocoding is in progress
      isLocationingInProgress: this.status === PositionStore.STATUS_SEARCHING_LOCATION,
    };
  }

  storeWatchId(watchId) {
    this.watchId = watchId;
  }

  clearWatchId() {
    this.watchId = undefined;
  }

  getWatchId = () => this.watchId;

  static handlers = {
    GeolocationSearch: 'geolocationSearch',
    GeolocationFound: 'storeLocation',
    GeolocationNotSupported: 'geolocationNotSupported',
    GeolocationDenied: 'geolocationDenied',
    GeolocationTimeout: 'geolocationTimeout',
    GeolocationWatchTimeout: 'geolocationWatchTimeout',
    GeolocationPrompt: 'geolocationPrompt',
    AddressFound: 'storeAddress',
    GeolocationWatchStarted: 'storeWatchId',
    GeolocationWatchStopped: 'clearWatchId',
  };
}
