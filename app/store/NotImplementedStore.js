import Store from 'fluxible/addons/BaseStore';

class NotImplementedStore extends Store {
  static storeName = 'NotImplementedStore';

  open(feature) {
    this.feature = feature;
    this.emitChange(feature);
  }

  close() {
    this.feature = null;
    this.emitChange();
  }

  getName() {
    return this.feature;
  }

  static handlers = {
    openNotImplemented: 'open',
    closeNotImplemented: 'close',
  };
}

export default NotImplementedStore;
