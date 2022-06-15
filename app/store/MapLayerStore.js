import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';
import { showCityBikes } from '../util/modeUtils';

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
      carpool: true,
    },
    terminal: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      carpool: true,
    },
    vehicles: false,
    geoJson: {},
    bikeParks: true,
    datahubTiles: true,
  };

  static handlers = {
    UpdateMapLayers: 'updateMapLayers',
  };

  static storeName = 'MapLayerStore';

  mapLayers = { ...MapLayerStore.defaultLayers };

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();
    this.mapLayers.citybike = showCityBikes(config.cityBike?.networks);

    const datahubLayers =
      (config.datahubTiles && config.datahubTiles.layers) || [];
    this.mapLayers.datahubTiles = Object.fromEntries(
      datahubLayers.map(l => [l.name, true]),
    );

    const storedMapLayers = getMapLayerSettings();
    if (Object.keys(storedMapLayers).length > 0) {
      this.mapLayers = {
        ...this.mapLayers,
        ...storedMapLayers,
        terminal: { ...this.mapLayers.terminal, ...storedMapLayers.terminal },
      };
    }
  }

  getMapLayers = skip => {
    if (!skip?.notThese && !skip?.force) {
      return this.mapLayers;
    }
    const layers = { ...this.mapLayers };
    if (skip.notThese) {
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
    }
    if (skip.force) {
      skip.force.forEach(key => {
        if (typeof layers[key] === 'object') {
          layers[key] = {};
          Object.keys(this.mapLayers[key]).forEach(subKey => {
            layers[key][subKey] = true;
          });
        } else {
          layers[key] = true;
        }
      });
    }
    return layers;
  };

  updateMapLayers = mapLayers => {
    this.mapLayers = {
      ...this.mapLayers,
      ...mapLayers,
      stop: {
        ...this.mapLayers.stop,
        ...mapLayers.stop,
      },
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
  // Because the keys of this object depend on the config, but the config is being fetched asynchronously, we can't describe the shape here.
  datahubTiles: PropTypes.objectOf(PropTypes.bool),
});

export default MapLayerStore;
