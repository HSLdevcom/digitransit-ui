import Store from 'fluxible/addons/BaseStore';
import { setModeStorage, getModeStorage } from './localStorage';
import config from '../config';

class ModeStore extends Store {
  static storeName = 'ModeStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.getModeString = this.getModeString.bind(this);
    const localData = getModeStorage();

    this.data = (() => {
      if (typeof localData.busState !== 'undefined') {
        return localData;
      }
      return {
        busState: config.transportModes.bus.defaultValue,
        tramState: config.transportModes.tram.defaultValue,
        railState: config.transportModes.rail.defaultValue,
        subwayState: config.transportModes.subway.defaultValue,
        ferryState: config.transportModes.ferry.defaultValue,
        airplaneState: config.transportModes.airplane.defaultValue,
        citybikeState: config.transportModes.citybike.defaultValue,
      };
    })();
  }

  getData() {
    return this.data;
  }

  getMode() {
    const mode = [];

    if (this.getBusState()) {
      mode.push('BUS');
    }

    if (this.getTramState()) {
      mode.push('TRAM');
    }

    if (this.getRailState()) {
      mode.push('RAIL');
    }

    if (this.getSubwayState()) {
      mode.push('SUBWAY');
    }

    if (this.getFerryState()) {
      mode.push('FERRY');
    }

    if (this.getAirplaneState()) {
      mode.push('AIRPLANE');
    }

    if (this.getCitybikeState()) {
      mode.push('BICYCLE_RENT');
    }

    return mode;
  }

  getModeString() {
    return this.getMode.join(',');
  }

  getBusState() {
    return this.data.busState;
  }

  getTramState() {
    return this.data.tramState;
  }

  getRailState() {
    return this.data.railState;
  }

  getSubwayState() {
    return this.data.subwayState;
  }

  getFerryState() {
    return this.data.ferryState;
  }

  getAirplaneState() {
    return this.data.airplaneState;
  }

  getCitybikeState() {
    return this.data.citybikeState;
  }

  toggleBusState() {
    this.data.busState = !this.data.busState;
    this.storeMode();
    return this.emitChange();
  }

  toggleTramState() {
    this.data.tramState = !this.data.tramState;
    this.storeMode();
    return this.emitChange();
  }

  toggleRailState() {
    this.data.railState = !this.data.railState;
    this.storeMode();
    return this.emitChange();
  }

  toggleSubwayState() {
    this.data.subwayState = !this.data.subwayState;
    this.storeMode();
    return this.emitChange();
  }

  toggleFerryState() {
    this.data.ferryState = !this.data.ferryState;
    this.storeMode();
    return this.emitChange();
  }

  toggleAirplaneState() {
    this.data.airplaneState = !this.data.airplaneState;
    this.storeMode();
    return this.emitChange();
  }

  toggleCitybikeState() {
    this.data.citybikeState = !this.data.citybikeState;
    this.storeMode();
    return this.emitChange();
  }

  storeMode() {
    return setModeStorage(this.data);
  }

  dehydrate() {
    return this.data;
  }

  rehydrate(data) {
    this.data = data;
  }

  static handlers = {
    ToggleNearbyRouteBusState: 'toggleBusState',
    ToggleNearbyRouteTramState: 'toggleTramState',
    ToggleNearbyRouteRailState: 'toggleRailState',
    ToggleNearbyRouteSubwayState: 'toggleSubwayState',
    ToggleNearbyRouteFerryState: 'toggleFerryState',
    ToggleNearbyRouteCitybikeState: 'toggleCitybikeState',
    ToggleNearbyRouteAirplaneState: 'toggleAirplaneState',
  };
}

export default ModeStore;
