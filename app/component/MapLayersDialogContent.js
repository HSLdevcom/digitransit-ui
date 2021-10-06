/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import cx from 'classnames';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape, withRouter } from 'found';
import merge from 'lodash/merge';
import { isKeyboardSelectionEvent } from '../util/browser';
import Icon from './Icon';
import GeoJsonStore from '../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';
import { updateMapLayers } from '../action/MapLayerActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withGeojsonObjects from './map/withGeojsonObjects';
import { replaceQueryParams, clearQueryParams } from '../util/queryUtils';
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
        name: PropTypes.shape({
          en: PropTypes.string,
          fi: PropTypes.string.isRequired,
          sv: PropTypes.string,
        }),
      }),
    ),
  }),
  parkAndRide: PropTypes.shape({
    showParkAndRide: PropTypes.bool,
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
    this.props.updateMapLayers({
      ...newSetting,
    });
  };

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

  updateStopSetting = newSetting => {
    const stop = {
      ...newSetting,
    };
    this.updateSetting({ stop });
  };

  updateGeoJsonSetting = newSetting => {
    const geoJson = {
      ...this.props.mapLayers.geoJson,
      ...newSetting,
    };
    this.updateSetting({ geoJson });
  };

  switchMapLayers = mode => {
    const mapMode = mode;
    const { router, match } = this.context;
    replaceQueryParams(router, match, { mapMode });
    if (mapMode === MapMode.Default) {
      clearQueryParams(router, match, ['mapMode']);
    }
    this.props.setMapMode(mapMode);
  };

  render() {
    const {
      citybike,
      parkAndRide,
      stop,
      terminal,
      geoJson,
      vehicles,
      bikeParks,
      roadworks,
      dynamicParkingLots,
      weatherStations,
      chargingStations,
    } = this.props.mapLayers;
    const currentMapMode =
      this.context.match.location.query.mapMode || MapMode.Default;
    let geoJsonLayers;
    if (this.props.geoJson) {
      geoJsonLayers = Object.entries(this.props.geoJson)?.map(([k, v]) => {
        return { url: k, ...v };
      });
    }

    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = getTransportModes(this.context.config);

    const bikeServiceLayer = geoJsonLayers?.find(
      layer => layer.name.en === 'Service stations and stores',
    );
    const publicToiletsLayer = geoJsonLayers?.find(
      layer => layer.name.en === 'Public Toilets',
    );
    const gatewaysLayer = geoJsonLayers?.find(
      layer => layer.name.en === 'LoRaWAN Gateways',
    );

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
              onChange={newSettings => {
                this.updateSetting(merge(this.props.mapLayers, newSettings));
              }}
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
              onChange={newSettings => {
                this.updateSetting(merge(this.props.mapLayers, newSettings));
              }}
              options={[
                this.context.config.bikeParks &&
                  this.context.config.bikeParks.show && {
                    checked: bikeParks,
                    defaultMessage: 'Bike parks',
                    labelId: 'map-layer-bike-parks',
                    icon: 'icon-bike-park',
                    settings: 'bikeParks',
                  },
                bikeServiceLayer && {
                  checked:
                    (bikeServiceLayer.isOffByDefault &&
                      geoJson[bikeServiceLayer.url] === true) ||
                    (!bikeServiceLayer.isOffByDefault &&
                      geoJson[bikeServiceLayer.url] !== false),
                  defaultMessage: bikeServiceLayer.name[this.props.lang],
                  icon: 'icon-icon_bike_repair',
                  key: bikeServiceLayer.url,
                  settings: { geoJson: bikeServiceLayer.url },
                },
              ]}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-sharing',
                defaultMessage: 'Sharing',
              })}
              icon="icon-icon_material_bike_scooter"
              onChange={newSettings => {
                this.updateSetting(merge(this.props.mapLayers, newSettings));
              }}
              options={[
                showCityBikes(this.context.config?.cityBike?.networks) && {
                  checked: citybike,
                  disabled: !!this.props.mapLayerOptions?.citybike?.isLocked,
                  defaultMessage: 'Sharing',
                  labelId: 'map-layer-sharing',
                  icon: 'icon-icon_citybike',
                  settings: 'citybike',
                },
                /* isTransportModeEnabled(transportModes.carpool) && {
                  checked: terminal.carpool,
                  defaultMessage: 'Carpool stops',
                  labelId: 'map-layer-carpool',
                  icon: 'icon-icon_carpool',
                  settings: { stop: 'carpool', terminal: 'carpool' },
                }, */
              ]}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-car',
                defaultMessage: 'Car',
              })}
              icon="icon-icon_material_car"
              onChange={newSettings => {
                this.updateSetting(merge(this.props.mapLayers, newSettings));
              }}
              options={[
                this.context.config.dynamicParkingLots &&
                  this.context.config.dynamicParkingLots
                    .showDynamicParkingLots && {
                    checked: dynamicParkingLots,
                    defaultMessage: 'Parking',
                    labelId: 'map-layer-dynamic-parking-lots',
                    icon: 'icon-icon_open_carpark',
                    settings: 'dynamicParkingLots',
                  },
                this.context.config.parkAndRide &&
                  this.context.config.parkAndRide.showParkAndRide && {
                    checked: parkAndRide,
                    disabled: !!this.props.mapLayerOptions?.parkAndRide
                      ?.isLocked,
                    defaultMessage: 'Park &amp; ride',
                    labelId: 'map-layer-park-and-ride',
                    icon: 'icon-icon_park-and-ride',
                    settings: 'parkAndRide',
                  },
                this.context.config.chargingStations &&
                  this.context.config.chargingStations.show && {
                    checked: chargingStations,
                    defaultMessage: 'Charging stations',
                    labelId: 'map-layer-charging-staions',
                    icon: 'icon-icon_stop_car_charging_station',
                    settings: 'chargingStations',
                  },
              ]}
            />
            <LayerCategoryDropdown
              title={this.context.intl.formatMessage({
                id: 'map-layer-category-others',
                defaultMessage: 'Others',
              })}
              icon="icon-icon_material_map"
              onChange={newSettings => {
                this.updateSetting(merge(this.props.mapLayers, newSettings));
              }}
              options={[
                publicToiletsLayer && {
                  checked:
                    (publicToiletsLayer.isOffByDefault &&
                      geoJson[publicToiletsLayer.url] === true) ||
                    (!publicToiletsLayer.isOffByDefault &&
                      geoJson[publicToiletsLayer.url] !== false),
                  defaultMessage: publicToiletsLayer.name[this.props.lang],
                  key: publicToiletsLayer.url,
                  icon: 'icon-icon_public_toilets',
                  settings: { geoJson: publicToiletsLayer.url },
                },
                this.context.config.roadworks &&
                  this.context.config.roadworks.showRoadworks && {
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
                gatewaysLayer && {
                  checked:
                    (gatewaysLayer.isOffByDefault &&
                      geoJson[gatewaysLayer.url] === true) ||
                    (!gatewaysLayer.isOffByDefault &&
                      geoJson[gatewaysLayer.url] !== false),
                  defaultMessage: gatewaysLayer.name[this.props.lang],
                  key: gatewaysLayer.url,
                  icon: 'icon-icon_gateways',
                  settings: { geoJson: gatewaysLayer.url },
                },
              ]}
            />
          </div>

          <p className="panel-maptype-title">
            <FormattedMessage id="map-type" defaultMessage="Map type" />
          </p>

          <div className="panel-maptype-container">
            <button
              type="button"
              className={cx(
                'panel-maptype-button',
                currentMapMode === MapMode.Default && 'checked',
              )}
              onClick={() => {
                this.switchMapLayers(MapMode.Default);
              }}
            >
              <img
                alt="street"
                className={cx(
                  'panel-maptype-image',
                  currentMapMode === MapMode.Default && 'checked',
                )}
                src="/img/maptype-streets.png"
              />
              <FormattedMessage id="streets" defaultMessage="Streets" />
            </button>
            <button
              type="button"
              className={cx(
                'panel-maptype-button',
                currentMapMode === MapMode.Satellite && 'checked',
              )}
              onClick={() => {
                this.switchMapLayers(MapMode.Satellite);
              }}
            >
              <img
                alt="satellite"
                className={cx(
                  'panel-maptype-image',
                  currentMapMode === MapMode.Satellite && 'checked',
                )}
                src="/img/maptype-satellite.png"
              />
              <FormattedMessage id="satellite" defaultMessage="Satellite" />
            </button>
            <button
              type="button"
              className={cx(
                'panel-maptype-button',
                currentMapMode === MapMode.Bicycle && 'checked',
              )}
              onClick={() => {
                this.switchMapLayers(MapMode.Bicycle);
              }}
            >
              <img
                alt="bicycle"
                className={cx(
                  'panel-maptype-image',
                  currentMapMode === MapMode.Bicycle && 'checked',
                )}
                src="/img/maptype-terrain.png"
              />
              <FormattedMessage id="bicycle" defaultMessage="Bicycle" />
            </button>
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
  match: matchShape.isRequired,
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
    updateMapLayers: mapLayers =>
      executeAction(updateMapLayers, { ...mapLayers }),
    lang: getStore('PreferencesStore').getLanguage(),
    setMapMode: mapMode => executeAction(setMapMode, mapMode),
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent, MapLayersDialogContent as Component };
export default withRouter(connectedComponent);
