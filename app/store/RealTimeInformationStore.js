import Store from 'fluxible/addons/BaseStore';

class RealTimeInformationStore extends Store {
  static storeName = 'RealTimeInformationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.vehicles = {};
  }

  storeClient(data) {
    this.client = data.client;
  }

  clearClient() {
    this.client = undefined;
    this.vehicles = {};
  }

  resetClient() {
    this.vehicles = {};
  }

  handleMessage(message) {
    if (Array.isArray(message)) {
      message.forEach(msg => {
        this.vehicles[msg.id] = msg;
      });
    } else {
      this.vehicles[message.id] = message;
    }
    this.emitChange();
  }

  getVehicle = id => this.vehicles[id];

  static handlers = {
    RealTimeClientStarted: 'storeClient',
    RealTimeClientStopped: 'clearClient',
    RealTimeClientMessage: 'handleMessage',
    RealTimeClientReset: 'resetClient',
  };
}

export default RealTimeInformationStore;
