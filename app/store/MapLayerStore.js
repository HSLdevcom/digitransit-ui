import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';

class MapLayerStore extends Store {
  static storeName = 'MapLayerStore';

  static handlers = {
    UpdateMapLayers: 'updateMapLayers',
  };

  constructor(dispatcher) {
    super(dispatcher);
    const storedMapLayers = getMapLayerSettings();
    if (Object.keys(storedMapLayers).length > 0) {
      this.mapLayers = { ...storedMapLayers };
    }
  }

  mapLayers = {
    citybike: true,
    parkAndRide: true,
    stop: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
    },
    terminal: {
      bus: true,
      rail: true,
      subway: true,
    },
    ticketSales: {
      salesPoint: true,
      servicePoint: true,
      ticketMachine: true,
    },
  };

  getMapLayers = () => ({ ...this.mapLayers });

  updateMapLayers = mapLayers => {
    this.mapLayers = {
      ...this.mapLayers,
      ...mapLayers,
    };
    setMapLayerSettings({ ...this.mapLayers });
    this.emitChange();
  };
}

export const mapLayerConfigShape = PropTypes.shape({
  citybike: PropTypes.bool,
  parkAndRide: PropTypes.bool,
  stop: PropTypes.shape({
    bus: PropTypes.bool,
    ferry: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
    tram: PropTypes.bool,
  }),
  terminal: PropTypes.shape({
    bus: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
  }),
  ticketSales: PropTypes.shape({
    salesPoint: PropTypes.bool,
    servicePoint: PropTypes.bool,
    ticketMachine: PropTypes.bool,
  }),
});

export default MapLayerStore;
