import Store from 'fluxible/addons/BaseStore';
import PropTypes from 'prop-types';
import defaultsDeep from 'lodash/defaultsDeep';
import cloneDeep from 'lodash/cloneDeep';
import { setMapLayerSettings, getMapLayerSettings } from './localStorage';
import {
  showCityBikes,
  showRentalVehiclesAndStations,
} from '../util/modeUtils';

class MapLayerStore extends Store {
  static defaultLayers = {
    parkAndRide: true,
    parkAndRideForBikes: true,
    stop: {
      bus: true,
      ferry: true,
      rail: true,
      subway: true,
      tram: true,
      carpool: true,
      funicular: true,
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
    datahubTiles: {},
    weatherStations: false,
    chargingStations: false,
    roadworks: false,
    /* rental is unset per default, set in constructor, if any rentalNetwork is configured
    rental: {
      bicycle: true,
      scooter: true,
      cargo_biycle: true,
      car: true,
    }
    */
  };

  static handlers = {
    UpdateMapLayers: 'updateMapLayers',
  };

  static storeName = 'MapLayerStore';

  mapLayers = { ...MapLayerStore.defaultLayers };

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();
    // TODO DEPRECATE citybike
    this.mapLayers.citybike = showCityBikes(config.cityBike?.networks);
    this.mapLayers.rental = showRentalVehiclesAndStations(config);

    const datahubLayers =
      (config.datahubTiles && config.datahubTiles.layers) || [];
    this.mapLayers.datahubTiles = Object.fromEntries(
      datahubLayers.map(l => [l.name, true]),
    );

    // TODO additionalLayers config should be moved in custom config section.
    // That way, they could be iterated over without creating dependencies here
    this.mapLayers.weatherStations = !!config.weatherStations?.show;
    this.mapLayers.chargingStations = !!config.chargingStations?.show;
    this.mapLayers.roadworks = !!config.roadworks?.show;

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
    this.mapLayers = defaultsDeep(cloneDeep(mapLayers), this.mapLayers);
    setMapLayerSettings({ ...this.mapLayers });
    this.emitChange();
  };
}

export const mapLayerShape = PropTypes.shape({
  citybike: PropTypes.bool, // TOOD: refactor all mapLayerShapes to rental/formFactor
  rental: PropTypes.shape({
    bicycle: PropTypes.bool,
    scooter: PropTypes.bool,
    cargo_bicycle: PropTypes.bool,
    car: PropTypes.bool,
  }),
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
  geoJson: PropTypes.object,
  // Because the keys of this object depend on the config, but the config is being fetched asynchronously, we can't describe the shape here.
  datahubTiles: PropTypes.objectOf(PropTypes.bool),
  weatherStations: PropTypes.bool,
  chargingStations: PropTypes.bool,
  roadworks: PropTypes.bool,
});

export default MapLayerStore;
