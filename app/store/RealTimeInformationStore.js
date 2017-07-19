import Store from 'fluxible/addons/BaseStore';

class RealTimeInformationStore extends Store {
  static storeName = 'RealTimeInformationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.vehicles = {};
    this.subscriptions = [];
  }

  storeClient(data) {
    this.client = data.client;
    this.subscriptions = data.topics;
  }

  clearClient() {
    this.client = undefined;
    this.vehicles = {};
    this.subscriptions = [];
  }

  updateSubscriptions(topics) {
    this.subscriptions = topics;
    this.vehicles = {};
  }

  handleMessage(message) {
    this.vehicles[message.id] = message.message;
    this.emitChange(message.id);
  }

  getVehicle = id => this.vehicles[id];

  getSubscriptions = () => this.subscriptions;

  static handlers = {
    RealTimeClientStarted: 'storeClient',
    RealTimeClientStopped: 'clearClient',
    RealTimeClientMessage: 'handleMessage',
    RealTimeClientTopicChanged: 'updateSubscriptions',
  };
}

export default RealTimeInformationStore;
