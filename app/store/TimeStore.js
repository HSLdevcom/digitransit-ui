import Store from 'fluxible/addons/BaseStore';
import moment from 'moment';

class TimeStore extends Store {
  static storeName = 'TimeStore';
  static TWICE_PER_MINUTE = 30 * 1000;

  constructor(dispatcher) {
    super(dispatcher);
    this.isSelectedTimeSet = this.isSelectedTimeSet.bind(this);
    this.updateCurrentTime = this.updateCurrentTime.bind(this);
    this.updateSelectedTime = this.updateSelectedTime.bind(this);
    this.updateCurrentTime();
    this.arriveBy = false;
    this.setSelectedTimeToNow();
  }

  setSelectedTimeToNow() {
    this.arriveBy = false;
    this.status = 'UNSET';
    return this.updateSelectedTime();
  }

  isSelectedTimeSet() {
    return this.status === 'SET';
  }

  updateCurrentTime() {
    this.setCurrentTime(moment());

    if (!this.isSelectedTimeSet()) {
      this.updateSelectedTime();
    }

    return setTimeout(this.updateCurrentTime, TimeStore.TWICE_PER_MINUTE);
  }

  updateSelectedTime() {
    this.selectedTime = moment();

    return this.emitChange({
      selectedTime: this.selectedTime,
    });
  }

  setSelectedTime(data) {
    this.selectedTime = data;
    this.status = 'SET';

    return this.emitChange({
      selectedTime: this.selectedTime,
    });
  }

  setCurrentTime(data) {
    this.currentTime = data;

    return this.emitChange({
      currentTime: this.currentTime,
    });
  }

  setArriveBy(arriveBy) {
    this.arriveBy = arriveBy;

    return this.emitChange({
      selectedTime: this.selectedTime,
    });
  }

  setArrivalTime(arrivalTime) {
    this.arriveBy = true;
    return this.setSelectedTime(arrivalTime);
  }

  setDepartureTime(departureTime) {
    this.arriveBy = false;
    return this.setSelectedTime(departureTime);
  }

  getSelectedTime() {
    return this.selectedTime.clone();
  }

  getCurrentTime() {
    return this.currentTime.clone();
  }

  getArriveBy() {
    return this.arriveBy;
  }

  static handlers = {
    SetSelectedTime: 'setSelectedTime',
    UnsetSelectedTime: 'setSelectedTimeToNow',
    SetArriveBy: 'setArriveBy',
    SetArrivalTime: 'setArrivalTime',
    SetDepartureTime: 'setDepartureTime',
  };
}

export default TimeStore;
