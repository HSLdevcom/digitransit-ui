import Store from 'fluxible/addons/BaseStore';
import { MapMode } from '../constants';

export default class MapModeStore extends Store {
  static storeName = 'MapModeStore';

  static existingMapModes = Object.values(MapMode);

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();

    const query = new URLSearchParams(window.location.search);
    if (query.has('mapMode')) {
      this.mapMode = query.get('mapMode');
    } else if (config.backgroundMaps?.[0]) {
      this.mapMode = config.backgroundMaps[0].mapMode;
    }
  }

  mapMode = MapMode.Default;

  static handlers = {
    SetMapMode: 'setMapMode',
  };

  getMapMode = () => this.mapMode;

  setMapMode = mapMode => {
    if (!MapModeStore.existingMapModes.includes(mapMode)) {
      throw new Error(
        `invalid mapMode, must be one of ${MapModeStore.existingMapModes.join(
          ', ',
        )}`,
      );
    }
    if (mapMode === this.mapMode) {
      return;
    }

    const query = new URLSearchParams(window.location.search);
    if (mapMode === MapMode.Default) {
      query.delete('mapMode');
    } else {
      query.set('mapMode', mapMode);
    }
    // todo: does this ever "erase" relevant history entries?
    window.history.replaceState(null, null, `?${query.toString()}`);

    this.mapMode = mapMode;
    this.emitChange();
  };
}
