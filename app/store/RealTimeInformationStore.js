import Store from 'fluxible/addons/BaseStore';
import debounce from 'lodash/debounce';

class RealTimeInformationStore extends Store {
  static storeName = 'RealTimeInformationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.vehicles = {};
    this.debounceEmit = debounce(this.emitChange, 1000, {
      leading: true,
    });
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
    if (message) {
      if (Array.isArray(message)) {
        message.forEach(msg => {
          this.vehicles[msg.id] = msg;
        });
      } else {
        this.vehicles[message.id] = message;
      }
      this.debounceEmit();
    }
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
