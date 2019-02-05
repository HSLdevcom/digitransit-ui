import Store from 'fluxible/addons/BaseStore';
import moment from 'moment';

class TimeStore extends Store {
  static storeName = 'TimeStore';

  static TWICE_PER_MINUTE = 30 * 1000;

  constructor(dispatcher) {
    super(dispatcher);
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, TimeStore.TWICE_PER_MINUTE);
  }

  updateCurrentTime = () => {
    this.currentTime = moment();

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
