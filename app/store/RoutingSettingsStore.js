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

  saveRoutingSettings(changedSettings) {
    const oldSettings = this.getRoutingSettings();
    const newSettings = { ...oldSettings, ...changedSettings };
    setSearchSettingsStorage(newSettings);
    this.emitChange(changedSettings);
  }

  static handlers = {
    saveRoutingSettings: 'saveRoutingSettings',
    getRoutingSettings: 'getRoutingSettings',
  };
}

export default RoutingSettingsStore;
