import Store from 'fluxible/addons/BaseStore';

class TimeStore extends Store {
  static storeName = 'TimeStore';

  static TWICE_PER_MINUTE = 30 * 1000;

  constructor(dispatcher) {
    super(dispatcher);
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, TimeStore.TWICE_PER_MINUTE);
  }

  updateCurrentTime = () => {
    if (process.env.NODE_ENV === 'test') {
      // Set current time to Tue Dec 28 2021 for E2E-tests
      this.currentTime = Math.floor(
        Date.parse('2021-12-28T12:57:00+00:00') / 1000,
      );
    } else {
      this.currentTime = Math.floor(Date.now() / 1000);
    }
    this.emitChange();
  };

  getCurrentTime() {
    return this.currentTime;
  }

  static handlers = {};
}

export default TimeStore;
