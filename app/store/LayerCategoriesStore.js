import Store from 'fluxible/addons/BaseStore';

class LayerCategoriesStore extends Store {
  static storeName = 'LayerCategoriesStore';

  layerCategories = [];

  constructor(dispatcher) {
    super(dispatcher);

    const context = dispatcher.getContext();

    fetch(context.config.layerCategoriesUrl)
      .then(response => response.json())
      .then(data => {
        this.layerCategories = data;
        this.emitChange();
      });
  }

  getLayerCategories = () => {
    return this.layerCategories;
  };
}

export default LayerCategoriesStore;
