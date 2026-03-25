import Store from 'fluxible/addons/BaseStore';

class ViaPointStore extends Store {
  static storeName = 'ViaPointStore';

  viaPoints = [];

  addViaPoint(val) {
    this.viaPoints.push(val);
    this.emitChange();
  }

  setViaPoints(viaPoints) {
    this.viaPoints = [...viaPoints];
    this.emitChange();
  }

  getViaPoints() {
    return this.viaPoints;
  }

  deleteViaPoint(val) {
    this.viaPoints = this.viaPoints.filter(
      p => p.lat !== val.lat || p.lon !== val.lon,
    );
    this.emitChange();
  }

  static handlers = {
    addViaPoint: 'addViaPoint',
    setViaPoints: 'setViaPoints',
    deleteViaPoint: 'deleteViaPoint',
  };
}

export default ViaPointStore;
