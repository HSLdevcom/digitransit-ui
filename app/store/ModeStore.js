import Store from 'fluxible/addons/BaseStore';
import { setModeStorage, getModeStorage } from './localStorage';

class ModeStore extends Store {

  static storeName = 'ModeStore';

  constructor(dispatcher) {
    super(dispatcher);
    const localData = getModeStorage();
    this.config = dispatcher.getContext().config;
    this.data = localData.busState !== undefined ? localData : this.enableAll();
    this.generateMode();
  }

  enableAll = () => ({
    busState: this.config.transportModes.bus.availableForSelection,
    tramState: this.config.transportModes.tram.availableForSelection,
    railState: this.config.transportModes.rail.availableForSelection,
    subwayState: this.config.transportModes.subway.availableForSelection,
    ferryState: this.config.transportModes.ferry.availableForSelection,
    airplaneState: this.config.transportModes.airplane.availableForSelection,
    citybikeState: this.config.transportModes.citybike.availableForSelection,
  });

  getData() {
    return this.data;
  }

  // Store the same array/string to enable change detection with shallow comparison
  generateMode = () => {
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

    this.mode = mode;
    this.modeString = mode.join(',');
  }

  getMode = () => this.mode

  getModeString = () => this.modeString

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
      this.data = this.enableAll();
      this.data.selected = undefined;
    }
    this.storeMode();
    this.generateMode();
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
