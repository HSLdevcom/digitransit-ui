import Store from 'fluxible/addons/BaseStore';

class CanceledLegsBarStore extends Store {
  static storeName = 'CanceledLegsBarStore';

  showCanceledLegsBanner = false;
  /*
  updateCurrentTime = () => {
    this.currentTime = moment();

    this.emitChange({
      currentTime: this.currentTime,
    });
  };

  getCurrentTime() {
    return this.currentTime.clone();
  }
  */

  updateShowCanceledLegsBannerState(val) {
    this.showCanceledLegsBanner = val;
    this.emit('change');
  }

  getShowCanceledLegsBanner() {
    return this.showCanceledLegsBanner;
  }

  static handlers = {
    updateShowCanceledLegsBannerState: 'updateShowCanceledLegsBannerState',
    getShowCanceledLegsBanner: 'getShowCanceledLegsBanner',
  };
}

export default CanceledLegsBarStore;
