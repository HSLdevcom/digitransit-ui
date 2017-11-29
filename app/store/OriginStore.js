import Store from 'fluxible/addons/BaseStore';

class OriginStore extends Store {
  static storeName = 'OriginStore';

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
