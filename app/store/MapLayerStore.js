import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';
import { showRentalVehiclesOfType } from '../util/modeUtils';
import { TransportMode } from '../constants';

class MapLayerStore extends Store {
  static handlers = {
    UpdateMapLayers: 'updateMapLayers',
  };

  static storeName = 'MapLayerStore';

  mapLayers = {
    parkAndRide: false,
    parkAndRideForBikes: false,
    stop: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      funicular: true,
    },
    terminal: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
    },
    vehicles: false,
    geoJson: {},
  };

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();
    this.mapLayers.citybike = showRentalVehiclesOfType(
      config.vehicleRental?.networks,
      config,
      TransportMode.Citybike,
    );
    this.mapLayers.scooter =
      config.transportModes.scooter?.showIfSelectedForRouting &&
      showRentalVehiclesOfType(
        config.vehicleRental?.networks,
        config,
        TransportMode.Scooter,
      );
    if (config.hideMapLayersByDefault) {
      this.mapLayers.stop = Object.keys(this.mapLayers.stop).map(() => false);

      this.mapLayers.citybike = false;
      this.mapLayers.scooter = false;
    }
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
  parkAndRideForBikes: PropTypes.bool,
  stop: PropTypes.shape({
    bus: PropTypes.bool,
    ferry: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
    tram: PropTypes.bool,
    funicular: PropTypes.bool,
  }).isRequired,
  terminal: PropTypes.shape({
    bus: PropTypes.bool,
    rail: PropTypes.bool,
    subway: PropTypes.bool,
  }).isRequired,
  vehicles: PropTypes.bool,
  // eslint-disable-next-line
  geoJson: PropTypes.object,
  scooter: PropTypes.bool,
});

export default MapLayerStore;
