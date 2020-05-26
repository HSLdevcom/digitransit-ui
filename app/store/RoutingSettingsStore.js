import Store from 'fluxible/addons/BaseStore';
import {
  getSearchSettingsStorage,
  setSearchSettingsStorage,
} from './localStorage';

class RoutingSettingsStore extends Store {
  static storeName = 'RoutingSettingsStore';

  // eslint-disable-next-line class-methods-use-this
  getRoutingSettings() {
    let settings = getSearchSettingsStorage();

    if (!settings) {
      settings = {};
      setSearchSettingsStorage(settings);
    }
    return settings;
  }

  saveRoutingSettings(data) {
    const settings = this.getRoutingSettings();
    const key = Object.keys(data)[0];
    const value = data[Object.keys(data)[0]];

    settings[key] = value;
    setSearchSettingsStorage(settings);
    this.emitChange(data);
  }

  static handlers = {
    saveRoutingSettings: 'saveRoutingSettings',
    getRoutingSettings: 'getRoutingSettings',
  };
}

export default RoutingSettingsStore;
