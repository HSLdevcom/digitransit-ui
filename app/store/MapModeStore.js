import Store from 'fluxible/addons/BaseStore';
import { MapMode } from '../constants';

export default class MapModeStore extends Store {
  static storeName = 'MapModeStore';
  static existingMapModes = Object.values(MapMode);
  mapMode = MapMode.Default;

  static handlers = {
    SetMapMode: 'setMapMode',
  };

  constructor(dispatcher) {
    super(dispatcher);

    const { router } = dispatcher.getContext();
    this.mapMode =
      router && router.query && router.query.mapMode
        ? router.query.mapMode
        : MapMode.Default;
  }

  getMapMode = () => this.mapMode;

  setMapMode = mapMode => {
    if (mapMode in this.existingMapModes) {
      this.mapMode = mapMode;
    } else {
      this.mapMode = MapMode.Default;
    }
    this.emitChange();
  };
}
