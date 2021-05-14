import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';

class MapLayerStore extends Store {
  static defaultLayers = {
    dynamicParkingLots: true,
    parkAndRide: false,
    stop: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
    },
    terminal: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
    },
    vehicles: false,
    geoJson: {},
  };

  static handlers = {
    UpdateMapLayers: 'updateMapLayers',
  };

  static storeName = 'MapLayerStore';

  mapLayers = { ...MapLayerStore.defaultLayers };

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();
    this.mapLayers.citybike = config.cityBike?.showCityBikes;

    const storedMapLayers = getMapLayerSettings();
    if (Object.keys(storedMapLayers).length > 0) {
      this.mapLayers = {
        ...this.mapLayers,
        ...storedMapLayers,
      };
    }
  }

  getMapLayers = skip => {
    if (!skip || !skip.notThese) {
      return this.mapLayers;
    }
    const layers = { ...this.mapLayers };
    skip.notThese.forEach(key => {
      if (typeof layers[key] === 'object') {
        layers[key] = {};
        Object.keys(this.mapLayers[key]).forEach(subKey => {
          layers[key][subKey] = false;
        });
      } else {
        layers[key] = false;
      }
    });
    return layers;
  };

  updateMapLayers = mapLayers => {
    this.mapLayers = {
      ...this.mapLayers,
      ...mapLayers,
    };
    setMapLayerSettings({ ...this.mapLayers });
    this.emitChange();
  };
}

export const mapLayerShape = PropTypes.shape({
  citybike: PropTypes.bool,
  parkAndRide: PropTypes.bool,
  dynamicParkingLots: PropTypes.bool,
  stop: PropTypes.shape({
    bus: PropTypes.bool,
    ferry: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
    tram: PropTypes.bool,
  }).isRequired,
  terminal: PropTypes.shape({
    bus: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
  }).isRequired,
  vehicles: PropTypes.bool,
  geoJson: PropTypes.object,
});

export default MapLayerStore;
