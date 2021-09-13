import Store from 'fluxible/addons/BaseStore';
import moment from 'moment';

class TimeStore extends Store {
  static storeName = 'TimeStore';

  static TWICE_PER_MINUTE = 30 * 1000;

  config = {};

  constructor(dispatcher) {
    super(dispatcher);
    this.config = dispatcher.getContext().config;
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, TimeStore.TWICE_PER_MINUTE);
  }

  updateCurrentTime = () => {
    if (this.config.NODE_ENV === 'test') {
      // Set current time to Fri Sep 10 2021 for E2E-tests
      this.currentTime = moment(1631221200);
    } else {
      this.currentTime = moment();
    }
    this.emitChange({
      currentTime: this.currentTime,
    });
  };

  getCurrentTime() {
    return this.currentTime.clone();
  }

  static handlers = {};
}

export default TimeStore;
