import Store from 'fluxible/addons/BaseStore';

class DisruptionInfoStore extends Store {
  static handlers = {
    openDisruptionInfo: 'open',
    closeDisruptionInfo: 'close',
  };

  constructor(...args) {
    super(...args);
    this.isOpen = false;
  }

  static storeName = 'DisruptionInfoStore';

  open = () => {
    this.isOpen = true;
    return this.emitChange();
  }

  close = () => {
    this.isOpen = false;
    return this.emitChange();
  }
}

export default DisruptionInfoStore;
