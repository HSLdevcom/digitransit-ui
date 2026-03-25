import Store from 'fluxible/addons/BaseStore';
import events from '../util/events';
import { unixTime } from '../util/timeUtils';

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
    this.topicsByRoute = undefined;
    this.vehicles = {};
    this.emitChange();
  }

  resetClient() {
    this.topics = undefined;
    this.topicsByRoute = undefined;
    this.vehicles = {};
    this.emitChange();
  }

  handleMessage(message) {
    if (message) {
      const receivedAt = unixTime();
      if (Array.isArray(message)) {
        message.forEach(msg => {
          if (
            !this.topicsByRoute ||
            this.topicsByRoute[msg.route.split(':')[1]]
          ) {
            // Filter out old messages
            this.vehicles[msg.id] = { ...msg, receivedAt };
          }
        });
      } else if (
        !this.topicsByRoute ||
        this.topicsByRoute[message.route.split(':')[1]]
      ) {
        this.vehicles[message.id] = { ...message, receivedAt };
      }
      this.conditionalEmit();
    }
  }

  setTopics({ topics, topicsByRoute }) {
    this.topics = topics;
    this.topicsByRoute = topicsByRoute;

    if (topicsByRoute && Object.keys(topicsByRoute).length > 0) {
      this.vehicles = Object.fromEntries(
        Object.entries(this.vehicles).filter(([, vehicle]) => {
          const routeId = vehicle.route?.split(':')[1];
          return routeId && topicsByRoute[routeId];
        }),
      );
    } else if (Array.isArray(topics) && topics.length > 0) {
      this.vehicles = Object.fromEntries(
        Object.entries(this.vehicles).filter(([, vehicle]) => {
          const tripId = vehicle.tripId?.split(':')[1];
          const routeId = vehicle.route?.split(':')[1];

          if (tripId) {
            return topics.some(topic => topic.includes(tripId));
          }

          if (routeId) {
            return topics.some(topic => topic.includes(routeId));
          }

          return false;
        }),
      );
    }

    this.emitChange();
  }

  getVehicle = id => this.vehicles[id];

  setVisibleVehicles(visibleVehicleKeys) {
    const vehicleKeys = Object.keys(this.vehicles);
    const projectedVehicles = [];
    vehicleKeys.forEach(key => {
      const vehicle = this.vehicles[key];
      const hasKey = visibleVehicleKeys.includes(key);
      vehicle.visible = hasKey;
      if (hasKey) {
        projectedVehicles.push(vehicle);
      }
    });
    events.emit('vehiclesChanged', projectedVehicles);
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
