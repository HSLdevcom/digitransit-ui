/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { isKeyboardSelectionEvent } from '../util/browser';
import Icon from './Icon';
import Checkbox from './Checkbox';
import GeoJsonStore from '../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';
import { updateMapLayers } from '../action/MapLayerActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withGeojsonObjects from './map/withGeojsonObjects';
import { mapLayerOptionsShape } from '../util/shapes';
import { getTransportModes, showCityBikes } from '../util/modeUtils';

const transportModeConfigShape = PropTypes.shape({
  availableForSelection: PropTypes.bool,
});

const mapLayersConfigShape = PropTypes.shape({
  cityBike: PropTypes.shape({
    networks: PropTypes.object,
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

  render() {
    const {
      bikeParks,
      citybike,
      parkAndRide,
      chargingStations,
      dynamicParkingLots,
      stop,
      geoJson,
      vehicles,
    } = this.props.mapLayers;
    let arr;
    if (this.props.geoJson) {
      arr = Object.entries(this.props.geoJson)?.map(([k, v]) => {
        return { url: k, ...v };
      });
    }
    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = getTransportModes(this.context.config);
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
        <div className="checkbox-grouping">
          {this.context.config.vehicles && (
            <Checkbox
              large
              checked={
                !this.props.mapLayerOptions
                  ? vehicles
                  : !!this.props.mapLayerOptions?.vehicles?.isLocked &&
                    !!this.props.mapLayerOptions?.vehicles?.isSelected
              }
              disabled={!!this.props.mapLayerOptions?.vehicles?.isLocked}
              defaultMessage="Moving vehicles"
              labelId="map-layer-vehicles"
              onChange={e => {
                this.updateSetting({ vehicles: e.target.checked });
                this.sendLayerChangeAnalytic('Vehicles', e.target.checked);
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.bus) && (
            <Fragment>
              <Checkbox
                large
                checked={stop.bus}
                disabled={!!this.props.mapLayerOptions?.stop?.bus?.isLocked}
                defaultMessage="Bus stop"
                labelId="map-layer-stop-bus"
                onChange={e => {
                  this.updateStopSetting({ bus: e.target.checked });
                  this.sendLayerChangeAnalytic('BusStop', e.target.checked);
                }}
              />
            </Fragment>
          )}
          {isTransportModeEnabled(transportModes.subway) && (
            <Fragment>
              <Checkbox
                large
                checked={stop.subway}
                disabled={!!this.props.mapLayerOptions?.stop?.subway?.isLocked}
                defaultMessage="Subway station"
                labelId="map-layer-stop-subway"
                onChange={e => {
                  // todo: terminal?
                  this.updateStopSetting({ subway: e.target.checked });
                }}
              />
            </Fragment>
          )}
          {isTransportModeEnabled(transportModes.rail) && (
            <Fragment>
              <Checkbox
                large
                checked={stop.rail}
                disabled={!!this.props.mapLayerOptions?.stop?.rail?.isLocked}
                defaultMessage="Railway station"
                labelId="map-layer-stop-rail"
                onChange={e => {
                  // todo: terminal
                  this.updateStopSetting({ rail: e.target.checked });
                }}
              />
            </Fragment>
          )}
          {isTransportModeEnabled(transportModes.tram) && (
            <Checkbox
              large
              checked={stop.tram}
              disabled={!!this.props.mapLayerOptions?.stop?.tram?.isLocked}
              defaultMessage="Tram stop"
              labelId="map-layer-stop-tram"
              onChange={e => {
                this.updateStopSetting({ tram: e.target.checked });
                this.sendLayerChangeAnalytic('TramStop', e.target.checked);
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.ferry) && (
            <Checkbox
              large
              checked={stop.ferry}
              disabled={!!this.props.mapLayerOptions?.stop?.ferry?.isLocked}
              defaultMessage="Ferry"
              labelId="map-layer-stop-ferry"
              onChange={e => {
                this.updateStopSetting({ ferry: e.target.checked });
                this.sendLayerChangeAnalytic('FerryStop', e.target.checked);
              }}
            />
          )}
          {showCityBikes(
            this.context.config?.cityBike?.networks,
            this.context.config,
          ) && (
            <Checkbox
              large
              checked={citybike}
              disabled={!!this.props.mapLayerOptions?.citybike?.isLocked}
              defaultMessage="Citybike station"
              labelId="map-layer-citybike"
              onChange={e => {
                this.updateSetting({ citybike: e.target.checked });
                this.sendLayerChangeAnalytic('Citybike', e.target.checked);
              }}
            />
          )}
          {isTransportModeEnabled(transportModes.carpool) && (
            <Checkbox
              large
              checked={stop.carpool}
              disabled={!!this.props.mapLayerOptions?.stop?.carpool?.isLocked}
              defaultMessage="Carpool stop"
              labelId="map-layer-stop-carpool"
              onChange={e => {
                this.updateStopSetting({ carpool: e.target.checked });
              }}
            />
          )}
        </div>
        <div className="checkbox-grouping">
          {this.context.config.dynamicParkingLots &&
            this.context.config.dynamicParkingLots.showDynamicParkingLots && (
              <Checkbox
                large
                checked={dynamicParkingLots}
                disabled={
                  !!this.props.mapLayerOptions?.dynamicParkingLots?.isLocked
                }
                defaultMessage="Parking"
                labelId="map-layer-dynamic-parking-lots"
                onChange={e => {
                  this.updateSetting({ dynamicParkingLots: e.target.checked });
                }}
              />
            )}
          {this.context.config.parkAndRide &&
            this.context.config.parkAndRide.showParkAndRide && (
              <Checkbox
                large
                checked={parkAndRide}
                disabled={!!this.props.mapLayerOptions?.parkAndRide?.isLocked}
                defaultMessage="Park &amp; ride"
                labelId="map-layer-park-and-ride"
                onChange={e => {
                  this.updateSetting({ parkAndRide: e.target.checked });
                  this.sendLayerChangeAnalytic('ParkAndRide', e.target.checked);
                }}
              />
            )}
          {this.context.config.chargingStations &&
            this.context.config.chargingStations.showChargingStations && (
              <Checkbox
                large
                checked={chargingStations}
                disabled={
                  !!this.props.mapLayerOptions?.chargingStations?.isLocked
                }
                defaultMessage="Charging stations"
                labelId="map-layer-charging-stations"
                onChange={e => {
                  this.updateSetting({ chargingStations: e.target.checked });
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
      </Fragment>
    );
  }
}
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
  [GeoJsonStore, MapLayerStore, 'PreferencesStore'],
  ({ config, executeAction, getStore }) => ({
    config: {
      ...config,
      geoJson: {
        layers: getGeoJsonLayersOrDefault(config, getStore(GeoJsonStore)),
      },
    },
    updateMapLayers: mapLayers =>
      executeAction(updateMapLayers, { ...mapLayers }),
    lang: getStore('PreferencesStore').getLanguage(),
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent as default, MapLayersDialogContent as Component };
