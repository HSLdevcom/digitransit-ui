import Store from 'fluxible/addons/BaseStore';

class ViaPointsStore extends Store {
  static storeName = 'ViaPointsStore';

  viaPoints = false;

  updateViaPointsFromMap(val) {
    this.viaPoints = val;
    this.emit('change');
  }

  getViaPoints() {
    return this.viaPoints;
  }

  static handlers = {
    updateViaPointsFromMap: 'updateViaPointsFromMap',
    getViaPoints: 'getViaPoints',
  };
}

export default ViaPointsStore;
