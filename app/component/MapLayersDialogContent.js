/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape, withRouter } from 'found';
import { isKeyboardSelectionEvent } from '../util/browser';
import Icon from './Icon';

import Checkbox from './Checkbox';
import GeoJsonStore from '../store/GeoJsonStore';
import { updateMapLayers } from '../action/MapLayerActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withGeojsonObjects from './map/withGeojsonObjects';
import { replaceQueryParams, clearQueryParams } from '../util/queryUtils';
import { MapMode } from '../constants';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';
import { setMapMode } from '../action/MapModeActions';

const transportModeConfigShape = PropTypes.shape({
  availableForSelection: PropTypes.bool,
});
const mapLayersConfigShape = PropTypes.shape({
  cityBike: PropTypes.shape({
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
    mapLayers: PropTypes.object,
    setOpen: PropTypes.func.isRequired,
    updateMapLayers: PropTypes.func,
    lang: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    geoJson: PropTypes.object,
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
      ...this.props.mapLayers,
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
      ...this.props.mapLayers.stop,
      ...newSetting,
    };
    this.updateSetting({ stop });
  };

  updateTerminalSetting = newSetting => {
    const terminal = {
      ...this.props.mapLayers.terminal,
      ...newSetting,
    };
    this.updateSetting({ terminal });
  };

  updateTicketSalesSetting = newSetting => {
    const ticketSales = {
      ...this.props.mapLayers.ticketSales,
      ...newSetting,
    };
    this.updateSetting({ ticketSales });
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
      clearQueryParams(router, match, Object.keys(match.location.query));
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
    } = this.props.mapLayers;
    const { currentMapMode } = this.props;
    let arr;
    if (this.props.geoJson) {
      arr = Object.entries(this.props.geoJson)?.map(([k, v]) => {
        return { url: k, ...v };
      });
    }

    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = this.context.config.transportModes || {};
    return (
      <Fragment>
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
        <div className="checkbox-grouping" />{' '}
        {this.context.config.vehicles && (
          <div className="checkbox-grouping">
            <Checkbox
              large
              checked={vehicles}
              defaultMessage="Moving vehicles"
              labelId="map-layer-vehicles"
              onChange={e => {
                this.updateSetting({ vehicles: e.target.checked });
                this.sendLayerChangeAnalytic('Vehicles', e.target.checked);
              }}
            />
          </div>
        )}
        <div className="checkbox-grouping">
          {isTransportModeEnabled(transportModes.bus) && (
            <Fragment>
              <Checkbox
                large
                checked={stop.bus}
                defaultMessage="Bus stop"
                labelId="map-layer-stop-bus"
                onChange={e => {
                  this.updateStopSetting({ bus: e.target.checked });
                  this.sendLayerChangeAnalytic('BusStop', e.target.checked);
                }}
              />
              <Checkbox
                large
                checked={terminal.bus}
                defaultMessage="Bus terminal"
                labelId="map-layer-terminal-bus"
                onChange={e => {
                  this.updateTerminalSetting({ bus: e.target.checked });
                  this.sendLayerChangeAnalytic('BusTerminal', e.target.checked);
                }}
              />
            </Fragment>
          )}
          {isTransportModeEnabled(transportModes.tram) && (
            <Checkbox
              large
              checked={stop.tram}
              defaultMessage="Tram stop"
              labelId="map-layer-stop-tram"
              onChange={e => {
                this.updateStopSetting({ tram: e.target.checked });
                this.sendLayerChangeAnalytic('TramStop', e.target.checked);
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.rail) && (
            <Checkbox
              large
              checked={terminal.rail}
              defaultMessage="Railway station"
              labelId="map-layer-terminal-rail"
              onChange={e => {
                this.updateStopAndTerminalSetting({ rail: e.target.checked });
                this.sendLayerChangeAnalytic('RailTerminal', e.target.checked);
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.subway) && (
            <Checkbox
              large
              checked={terminal.subway}
              defaultMessage="Subway station"
              labelId="map-layer-terminal-subway"
              onChange={e => {
                this.updateStopAndTerminalSetting({ subway: e.target.checked });
                this.sendLayerChangeAnalytic(
                  'SubwayTerminal',
                  e.target.checked,
                );
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.carpool) && (
            <Checkbox
              large
              checked={terminal.carpool}
              defaultMessage="Carpool stops"
              labelId="map-layer-carpool"
              onChange={e =>
                this.updateStopAndTerminalSetting({ carpool: e.target.checked })
              }
            />
          )}
          {isTransportModeEnabled(transportModes.ferry) && (
            <Checkbox
              large
              checked={stop.ferry}
              defaultMessage="Ferry"
              labelId="map-layer-stop-ferry"
              onChange={e => {
                this.updateStopSetting({ ferry: e.target.checked });
                this.sendLayerChangeAnalytic('FerryStop', e.target.checked);
              }}
            />
          )}
          {this.context.config.cityBike &&
            this.context.config.cityBike.showCityBikes && (
              <Checkbox
                large
                checked={citybike}
                defaultMessage="Sharing"
                labelId="map-layer-sharing"
                onChange={e => {
                  this.updateSetting({ citybike: e.target.checked });
                  this.sendLayerChangeAnalytic('Citybike', e.target.checked);
                }}
              />
            )}
          {this.context.config.roadworks &&
            this.context.config.roadworks.showRoadworks && (
              <Checkbox
                large
                checked={roadworks}
                defaultMessage="Roadworks"
                labelId="map-layer-roadworks"
                onChange={e =>
                  this.updateSetting({ roadworks: e.target.checked })
                }
              />
            )}
          {this.context.config.bikeParks && this.context.config.bikeParks.show && (
            <Checkbox
              large
              checked={bikeParks}
              defaultMessage="Bike parks"
              labelId="map-layer-bike-parks"
              onChange={e => {
                this.updateSetting({ bikeParks: e.target.checked });
                this.sendLayerChangeAnalytic('BikeParks', e.target.checked);
              }}
            />
          )}
          {this.context.config.dynamicParkingLots &&
            this.context.config.dynamicParkingLots.showDynamicParkingLots && (
              <Checkbox
                large
                checked={dynamicParkingLots}
                defaultMessage="Parking"
                labelId="map-layer-dynamic-parking-lots"
                onChange={e =>
                  this.updateSetting({ dynamicParkingLots: e.target.checked })
                }
              />
            )}
          {this.context.config.weatherStations &&
            this.context.config.weatherStations.show && (
              <Checkbox
                large
                checked={weatherStations}
                defaultMessage="Road weather"
                labelId="map-layer-weather-stations"
                onChange={e => {
                  this.updateSetting({ weatherStations: e.target.checked });
                  this.sendLayerChangeAnalytic(
                    'WeatherStations',
                    e.target.checked,
                  );
                }}
              />
            )}

          {this.context.config.parkAndRide &&
            this.context.config.parkAndRide.showParkAndRide && (
              <Checkbox
                large
                checked={parkAndRide}
                defaultMessage="Park &amp; ride"
                labelId="map-layer-park-and-ride"
                onChange={e => {
                  this.updateSetting({ parkAndRide: e.target.checked });
                  this.sendLayerChangeAnalytic('ParkAndRide', e.target.checked);
                }}
              />
            )}
        </div>
        {arr && Array.isArray(arr) && (
          <div className="checkbox-grouping">
            {arr.map(gj => (
              <Checkbox
                large
                checked={
                  (gj.isOffByDefault && geoJson[gj.url] === true) ||
                  (!gj.isOffByDefault && geoJson[gj.url] !== false)
                }
                defaultMessage={gj.name[this.props.lang]}
                key={gj.url}
                onChange={e => {
                  const newSetting = {};
                  newSetting[gj.url] = e.target.checked;
                  this.updateGeoJsonSetting(newSetting);
                  this.sendLayerChangeAnalytic('Zones', e.target.checked);
                }}
              />
            ))}
          </div>
        )}
        <div className="checkbox-grouping">
          <h4>
            <FormattedMessage
              id="map-background"
              defaultMessage="Map background"
            />
          </h4>
          <label className="radio-label" htmlFor="street">
            <input
              type="radio"
              id="street"
              value="street"
              name="mapMode"
              onChange={() => {
                this.switchMapLayers(MapMode.Default);
              }}
              checked={currentMapMode === MapMode.Default}
            />
            <FormattedMessage id="streets" defaultMessage="Streets" />
          </label>
          <label className="radio-label" htmlFor="satellite">
            <input
              type="radio"
              id="satellite"
              value="satellite"
              name="mapMode"
              onChange={() => {
                this.switchMapLayers(MapMode.Satellite);
              }}
              checked={currentMapMode === MapMode.Satellite}
            />
            <FormattedMessage id="satellite" defaultMessage="Satellite" />
          </label>
          <label className="radio-label" htmlFor="bicycle">
            <input
              type="radio"
              id="bicycle"
              value="bicycle"
              name="mapMode"
              onChange={() => {
                this.switchMapLayers(MapMode.Bicycle);
              }}
              checked={currentMapMode === MapMode.Bicycle}
            />
            <FormattedMessage id="bicycle" defaultMessage="Bicycle" />
          </label>
        </div>
      </Fragment>
    );
  }
}

MapLayersDialogContent.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  updateMapLayers: PropTypes.func.isRequired,
  lang: PropTypes.string,
  currentMapMode: PropTypes.string.isRequired,
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
    currentMapMode: getStore('MapModeStore').getMapMode(),
    setMapMode: mapMode => executeAction(setMapMode, mapMode),
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent, MapLayersDialogContent as Component };
export default withRouter(connectedComponent);
