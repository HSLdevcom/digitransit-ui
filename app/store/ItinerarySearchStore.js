import Store from 'fluxible/addons/BaseStore';
import config from '../config';
const STORAGE_KEY = 'currentItinerary';

class ItinerarySearchStore extends Store {
  static storeName = 'ItinerarySearchStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.reset();
    this.reset = this.reset.bind(this);
  }

  reset() {
    let localData;
    if (typeof window !== 'undefined' && window !== null && window.sessionStorage != null) {
      localData = window.sessionStorage.getItem(STORAGE_KEY);
    }

    this.data = localData ? JSON.parse(localData) : {};

    this.fromPlace = '';
    this.toPlace = '';

    this.ticketOptions = [{
      displayName: 'Ei lippuvyöhykerajoitusta',
      value: '0',
    }];

    this.accessibilityOptions = [{
      displayName: 'Ei rajoitusta',
      value: '0',
    }, {
      displayName: 'Liikun pyörätuolilla',
      value: '1',
    }];

    this.selectedTicketOption = '0';
    this.selectedAccessibilityOption = '0';
    this.busState = config.transportModes.bus.defaultValue;
    this.tramState = config.transportModes.tram.defaultValue;
    this.railState = config.transportModes.rail.defaultValue;
    this.subwayState = config.transportModes.subway.defaultValue;
    this.ferryState = config.transportModes.ferry.defaultValue;
    this.airplaneState = config.transportModes.airplane.defaultValue;
    this.citybikeState = config.transportModes.citybike.defaultValue;
    this.walkState = true;
    this.bicycleState = false;
    this.carState = false;
    this.walkReluctance = 2;
    this.walkBoardCost = 600;
    this.minTransferTime = 180;
    this.walkSpeed = 1.2;
  }

  getData() {
    return this.data;
  }

  getOptions() {
    return {
      params: {
        to: this.toPlace,
        from: this.fromPlace,
      },
    };
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

    if (this.getWalkState()) {
      mode.push('WALK');
    }

    if (this.getBicycleState()) {
      mode.push('BICYCLE');
    }

    if (this.getCarState()) {
      mode.push('CAR');
    }

    return mode.join(',');
  }

  getTicketOptions() {
    return this.ticketOptions;
  }

  getAccessibilityOptions() {
    return this.accessibilityOptions;
  }

  getSelectedTicketOption() {
    return this.selectedTicketOption;
  }

  getSelectedAccessibilityOption() {
    return this.selectedAccessibilityOption;
  }

  getBusState() {
    return this.busState;
  }

  getTramState() {
    return this.tramState;
  }

  getRailState() {
    return this.railState;
  }

  getSubwayState() {
    return this.subwayState;
  }

  getFerryState() {
    return this.ferryState;
  }

  getAirplaneState() {
    return this.airplaneState;
  }

  getCitybikeState() {
    return this.citybikeState;
  }

  getWalkState() {
    return this.walkState;
  }

  getBicycleState() {
    return this.bicycleState;
  }

  getCarState() {
    return this.carState;
  }

  getWalkReluctance() {
    return this.walkReluctance;
  }

  getWalkBoardCost() {
    return this.walkBoardCost;
  }

  getMinTransferTime() {
    return this.minTransferTime;
  }

  getWalkSpeed() {
    return this.walkSpeed;
  }

  isWheelchair() {
    return this.selectedAccessibilityOption === '1';
  }

  hasDefaultPreferences() {
    if (this.selectedTicketOption === '0' &&
      this.selectedAccessibilityOption === '0' &&
      this.busState === config.transportModes.bus.defaultValue &&
      this.tramState === config.transportModes.tram.defaultValue &&
      this.railState === config.transportModes.rail.defaultValue &&
      this.subwayState === config.transportModes.subway.defaultValue &&
      this.ferryState === config.transportModes.ferry.defaultValue &&
      this.airplaneState === config.transportModes.airplane.defaultValue &&
      this.citybikeState === config.transportModes.citybike.defaultValue &&
      this.walkState === true &&
      this.bicycleState === false &&
      this.carState === false &&
      this.walkReluctance === 2 &&
      this.walkBoardCost === 600 &&
      this.minTransferTime === 180 &&
      this.walkSpeed === 1.2) {
      return true;
    }
    return false;
  }

  toggleBusState() {
    this.busState = !this.busState;
    this.emitChange();
  }

  toggleTramState() {
    this.tramState = !this.tramState;
    this.emitChange();
  }

  toggleRailState() {
    this.railState = !this.railState;
    this.emitChange();
  }

  toggleSubwayState() {
    this.subwayState = !this.subwayState;
    this.emitChange();
  }

  toggleFerryState() {
    this.ferryState = !this.ferryState;
    this.emitChange();
  }

  toggleAirplaneState() {
    this.airplaneState = !this.airplaneState;
    this.emitChange();
  }

  toggleCitybikeState() {
    this.citybikeState = !this.citybikeState;
    this.emitChange();
  }

  forceCitybikeState() {
    this.citybikeState = true;
    this.emitChange();
  }

  toggleWalkState() {
    this.clearRadioButtons();
    this.walkState = !this.walkState;
    this.emitChange();
  }

  toggleBicycleState() {
    this.clearRadioButtons();
    this.bicycleState = !this.bicycleState;
    this.emitChange();
  }

  toggleCarState() {
    this.clearRadioButtons();
    this.carState = !this.carState;
    this.emitChange();
  }

  clearRadioButtons() {
    this.walkState = this.bicycleState = this.carState = false;
    return;
  }

  updateFromToPlaces(params) {
    this.toPlace = params.to;
    this.fromPlace = params.from;
    this.emitChange();
  }

  setWalkReluctance(value) {
    this.walkReluctance = parseFloat(value);
    this.emitChange();
  }

  setWalkBoardCost(value) {
    this.walkBoardCost = parseFloat(value);
    this.emitChange();
  }

  setMinTransferTime(value) {
    this.minTransferTime = parseFloat(value);
    this.emitChange();
  }

  setWalkSpeed(value) {
    this.walkSpeed = parseFloat(value);
    this.emitChange();
  }

  setTicketOption(value) {
    this.selectedTicketOption = value;
    this.emitChange();
  }

  setAccessibilityOption(value) {
    this.selectedAccessibilityOption = value;
    this.emitChange();
  }

  storeItinerarySearch(data) {
    this.data = data;

    try {
      if (typeof window !== 'undefined' && window !== null && window.sessionStorage != null) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error(
          `[sessionStorage] Unable to save state;
          sessionStorage is not available in Safari private mode`);
      } else {
        throw error;
      }
    }

    this.emitChange();
  }

  clearItinerary() {
    this.data = {};
    if (typeof window !== 'undefined' && window !== null && window.sessionStorage != null) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    this.emitChange();
  }

  dehydrate() {
    return this.data;
  }

  rehydrate(data) {
    this.data = data;
  }

  static handlers = {
    ItineraryFound: 'storeItinerarySearch',
    ItinerarySearchStarted: 'clearItinerary',
    ToggleItineraryBusState: 'toggleBusState',
    ToggleItineraryTramState: 'toggleTramState',
    ToggleItineraryRailState: 'toggleRailState',
    ToggleItinerarySubwayState: 'toggleSubwayState',
    ToggleItineraryFerryState: 'toggleFerryState',
    ToggleItineraryCitybikeState: 'toggleCitybikeState',
    ForceItineraryCitybikeState: 'forceCitybikeState',
    ToggleItineraryWalkState: 'toggleWalkState',
    ToggleItineraryBicycleState: 'toggleBicycleState',
    ToggleItineraryCarState: 'toggleCarState',
    ToggleItineraryAirplaneState: 'toggleAirplaneState',
    UpdateFromToPlaces: 'updateFromToPlaces',
    SetWalkReluctance: 'setWalkReluctance',
    SetWalkBoardCost: 'setWalkBoardCost',
    SetMinTransferTime: 'setMinTransferTime',
    SetWalkSpeed: 'setWalkSpeed',
    SetTicketOption: 'setTicketOption',
    SetAccessibilityOption: 'setAccessibilityOption',
    Reset: 'reset',
  };
}

export default ItinerarySearchStore;
