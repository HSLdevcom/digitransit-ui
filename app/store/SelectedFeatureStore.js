import Store from 'fluxible/addons/BaseStore';

class SelectedFeatureStore extends Store {
  static storeName = 'SelectedFeatureStore';

  constructor(...args) {
    super(...args);
    this.selectedFeature = {};
  }

  getSelectedFeature() {
    return this.selectedFeature;
  }

  setSelectedFeature(selectedFeature) {
    this.selectedFeature = selectedFeature;
    this.emitChange();
  }

  static handlers = {
    SetSelectedFeature: 'setSelectedFeature',
  };
}

export default SelectedFeatureStore;
