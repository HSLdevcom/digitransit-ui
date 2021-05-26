import Store from 'fluxible/addons/BaseStore';
import events from '../util/events';

class RealTimeInformationStore extends Store {
  static storeName = 'RealTimeInformationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.vehicles = {};
    this.allowUpdates = true;
  }

  checkEmit() {
    if (this.pendingEmit) {
      this.pendingEmit = false;
      this.emitChange();
    }
  }

  conditionalEmit() {
    if (this.allowUpdates) {
      setTimeout(() => {
        this.allowUpdates = true;
        this.checkEmit();
      }, 1000);
      this.allowUpdates = false;
      this.pendingEmit = false;
      this.emitChange();
    } else {
      this.pendingEmit = true;
    }
  }

  storeClient(data) {
    if (this.client) {
      this.client.end();
      this.vehicles = {};
    }
    this.client = data.client;
    this.topics = data.topics;
  }

  clearClient() {
    if (this.client) {
      this.client.end();
    }
    this.client = undefined;
    this.topics = undefined;
    this.vehicles = {};
    this.emitChange();
  }

  resetClient() {
    this.topics = undefined;
    this.vehicles = {};
    this.emitChange();
  }

  handleMessage(message) {
    if (message) {
      if (Array.isArray(message)) {
        message.forEach(msg => {
          this.vehicles[msg.id] = msg;
        });
      } else {
        this.vehicles[message.id] = message;
      }
      this.conditionalEmit();
    }
  }

  setTopics(topics) {
    this.topics = topics;
  }

  getVehicle = id => this.vehicles[id];

  setVisibleVehicles(visibleVehicleKeys) {
    const vehicleKeys = Object.keys(this.vehicles);
    vehicleKeys.forEach(key => {
      const vehicle = this.vehicles[key];
      vehicle.visible = visibleVehicleKeys.includes(key);
      this.vehicles[key] = vehicle;
    });
    events.emit('vehiclesChanged', this.vehicles);
  }

  static handlers = {
    RealTimeClientStarted: 'storeClient',
    RealTimeClientStopped: 'clearClient',
    RealTimeClientMessage: 'handleMessage',
    RealTimeClientReset: 'resetClient',
    RealTimeClientNewTopics: 'setTopics',
  };
}

export default RealTimeInformationStore;
