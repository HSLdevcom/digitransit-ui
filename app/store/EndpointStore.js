import Store from 'fluxible/addons/BaseStore';

/* Stores the user selections for the origin and destination (endpoint).
 * One of them can optionally and be set to track the current geolocation.
 * Endpoint is object with following properties;
 *
 * {
 *   useCurrentPosition: currentPosition means the endpoint should track
                         the GPS position from the browser, boolean
 *   userSetPosition: did the user set the position, boolean,
 *   lat: coordinte, number
 *   lon: coordinate, number
 *   address: textual presentation of address, string
 * }
 */
class EndpointStore extends Store {
  static storeName = 'EndpointStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.origin = EndpointStore.getUseCurrent(this.origin, false);
    this.destination = EndpointStore.getUseCurrent(this.destination, false);
    this.emitChange('origin-use-current');
  }

  isCurrentPositionInUse() {
    return (
      this.origin.useCurrentPosition || this.destination.useCurrentPosition
    );
  }

  isOriginSet() {
    const origin = this.origin;
    return (
      origin.useCurrentPosition === true || origin.userSetPosition === true
    );
  }

  isDestinationSet() {
    const destination = this.destination;
    return (
      destination.useCurrentPosition === true ||
      destination.userSetPosition === true
    );
  }

  clearOrigin() {
    this.origin = EndpointStore.getUseCurrent(null, false);
    this.emitChange('set-origin');
  }

  clearDestination() {
    this.destination = EndpointStore.getUseCurrent(null, false);
    this.emitChange();
  }

  swapEndpoints() {
    [this.destination, this.origin] = [this.origin, this.destination];
    this.emitChange();
  }

  setOriginToCurrent() {
    if (this.destination.useCurrentPosition === true) {
      this.clearDestination();
    }

    this.origin = EndpointStore.getUseCurrent(this.origin, true);
    this.emitChange('set-origin');
  }

  setDestinationToCurrent() {
    if (this.origin.useCurrentPosition === true) {
      this.clearOrigin();
    }

    this.destination = EndpointStore.getUseCurrent(this.destination, true);
    this.emitChange();
  }

  static getUseCurrent(current, useCurrent) {
    return {
      useCurrentPosition: useCurrent,
      userSetPosition: (current && current.userSetPosition) || false,
      lat: null,
      lon: null,
      address: null,
    };
  }

  setOrigin(location) {
    this.origin = {
      userSetPosition: true,
      useCurrentPosition: false,
      lat: location.lat,
      lon: location.lon,
      address: location.address,
    };

    this.emitChange('set-origin');
  }

  setDestination(location) {
    this.destination = {
      userSetPosition: true,
      useCurrentPosition: false,
      lat: location.lat,
      lon: location.lon,
      address: location.address,
    };

    this.emitChange();
  }

  getOrigin() {
    return this.origin;
  }

  getDestination() {
    return this.destination;
  }

  clearGeolocation() {
    if (this.origin.useCurrentPosition) {
      this.origin = EndpointStore.getUseCurrent(this.origin, false);
    }

    if (this.destination.useCurrentPosition) {
      this.destination = EndpointStore.getUseCurrent(this.destination, false);
    }

    this.emitChange();
  }

  dehydrate() {
    return {
      origin: this.origin,
      destination: this.destination,
    };
  }

  rehydrate(data) {
    this.origin = data.origin;
    this.destination = data.destination;
  }

  setEndpoint({ target, value }) {
    console.log('store setting endpoint', target, value);
    if (target === 'destination') {
      this.setDestination(value);
    } else {
      this.setOrigin(value);
    }
  }

  setEndpointIfNotCurrent({ target, value }) {
    if (target === 'destination') {
      if (!this.destination.useCurrentPosition) {
        this.setDestination(value);
      }
    } else if (!this.origin.useCurrentPosition) {
      this.setOrigin(value);
    }
  }

  useCurrentPosition(payload) {
    if (payload.target === 'destination') {
      if (!this.destination.userSetPosition || !payload.keepSelectedLocation) {
        this.setDestinationToCurrent();
      }
    } else if (!this.origin.userSetPosition || !payload.keepSelectedLocation) {
      this.setOriginToCurrent();
      this.emitChange('origin-use-current');
    }
  }

  static handlers = {
    setEndpoint: 'setEndpoint',
    setEndpointIfNotCurrent: 'setEndpointIfNotCurrent',
    useCurrentPosition: 'useCurrentPosition',
    swapEndpoints: 'swapEndpoints',
    clearOrigin: 'clearOrigin',
    clearDestination: 'clearDestination',
    clearGeolocation: 'clearGeolocation',
  };
}

export default EndpointStore;
