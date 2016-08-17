import Store from 'fluxible/addons/BaseStore';
import { setModeStorage, getModeStorage } from './localStorage';

class ModeStore extends Store {

  static storeName = 'ModeStore';

  constructor(dispatcher) {
    super(dispatcher);
    const localData = getModeStorage();
    this.data = localData.busState !== undefined ? localData : this.getRestoreState();
  }

  getRestoreState = () => ({
    busState: true,
    tramState: true,
    railState: true,
    subwayState: true,
    ferryState: true,
    airplaneState: true,
    citybikeState: true,
  });

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

  getModeString = () => (
    this.getMode.join(',')
  )

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

  clearState = () => {
    this.data.subwayState = false;
    this.data.ferryState = false;
    this.data.airplaneState = false;
    this.data.citybikeState = false;
    this.data.railState = false;
    this.data.tramState = false;
    this.data.busState = false;
  }

  doToggle = (name) => {
    if (this.data.selected !== name) {
      this.clearState();
      this.data[name] = true;
      this.data.selected = name;
    } else {
      this.data = this.getRestoreState();
      this.data.selected = undefined;
    }
    this.storeMode();
    this.emitChange();
  }

  toggleBusState() {
    this.doToggle('busState');
  }

  toggleTramState() {
    this.doToggle('tramState');
  }

  toggleRailState() {
    this.doToggle('railState');
  }

  toggleSubwayState() {
    this.doToggle('subwayState');
  }

  toggleFerryState = () => {
    this.doToggle('ferryState');
  }

  toggleAirplaneState = () => {
    this.doToggle('airplaneState');
  }

  toggleCitybikeState() {
    this.doToggle('citybikeState');
  }

  storeMode = () => {
    setModeStorage(this.data);
  }

  dehydrate = () => this.data;

  rehydrate = (data) => {
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
