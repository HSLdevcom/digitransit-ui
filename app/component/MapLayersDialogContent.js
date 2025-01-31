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
          const id = layer.id || layer.url;
          return {
            key: layer.code || id,
            checked:
              (layer.isOffByDefault && geoJson[id] === true) ||
              (!layer.isOffByDefault && geoJson[id] !== false), // todo: is active?
            defaultMessage: layer.name?.[lang] || layer.defaultMessage,
            labelId: layer.labelId, // todo: rename?
            icon: layer.icon,
            settings: { geoJson: id },
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

    const { config, intl } = this.context;
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

    const getPoiLayers = layer => {
      if (!layer || !layer.categories) {
        return [];
      }
      return layer.categories
        .map(({ code, translations, categories, properties }) => {
          if (properties && properties.layer.type !== 'poi_layer') {
            return null;
          }

          const { svg_menu: svgMenu } = categories
            ? categories[0].properties.icon
            : properties.icon;

          const checked =
            categories === undefined
              ? this.props.mapLayers[code]
              : categories.every(
                  subCategory => this.props.mapLayers[subCategory.code],
                );

          return {
            checked,
            label: translations[intl.locale],
            key: code,
            categories: categories?.map(category => ({
              ...category,
              settings: category.code,
            })),
            settings: code,
            dataURI: svgMenu
              ? `data:image/svg+xml;base64,${btoa(svgMenu)}`
              : undefined,
          };
        })
        .filter(Boolean);
    };

    const layerConfig = config.layers;

    const bikeCarLayer = layerConfig?.find(({ code }) => code === 'bike_car');
    const sharingServicesLayer = layerConfig?.find(
      ({ code }) => code === 'sharing_services',
    );
    const leisureAndTourismLayer = layerConfig?.find(
      ({ code }) => code === 'leisure_and_tourism',
    );
    const shoppingAndServicesLayer = layerConfig?.find(
      ({ code }) => code === 'shopping_and_services',
    );
    const publicFacilitiesLayer = layerConfig?.find(
      ({ code }) => code === 'public_facilities',
    );
    const healthAndSocialServicesLayer = layerConfig?.find(
      ({ code }) => code === 'health_and_social_services',
    );

    const sortLayersByKey = (a, b) => {
      // Retrieve the order of the layers from the configuration.
      // Top- and Sub-level category codes are considered.
      const layerOrder =
        config.layers
          ?.flatMap(category => category.categories || category)
          .map(category => [
            category.code,
            // Retrieve order of sub-categories if they exist
            ...(category.categories
              ? category.categories.map(({ code }) => code)
              : []),
          ])
          .flat() || [];

      return layerOrder.indexOf(a.key) - layerOrder.indexOf(b.key);
    };

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
              icon="icon-icon_material_rail"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-public-transit',
                defaultMessage: 'Public Transit',
              })}
              onChange={this.updateSetting}
              options={[
                isTransportModeEnabled(transportModes.bus) && {
                  checked: stop.bus,
                  disabled: !!this.props.mapLayerOptions?.stop?.bus?.isLocked,
                  defaultMessage: 'Bus stop',
                  labelId: 'map-layer-stop-bus',
                  icon: 'icon-icon_stop_bus',
                  key: 'bus',
                  settings: { stop: 'bus' },
                },
                isTransportModeEnabled(transportModes.subway) && {
                  checked: terminal.subway,
                  defaultMessage: 'Subway station',
                  labelId: 'map-layer-terminal-subway',
                  icon: 'icon-icon_stop_subway',
                  key: 'subway',
                  settings: { stop: 'subway', terminal: 'subway' },
                },
                isTransportModeEnabled(transportModes.rail) && {
                  checked: terminal.rail,
                  defaultMessage: 'Railway station',
                  labelId: 'map-layer-terminal-rail',
                  icon: 'icon-icon_stop_rail',
                  key: 'rail',
                  settings: { stop: 'rail', terminal: 'rail' },
                },
                isTransportModeEnabled(transportModes.tram) && {
                  checked: stop.tram,
                  disabled: !!this.props.mapLayerOptions?.stop?.tram?.isLocked,
                  defaultMessage: 'Tram stop',
                  labelId: 'map-layer-stop-tram',
                  icon: 'icon-icon_stop_tram',
                  key: 'tram',
                  settings: { stop: 'tram' },
                },
                isTransportModeEnabled(transportModes.funicular) && {
                  checked: stop.funicular,
                  defaultMessage: 'Funicular stop',
                  labelId: 'map-layer-stop-funicular',
                  icon: 'icon-icon_stop_funicular',
                  settings: { stop: 'funicular' },
                },
                isTransportModeEnabled(transportModes.ferry) && {
                  checked: stop.ferry,
                  disabled: !!this.props.mapLayerOptions?.stop?.ferry?.isLocked,
                  defaultMessage: 'Ferry',
                  labelId: 'map-layer-stop-ferry',
                  icon: 'icon-icon_stop_ferry',
                  key: 'ferry',
                  settings: { stop: 'ferry' },
                },
                this.context.config.vehicles && {
                  checked: vehicles,
                  disabled: !!this.props.mapLayerOptions?.vehicles?.isLocked,
                  defaultMessage: 'Moving vehicles',
                  labelId: 'map-layer-vehicles',
                  icon: 'icon-icon_moving_bus',
                  key: 'vehicles',
                  settings: 'vehicles',
                },
              ].sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_bike_car"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-bicycle-car',
                defaultMessage: 'Bicycle & Car',
              })}
              onChange={this.updateSetting}
              options={[
                this.context.config.parkAndRideForBikes &&
                  this.context.config.parkAndRideForBikes.show && {
                    checked: parkAndRideForBikes,
                    defaultMessage: 'Bike parks',
                    labelId: 'map-layer-bike-parks', // todo: rename?
                    icon: 'icon-bike-park',
                    key: 'parkAndRideForBikes',
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
                .concat([
                  this.context.config.roadworks &&
                    this.context.config.roadworks.show && {
                      checked: roadworks,
                      defaultMessage: 'Roadworks',
                      labelId: 'map-layer-roadworks',
                      icon: 'icon-icon_roadworks',
                      key: 'roadworks',
                      settings: 'roadworks',
                    },
                  this.context.config.weatherStations &&
                    this.context.config.weatherStations.show && {
                      checked: weatherStations,
                      defaultMessage: 'Weather stations',
                      labelId: 'map-layer-weather-stations',
                      icon: 'icon-icon_stop_monitor',
                      key: 'weatherStations',
                      settings: 'weatherStations',
                    },
                  this.context.config.parkAndRide &&
                    this.context.config.parkAndRide.show && {
                      checked: parkAndRide,
                      disabled: !!this.props.mapLayerOptions?.parkAndRide
                        ?.isLocked,
                      defaultMessage: 'Park &amp; ride',
                      labelId: 'map-layer-park-and-ride',
                      icon: 'icon-icon_open_carpark',
                      key: 'parkAndRide',
                      settings: 'parkAndRide',
                    },
                  this.context.config.chargingStations &&
                    this.context.config.chargingStations.show && {
                      checked: chargingStations,
                      defaultMessage: 'Charging stations',
                      labelId: 'map-layer-charging-stations',
                      icon: 'icon-icon_stop_car_charging_station',
                      key: 'chargingStations',
                      settings: 'chargingStations',
                    },
                ])
                .concat(
                  this.layerOptionsByCategory(
                    'car',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .concat(datahubBicycleLayers)
                .concat(getPoiLayers(bikeCarLayer))
                .sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_material_bike_scooter"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-sharing',
                defaultMessage: 'Sharing',
              })}
              onChange={this.updateSetting}
              options={[
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.bicycle,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Bikes',
                    labelId: 'map-layer-sharing-bicycle',
                    icon: 'icon-icon_rental_bicycle',
                    key: 'bicycle',
                    settings: { rental: 'bicycle' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.scooter,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Scooters',
                    labelId: 'map-layer-sharing-scooter',
                    icon: 'icon-icon_rental_scooter',
                    key: 'scooter',
                    settings: { rental: 'scooter' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.cargo_bicycle,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Cargo-Bikes',
                    labelId: 'map-layer-sharing-cargo_bicycle',
                    icon: 'icon-icon_rental_cargo_bicycle',
                    key: 'cargo_bicycle',
                    settings: { rental: 'cargo_bicycle' },
                  },
                this.context.config?.cityBike?.showCityBikes &&
                  showCityBikes(this.context.config?.cityBike?.networks) && {
                    checked: rental.car,
                    disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                    defaultMessage: 'Rental Cars',
                    labelId: 'map-layer-sharing-car',
                    icon: 'icon-icon_rental_car',
                    key: 'car',
                    settings: { rental: 'car' },
                  },
                isTransportModeEnabled(transportModes.carpool) && {
                  checked: terminal.carpool,
                  defaultMessage: 'Carpool stops',
                  labelId: 'map-layer-carpool',
                  icon: 'icon-icon_carpool_stops',
                  key: 'carpool',
                  settings: { stop: 'carpool', terminal: 'carpool' },
                },
              ]
                .concat(getPoiLayers(sharingServicesLayer))
                .sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_leisure_tourism"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-leisure-tourism',
                defaultMessage: 'Leisure & Tourism',
              })}
              onChange={this.updateSetting}
              options={getPoiLayers(leisureAndTourismLayer)
                .concat(
                  this.layerOptionsByCategory(
                    'leisure_and_tourism',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_shopping_services"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-shopping-services',
                defaultMessage: 'Shopping & Services',
              })}
              onChange={this.updateSetting}
              options={getPoiLayers(shoppingAndServicesLayer)
                .concat(
                  this.layerOptionsByCategory(
                    'shopping_and_services',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_public_facilities"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-public-facilities',
                defaultMessage: 'Public Facilities',
              })}
              onChange={this.updateSetting}
              options={getPoiLayers(publicFacilitiesLayer)
                .concat(
                  this.layerOptionsByCategory(
                    'public_facilities',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .sort(sortLayersByKey)}
            />
            <LayerCategoryDropdown
              icon="icon-icon_health_social_services"
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-health-social-services',
                defaultMessage: 'Health & Social Services',
              })}
              onChange={this.updateSetting}
              options={getPoiLayers(healthAndSocialServicesLayer)
                .concat(
                  this.layerOptionsByCategory(
                    'health_and_social_services',
                    config.geoJson?.layers,
                    geoJson,
                    this.props.lang,
                  ),
                )
                .sort(sortLayersByKey)}
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
