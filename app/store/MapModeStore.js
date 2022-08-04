import Store from 'fluxible/addons/BaseStore';
import { MapMode } from '../constants';

export default class MapModeStore extends Store {
  static storeName = 'MapModeStore';

  static existingMapModes = Object.values(MapMode);

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();

    if (config.backgroundMaps?.[0]) {
      this.mapMode = config.backgroundMaps[0].mapMode;
    }
  }

  mapMode = MapMode.Default;

  static handlers = {
    SetMapMode: 'setMapMode',
  };

  getMapMode = () => this.mapMode;

  setMapMode = mapMode => {
    if (
      MapModeStore.existingMapModes.includes(mapMode) &&
      mapMode !== this.mapMode
    ) {
      this.mapMode = mapMode;
      this.emitChange();
    }
  };
}
