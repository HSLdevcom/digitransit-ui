/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import cx from 'classnames';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape, withRouter } from 'found';
import { isKeyboardSelectionEvent } from '../util/browser';
import Icon from './Icon';
import GeoJsonStore from '../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';
import { updateMapLayers } from '../action/MapLayerActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withGeojsonObjects from './map/withGeojsonObjects';
import { MapMode } from '../constants';
import { setMapMode } from '../action/MapModeActions';
import LayerCategoryDropdown from './LayerCategoryDropdown';
import { mapLayerOptionsShape } from '../util/shapes';
import { getTransportModes, showCityBikes } from '../util/modeUtils';

const transportModeConfigShape = PropTypes.shape({
  availableForSelection: PropTypes.bool,
});

const mapLayersConfigShape = PropTypes.shape({
  cityBike: PropTypes.shape({
    networks: PropTypes.object,
    showCityBikes: PropTypes.bool,
  }),
  geoJson: PropTypes.shape({
    layers: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        name: PropTypes.shape({
          en: PropTypes.string,
          fi: PropTypes.string.isRequired,
          sv: PropTypes.string,
        }),
      }),
    ),
  }),
  parkAndRide: PropTypes.shape({
    show: PropTypes.bool,
  }),
  transportModes: PropTypes.shape({
    bus: transportModeConfigShape,
    citybike: transportModeConfigShape,
    ferry: transportModeConfigShape,
    rail: transportModeConfigShape,
    subway: transportModeConfigShape,
    tram: transportModeConfigShape,
  }),
  mapLayers: PropTypes.shape({
    tooltip: PropTypes.shape({
      en: PropTypes.string,
      fi: PropTypes.string.isRequired,
      sv: PropTypes.string,
    }),
  }),
  vehicles: PropTypes.bool,
});

class MapLayersDialogContent extends React.Component {
  static propTypes = {
    mapLayers: mapLayerShape.isRequired,
    mapLayerOptions: mapLayerOptionsShape,
    setOpen: PropTypes.func.isRequired,
    updateMapLayers: PropTypes.func,
    lang: PropTypes.string.isRequired,
    mapMode: PropTypes.oneOf(Object.keys(MapMode)),
    open: PropTypes.bool.isRequired,
    geoJson: PropTypes.object,
  };

  static defaultProps = {
    mapLayerOptions: null,
  };

  sendLayerChangeAnalytic = (name, enable) => {
    const action = enable ? 'ShowMapLayer' : 'HideMapLayer';
    addAnalyticsEvent({
      category: 'Map',
      action,
      name,
    });
  };

  handlePanelState(open) {
    if (open === this.props.open) {
      return;
    }
    this.props.setOpen(open);
  }

  updateSetting = newSetting => {
    this.props.updateMapLayers(newSetting);
  };

  // todo: not used?
  updateStopAndTerminalSetting = newSetting => {
    const { mapLayers } = this.props;
    const stop = {
      ...mapLayers.stop,
      ...newSetting,
    };
    const terminal = {
      ...mapLayers.terminal,
      ...newSetting,
    };
    this.updateSetting({ stop, terminal });
  };

  // todo: not used?
  updateStopSetting = newSetting => {
    const stop = {
      ...newSetting,
    };
    this.updateSetting({ stop });
  };

  // todo: not used?
  updateGeoJsonSetting = newSetting => {
    const geoJson = {
      ...this.props.mapLayers.geoJson,
      ...newSetting,
    };
    this.updateSetting({ geoJson });
  };

  layerOptionsByCategory = (category, layers, geoJson, lang) => {
    return (
      layers
        ?.filter(
          l =>
            l.alwaysOn !== true &&
            (l.category === undefined || l.category === category),
        )
        .map(layer => {
          const key = layer.id || layer.url;
          return {
            key,
            checked:
              (layer.isOffByDefault && geoJson[key] === true) ||
              (!layer.isOffByDefault && geoJson[key] !== false), // todo: is active?
            defaultMessage: layer.name?.[lang] || layer.defaultMessage,
            labelId: layer.labelId, // todo: rename?
            icon: layer.icon,
            settings: { geoJson: key },
          };
        }) || []
    );
  };

  render() {
    const {
      parkAndRide,
      parkAndRideForBikes,
      stop,
      terminal,
      geoJson,
      vehicles,
      roadworks,
      weatherStations,
      datahubTiles,
      chargingStations,
      rental,
    } = this.props.mapLayers;
    const { mapMode: currentMapMode } = this.props;

    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = getTransportModes(this.context.config);

    const { config } = this.context;
    const datahubLayers =
      config.datahubTiles && config.datahubTiles.show
        ? config.datahubTiles.layers
        : [];
    const datahubBicycleLayers = datahubLayers.map(layer => {
      return {
        checked: datahubTiles[layer.name],
        defaultMessage: layer.name,
        labelId: layer.labelId,
        icon: layer.icon,
        settings: { datahubTiles: layer.name },
      };
    });

    return (
      <>
        <button
          className="panel-close"
          onClick={() => this.handlePanelState(false)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) && this.handlePanelState(false)
          }
          type="button"
        >
          <Icon img="icon-icon_close" />
        </button>
        <span className="map-layer-header">
          {this.context.intl.formatMessage({
            id: 'select-map-layers-header',
            defaultMessage: 'Bubble Dialog Header',
          })}
        </span>
        <div className="map-layers-content">
          <div>
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-public-transit',
                defaultMessage: 'Public Transit',
              })}
              icon="icon-icon_material_rail"
              onChange={this.updateSetting}
              options={[
                isTransportModeEnabled(transportModes.bus) && {
                  checked: stop.bus,
                  disabled: !!this.props.mapLayerOptions?.stop?.bus?.isLocked,
                  defaultMessage: 'Bus stop',
                  labelId: 'map-layer-stop-bus',
                  icon: 'icon-icon_stop_bus',
                  settings: { stop: 'bus' },
                },
                isTransportModeEnabled(transportModes.subway) && {
                  checked: terminal.subway,
                  defaultMessage: 'Subway station',
                  labelId: 'map-layer-terminal-subway',
                  icon: 'icon-icon_stop_subway',
                  settings: { stop: 'subway', terminal: 'subway' },
                },
                isTransportModeEnabled(transportModes.rail) && {
                  checked: terminal.rail,
                  defaultMessage: 'Railway station',
                  labelId: 'map-layer-terminal-rail',
                  icon: 'icon-icon_stop_rail',
                  settings: { stop: 'rail', terminal: 'rail' },
                },
                isTransportModeEnabled(transportModes.tram) && {
                  checked: stop.tram,
                  disabled: !!this.props.mapLayerOptions?.stop?.tram?.isLocked,
                  defaultMessage: 'Tram stop',
                  labelId: 'map-layer-stop-tram',
                  icon: 'icon-icon_stop_tram',
                  settings: { stop: 'tram' },
                },
                isTransportModeEnabled(transportModes.ferry) && {
                  checked: stop.ferry,
                  disabled: !!this.props.mapLayerOptions?.stop?.ferry?.isLocked,
                  defaultMessage: 'Ferry',
                  labelId: 'map-layer-stop-ferry',
                  icon: 'icon-icon_stop_ferry',
                  settings: { stop: 'ferry' },
                },
                this.context.config.vehicles && {
                  checked: vehicles,
                  disabled: !!this.props.mapLayerOptions?.vehicles?.isLocked,
                  defaultMessage: 'Moving vehicles',
                  labelId: 'map-layer-vehicles',
                  icon: 'icon-icon_moving_bus',
                  settings: 'vehicles',
                },
              ]}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-bicycle',
                defaultMessage: 'Bicycle',
              })}
              icon="icon-icon_material_bike"
              onChange={this.updateSetting}
              options={[
                this.context.config.parkAndRideForBikes &&
                  this.context.config.parkAndRideForBikes.show && {
                    checked: parkAndRideForBikes,
                    defaultMessage: 'Bike parks',
                    labelId: 'map-layer-bike-parks', // todo: rename?
                    icon: 'icon-bike-park',
                    settings: 'parkAndRideForBikes',
                  },
              ]
                .concat(
                  this.layerOptionsByCategory(
                    'bicycle',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .concat(datahubBicycleLayers)}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-sharing',
                defaultMessage: 'Sharing',
              })}
              icon="icon-icon_material_bike_scooter"
              onChange={this.updateSetting}
              options={[
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.bicycle,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Bikes',
                    labelId: 'map-layer-sharing-bicycle',
                    icon: 'icon-icon_rental_bicycle',
                    settings: { rental: 'bicycle' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.scooter,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Scooters',
                    labelId: 'map-layer-sharing-scooter',
                    icon: 'icon-icon_rental_scooter',
                    settings: { rental: 'scooter' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.cargo_bicycle,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Cargo-Bikes',
                    labelId: 'map-layer-sharing-cargo_bicycle',
                    icon: 'icon-icon_rental_cargo_bicycle',
                    settings: { rental: 'cargo_bicycle' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.car,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Cars',
                    labelId: 'map-layer-sharing-car',
                    icon: 'icon-icon_rental_car',
                    settings: { rental: 'car' },
                  },
                isTransportModeEnabled(transportModes.carpool) && {
                  checked: terminal.carpool,
                  defaultMessage: 'Carpool stops',
                  labelId: 'map-layer-carpool',
                  icon: 'icon-icon_carpool_stops',
                  settings: { stop: 'carpool', terminal: 'carpool' },
                },
              ]}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-car',
                defaultMessage: 'Car',
              })}
              icon="icon-icon_material_car"
              onChange={this.updateSetting}
              options={[
                this.context.config.parkAndRide &&
                  this.context.config.parkAndRide.show && {
                    checked: parkAndRide,
                    disabled: !!this.props.mapLayerOptions?.parkAndRide
                      ?.isLocked,
                    defaultMessage: 'Park &amp; ride',
                    labelId: 'map-layer-park-and-ride',
                    icon: 'icon-icon_open_carpark',
                    settings: 'parkAndRide',
                  },
                this.context.config.chargingStations &&
                  this.context.config.chargingStations.show && {
                    checked: chargingStations,
                    defaultMessage: 'Charging stations',
                    labelId: 'map-layer-charging-stations',
                    icon: 'icon-icon_stop_car_charging_station',
                    settings: 'chargingStations',
                  },
              ].concat(
                this.layerOptionsByCategory(
                  'car',
                  config.geoJson?.layers,
                  geoJson,
                  this.props.lang,
                ),
              )}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-others',
                defaultMessage: 'Others',
              })}
              icon="icon-icon_material_map"
              onChange={this.updateSetting}
              options={[
                this.context.config.roadworks &&
                  this.context.config.roadworks.show && {
                    checked: roadworks,
                    defaultMessage: 'Roadworks',
                    labelId: 'map-layer-roadworks',
                    icon: 'icon-icon_roadworks',
                    settings: 'roadworks',
                  },
                this.context.config.weatherStations &&
                  this.context.config.weatherStations.show && {
                    checked: weatherStations,
                    defaultMessage: 'Road weather',
                    labelId: 'map-layer-weather-stations',
                    icon: 'icon-icon_stop_monitor',
                    settings: 'weatherStations',
                  },
              ].concat(
                this.layerOptionsByCategory(
                  'other',
                  config.geoJson?.layers,
                  geoJson,
                  this.props.lang,
                ),
              )}
            />
          </div>

          <p className="panel-maptype-title">
            <FormattedMessage id="map-type" defaultMessage="Map type" />
          </p>

          <div className="panel-maptype-container">
            {config.backgroundMaps?.map(bgMapConfig => {
              const {
                mapMode,
                messageId,
                defaultMessage,
                previewImage,
              } = bgMapConfig;
              const isCurrent = currentMapMode === mapMode;
              return (
                <button
                  key={mapMode}
                  type="button"
                  className={cx('panel-maptype-button', isCurrent && 'checked')}
                  onClick={() => {
                    this.props.setMapMode(mapMode);
                  }}
                >
                  <img
                    alt={defaultMessage}
                    className={cx(
                      'panel-maptype-image',
                      isCurrent && 'checked',
                    )}
                    src={previewImage}
                  />
                  <FormattedMessage
                    id={messageId}
                    defaultMessage={defaultMessage}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

MapLayersDialogContent.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  updateMapLayers: PropTypes.func.isRequired,
  lang: PropTypes.string,
  setMapMode: PropTypes.func.isRequired,
};

MapLayersDialogContent.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};
/**
 * Retrieves the list of geojson layers in use from the configuration or
 * the geojson store. If no layers exist in these sources, the
 * defaultValue is returned.
 *
 * @param {*} config the configuration for the software installation.
 * @param {*} store the geojson store.
 * @param {*} defaultValue the default value, defaults to undefined.
 */
export const getGeoJsonLayersOrDefault = (
  config,
  store,
  defaultValue = undefined,
) => {
  return (
    (config &&
      config.geoJson &&
      Array.isArray(config.geoJson.layers) &&
      config.geoJson.layers) ||
    (store && Array.isArray(store.layers) && store.layers) ||
    defaultValue
  );
};

const connectedComponent = connectToStores(
  withGeojsonObjects(MapLayersDialogContent),
  [GeoJsonStore, MapLayerStore, 'PreferencesStore', 'MapModeStore'],
  ({ config, executeAction, getStore }) => ({
    config: {
      ...config,
      geoJson: {
        layers: getGeoJsonLayersOrDefault(config, getStore(GeoJsonStore)),
      },
    },
    mapLayers: getStore(MapLayerStore).getMapLayers(),
    updateMapLayers: mapLayers => executeAction(updateMapLayers, mapLayers),
    lang: getStore('PreferencesStore').getLanguage(),
    mapMode: getStore('MapModeStore').getMapMode(),
    setMapMode: mapMode => executeAction(setMapMode, mapMode),
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent, MapLayersDialogContent as Component };
export default withRouter(connectedComponent);
