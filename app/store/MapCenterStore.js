import Store from 'fluxible/addons/BaseStore';

export default class MapCenterStore extends Store {
  static storeName = 'MapcenterStore';

  constructor(props) {
    super(props);
    this.coordsOfMapCenter = {};
  }

  setCoordsOfMapCenter = location => {
    if (location && location.lat && location.lng) {
      this.coordsOfMapCenter = {
        lat: location.lat,
        lon: location.lng,
      };
    }
    this.emitChange();
  };

  getCoordsOfMapCenter = () => {
    return this.coordsOfMapCenter;
  };

  static handlers = {
    SetCoordsOfMapCenter: 'setCoordsOfMapCenter',
  };
}
