import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';

class MapLayerStore extends Store {
  static defaultLayers = {
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
    showAllBusses: false,
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
    this.mapLayers.citybike =
      config.transportModes.citybike &&
      config.transportModes.citybike.availableForSelection;

    const storedMapLayers = getMapLayerSettings();
    if (Object.keys(storedMapLayers).length > 0) {
      this.mapLayers = {
        ...this.mapLayers,
        ...storedMapLayers,
      };
    }
  }

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

export const mapLayerShape = PropTypes.shape({
  citybike: PropTypes.bool,
  parkAndRide: PropTypes.bool,
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
  ticketSales: PropTypes.shape({
    salesPoint: PropTypes.bool,
    servicePoint: PropTypes.bool,
    ticketMachine: PropTypes.bool,
  }).isRequired,
  showAllBusses: PropTypes.bool,
  geoJson: PropTypes.object,
});

export default MapLayerStore;
