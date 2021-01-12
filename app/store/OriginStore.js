import Store from 'fluxible/addons/BaseStore';

class OriginStore extends Store {
  static storeName = 'OriginStore';

  constructor(...args) {
    super(...args);
    this.origin = {};
  }

  getOrigin() {
    return this.origin;
  }

  setOrigin(origin) {
    this.origin = origin;
    this.emitChange();
  }

  static handlers = {
    SetOrigin: 'setOrigin',
  };
}

export default OriginStore;
