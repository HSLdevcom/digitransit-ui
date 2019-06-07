import Store from 'fluxible/addons/BaseStore';

class PopupClosedStore extends Store {
  static storeName = 'PopupClosedStore';

  isPopupClosed = true;

  updatePopupClosedStoreState(val) {
    this.isPopupClosed = val;
    this.emit('change');
  }

  getPopupClosedStore() {
    return this.isPopupClosed;
  }

  static handlers = {
    updatePopupClosedStoreState: 'updatePopupClosedStoreState',
    getPopupClosedStore: 'getPopupClosedStore',
  };
}

export default PopupClosedStore;
