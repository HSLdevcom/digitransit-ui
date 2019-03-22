import Store from 'fluxible/addons/BaseStore';

class RealTimeInformationStore extends Store {
  static storeName = 'RealTimeInformationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.vehicles = {};
  }

  storeClient(data) {
    this.client = data.client;
    this.topics = data.topics;
  }

  clearClient() {
    this.client = undefined;
    this.topics = undefined;
    this.vehicles = {};
  }

  resetClient() {
    this.topics = undefined;
    this.vehicles = {};
    this.emitChange();
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

  setTopics(topics) {
    this.topics = topics;
  }

  getVehicle = id => this.vehicles[id];

  static handlers = {
    RealTimeClientStarted: 'storeClient',
    RealTimeClientStopped: 'clearClient',
    RealTimeClientMessage: 'handleMessage',
    RealTimeClientReset: 'resetClient',
    RealTimeClientNewTopics: 'setTopics',
  };
}

export default RealTimeInformationStore;
