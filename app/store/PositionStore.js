import Store from 'fluxible/addons/BaseStore';
import d from 'debug';
import { api, init } from '../action/MockGeolocationApi';
import { isBrowser } from '../util/browser';
import { parseLatLon } from '../util/otpStrings';
import {
  getPositioningHasSucceeded,
  setPositioningHasSucceeded,
} from './localStorage';

const debug = d('PositionStore.js');

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
    if (
      isBrowser &&
      window.location &&
      window.location.search.indexOf('mock') !== -1
    ) {
      let permission = window.location.search.substring(
        window.location.search.indexOf('mock') + 5,
      );
      let lat;
      let lon;
      if (permission.length > 1) {
        const latlon = parseLatLon(permission);
        if (latlon) {
          permission = 'granted';
          ({ lat, lon } = latlon);
        }
      } else {
        // default mock permission = granted
        permission = 'granted';
      }

      debug('replacing geolocation api with mock');
      navigator.geoapi = api;
      init(permission, lat, lon);
    } else {
      navigator.geoapi = navigator.geolocation;
    }
    super(dispatcher);
    this.removeLocation();
    this.positioningHasSucceeded = getPositioningHasSucceeded();
  }

  removeLocation() {
    this.lat = 0;
    this.lon = 0;
    this.heading = null;
    this.address = undefined;
    this.status = PositionStore.STATUS_NO_LOCATION;
    this.emitChange();
  }

  geolocationSearch() {
    this.status = PositionStore.STATUS_SEARCHING_LOCATION;
    this.address = undefined;
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

    if (
      location &&
      location.disableFiltering !== true &&
      Math.abs(this.lat - location.lat) < 0.001 &&
      Math.abs(this.lon - location.lon) < 0.001
    ) {
      this.lat = (this.lat + location.lat) / 2;
      this.lon = (this.lon + location.lon) / 2;
    } else {
      this.lat = location.lat;
      this.lon = location.lon;
    }

    this.heading = location.heading ? location.heading : this.heading;
    this.status = PositionStore.STATUS_FOUND_LOCATION;

    this.emitChange();
  }

  storeAddress(location) {
    if (location.address) {
      if (location.city) {
        this.address = `${location.address}, ${location.city}`;
      } else {
        this.address = location.address;
      }
    } else if (location.city) {
      this.address = location.city;
    } else {
      this.address = '';
    }
    this.status = PositionStore.STATUS_FOUND_ADDRESS;
    this.emitChange();
  }

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
      isLocationingInProgress:
        this.status === PositionStore.STATUS_SEARCHING_LOCATION,
      locationingFailed:
        this.status === PositionStore.STATUS_GEOLOCATION_DENIED ||
        this.status === PositionStore.STATUS_GEOLOCATION_TIMEOUT ||
        this.status === PositionStore.STATUS_GEOLOCATION_WATCH_TIMEOUT ||
        this.status === PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED,
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
