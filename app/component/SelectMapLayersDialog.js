import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { updateMapLayers } from '../action/MapLayerActions';
import GeoJsonStore from '../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';

import ComponentUsageExample from './ComponentUsageExample';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { replaceQueryParams, clearQueryParams } from '../util/queryUtils';
import { MapMode } from '../constants';
import { setMapMode } from '../action/MapModeActions';

class SelectMapLayersDialog extends React.Component {
  updateSetting = newSetting => {
    this.props.updateMapLayers({
      ...this.props.mapLayers,
      ...newSetting,
    });
  };

  sendLayerChangeAnalytic = (name, enable) => {
    const action = enable ? 'ShowMapLayer' : 'HideMapLayer';
    addAnalyticsEvent({
      category: 'Map',
      action,
      name,
    });
  };

  updateCarpoolAndParkingSettings = (carpoolSetting, parkingSetting) => {
    const { mapLayers } = this.props;
    const stop = {
      ...mapLayers.stop,
      ...carpoolSetting,
    };
    const terminal = {
      ...mapLayers.terminal,
      ...carpoolSetting,
    };
    const { dynamicParkingLots } = parkingSetting;
    this.updateSetting({ stop, terminal, dynamicParkingLots });
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
    replaceQueryParams(this.context.router, { mapMode });
    if (mapMode === MapMode.Default) {
      clearQueryParams(
        this.context.router,
        Object.keys(this.context.router.location.query),
      );
    }
    this.props.setMapMode(mapMode);
  };

  renderContents = (
    {
      citybike,
      parkAndRide,
      covid19,
      dynamicParkingLots,
      roadworks,
      stop,
      terminal,
      ticketSales,
      geoJson,
      showAllBusses,
    },
    config,
    lang,
    currentMapMode,
  ) => {
    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = config.transportModes || {};
    return (
      <React.Fragment>
        {config.showAllBusses && (
          <div className="checkbox-grouping">
            <Checkbox
              checked={showAllBusses}
              defaultMessage="Moving vehicles"
              labelId="map-layer-vehicles"
              onChange={e => {
                this.updateSetting({ showAllBusses: e.target.checked });
                this.sendLayerChangeAnalytic('Vehicles', e.target.checked);
              }}
            />
          </div>
        )}
        <div className="checkbox-grouping">
          {isTransportModeEnabled(transportModes.bus) && (
            <React.Fragment>
              <Checkbox
                checked={stop.bus}
                defaultMessage="Bus stop"
                labelId="map-layer-stop-bus"
                onChange={e => {
                  this.updateStopSetting({ bus: e.target.checked });
                  this.sendLayerChangeAnalytic('BusStop', e.target.checked);
                }}
              />
              <Checkbox
                checked={terminal.bus}
                defaultMessage="Bus terminal"
                labelId="map-layer-terminal-bus"
                onChange={e => {
                  this.updateTerminalSetting({ bus: e.target.checked });
                  this.sendLayerChangeAnalytic('BusTerminal', e.target.checked);
                }}
              />
            </React.Fragment>
          )}
          {isTransportModeEnabled(transportModes.tram) && (
            <Checkbox
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
          {isTransportModeEnabled(transportModes.ferry) && (
            <Checkbox
              checked={stop.ferry}
              defaultMessage="Ferry"
              labelId="map-layer-stop-ferry"
              onChange={e => {
                this.updateStopSetting({ ferry: e.target.checked });
                this.sendLayerChangeAnalytic('FerryStop', e.target.checked);
              }}
            />
          )}
          {config.cityBike &&
            config.cityBike.showCityBikes && (
              <Checkbox
                checked={citybike}
                defaultMessage="Citybike station"
                labelId="map-layer-citybike"
                onChange={e => {
                  this.updateSetting({ citybike: e.target.checked });
                  this.sendLayerChangeAnalytic('Citybike', e.target.checked);
                }}
              />
            )}
          {config.roadworks &&
            config.roadworks.showRoadworks && (
              <Checkbox
                checked={roadworks}
                defaultMessage="Roadworks"
                labelId="map-layer-roadworks"
                onChange={e =>
                  this.updateSetting({ roadworks: e.target.checked })
                }
              />
            )}
          {isTransportModeEnabled(transportModes.carpool) &&
            config.dynamicParkingLots &&
            config.dynamicParkingLots.showDynamicParkingLots && (
              <Checkbox
                checked={dynamicParkingLots || terminal.carpool}
                defaultMessage="Carpool & Parking"
                labelId="carpool-and-parking"
                onChange={e =>
                  this.updateCarpoolAndParkingSettings(
                    { carpool: e.target.checked },
                    { dynamicParkingLots: e.target.checked },
                  )
                }
              />
            )}
          {config.parkAndRide &&
            config.parkAndRide.showParkAndRide && (
              <Checkbox
                checked={parkAndRide}
                defaultMessage="Park &amp; ride"
                labelId="map-layer-park-and-ride"
                onChange={e => {
                  this.updateSetting({ parkAndRide: e.target.checked });
                  this.sendLayerChangeAnalytic('ParkAndRide', e.target.checked);
                }}
              />
            )}
          {config.covid19 &&
            config.covid19.show && (
              <Checkbox
                checked={covid19}
                defaultMessage="Covid-19 opening hours"
                labelId="map-layer-covid-19"
                onChange={e => {
                  this.updateSetting({ covid19: e.target.checked });
                  this.sendLayerChangeAnalytic('Covid19', e.target.checked);
                }}
              />
            )}
        </div>
        {config.ticketSales &&
          config.ticketSales.showTicketSales && (
            <div className="checkbox-grouping">
              <Checkbox
                checked={ticketSales.ticketMachine}
                defaultMessage="Ticket machine"
                labelId="map-layer-ticket-sales-machine"
                onChange={e => {
                  this.updateTicketSalesSetting({
                    ticketMachine: e.target.checked,
                  });
                  this.sendLayerChangeAnalytic(
                    'TicketSalesMachine',
                    e.target.checked,
                  );
                }}
              />
              <Checkbox
                checked={ticketSales.salesPoint}
                defaultMessage="Travel Card top up"
                labelId="map-layer-ticket-sales-point"
                onChange={e => {
                  this.updateTicketSalesSetting({
                    salesPoint: e.target.checked,
                    servicePoint: e.target.checked,
                  });
                  this.sendLayerChangeAnalytic(
                    'TicketSalesPoint',
                    e.target.checked,
                  );
                }}
              />
            </div>
          )}
        {config.geoJson &&
          Array.isArray(config.geoJson.layers) && (
            <div className="checkbox-grouping">
              {config.geoJson.layers.map(gj => (
                <Checkbox
                  checked={
                    (gj.isOffByDefault && geoJson[gj.url] === true) ||
                    (!gj.isOffByDefault && geoJson[gj.url] !== false)
                  }
                  defaultMessage={gj.name[lang]}
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
      </React.Fragment>
    );
  };

  render() {
    const { config, lang, isOpen, mapLayers, currentMapMode } = this.props;
    const tooltip =
      config.mapLayers &&
      config.mapLayers.tooltip &&
      config.mapLayers.tooltip[lang];

    return (
      <BubbleDialog
        contentClassName="select-map-layers-dialog-content"
        header="select-map-layers-header"
        icon="map-layers"
        id="mapLayerSelectorV2"
        isFullscreenOnMobile
        isOpen={isOpen}
        tooltip={tooltip}
      >
        {this.renderContents(mapLayers, config, lang, currentMapMode)}
      </BubbleDialog>
    );
  }
}

const transportModeConfigShape = PropTypes.shape({
  availableForSelection: PropTypes.bool,
});

const mapLayersConfigShape = PropTypes.shape({
  cityBike: PropTypes.shape({
    showCityBikes: PropTypes.bool,
  }),
  dynamicParkingLots: PropTypes.shape({
    showDynamicParkingLots: PropTypes.bool,
  }),
  roadworks: PropTypes.shape({
    roadworks: PropTypes.bool,
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
  ticketSales: PropTypes.shape({
    showTicketSales: PropTypes.bool,
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
  showAllBusses: PropTypes.bool,
});

SelectMapLayersDialog.propTypes = {
  config: mapLayersConfigShape,
  isOpen: PropTypes.bool,
  mapLayers: mapLayerShape.isRequired,
  updateMapLayers: PropTypes.func.isRequired,
  lang: PropTypes.string,
  currentMapMode: PropTypes.string.isRequired,
  setMapMode: PropTypes.func.isRequired,
};

SelectMapLayersDialog.defaultProps = {
  config: {},
  isOpen: false,
  lang: 'fi',
};

SelectMapLayersDialog.contextTypes = {
  router: routerShape,
};

SelectMapLayersDialog.description = (
  <ComponentUsageExample isFullscreen>
    <div style={{ bottom: 0, left: 0, position: 'absolute' }}>
      <SelectMapLayersDialog
        config={{
          parkAndRide: {
            showParkAndRide: true,
          },
          ticketSales: {
            showTicketSales: true,
          },
          transportModes: {
            bus: {
              availableForSelection: true,
            },
            ferry: {
              availableForSelection: true,
            },
            rail: {
              availableForSelection: true,
            },
            subway: {
              availableForSelection: true,
            },
            tram: {
              availableForSelection: true,
            },
          },
        }}
        isOpen
        mapLayers={{
          stop: { bus: true },
          terminal: { subway: true },
          ticketSales: { ticketMachine: true },
        }}
        updateMapLayers={() => {}}
        currentMapMode="default"
        setMapMode={() => {}}
      />
    </div>
  </ComponentUsageExample>
);

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
) =>
  (config &&
    config.geoJson &&
    Array.isArray(config.geoJson.layers) &&
    config.geoJson.layers) ||
  (store && Array.isArray(store.layers) && store.layers) ||
  defaultValue;

const connectedComponent = connectToStores(
  SelectMapLayersDialog,
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

export default withRouter(connectedComponent);
export { SelectMapLayersDialog as Component };
