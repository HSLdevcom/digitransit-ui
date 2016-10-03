import Store from 'fluxible/addons/BaseStore';

class EndpointStore extends Store {
  // Store the user selections for the origin and destination.
  // Both can optionally be set to track the current geolocation.

  static storeName = 'EndpointStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.origin = this.getUseCurrent(this.origin, true);
    this.destination = this.getUseCurrent(this.destination, false);
    this.emitChange('origin-use-current');
  }

  isCurrentPositionInUse() {
    return this.origin.useCurrentPosition || this.destination.useCurrentPosition;
  }

  clearOrigin() {
    this.origin = this.getUseCurrent(null, false);
    this.emitChange('set-origin');
  }

  clearDestination() {
    this.destination = this.getUseCurrent(null, false);
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

    this.origin = this.getUseCurrent(this.origin, true);
    this.emitChange('set-origin');
  }

  setDestinationToCurrent() {
    if (this.origin.useCurrentPosition === true) {
      this.clearOrigin();
    }

    this.destination = this.getUseCurrent(this.destination, true);
    this.emitChange();
  }

  getUseCurrent(current, useCurrent) {
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
      this.origin = this.getUseCurrent(this.origin, false);
    }

    if (this.destination.useCurrentPosition) {
      this.destination = this.getUseCurrent(this.destination, false);
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

  setEndpoint(props) {
    const { target, value } = props;

    if (target === 'destination') {
      this.setDestination(value);
    } else {
      this.setOrigin(value);
    }
  }

  useCurrentPosition(target) {
    if (target === 'destination') {
      this.setDestinationToCurrent();
    } else {
      this.setOriginToCurrent();
      this.emitChange('origin-use-current');
    }
  }

  static handlers = {
    setEndpoint: 'setEndpoint',
    useCurrentPosition: 'useCurrentPosition',
    swapEndpoints: 'swapEndpoints',
    clearOrigin: 'clearOrigin',
    clearDestination: 'clearDestination',
    clearGeolocation: 'clearGeolocation',
  };
}

export default EndpointStore;
