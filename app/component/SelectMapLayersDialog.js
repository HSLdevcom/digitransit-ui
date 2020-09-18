import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';

import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { updateMapLayers } from '../action/MapLayerActions';
import GeoJsonStore from '../store/GeoJsonStore';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';

import ComponentUsageExample from './ComponentUsageExample';
import { addAnalyticsEvent } from '../util/analyticsUtils';

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

  renderContents = (
    {
      citybike,
      parkAndRide,
      stop,
      terminal,
      ticketSales,
      geoJson,
      showAllBusses,
    },
    config,
    lang,
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
      </React.Fragment>
    );
  };

  render() {
    const { config, lang, isOpen, mapLayers } = this.props;
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
        {this.renderContents(mapLayers, config, lang)}
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
};

SelectMapLayersDialog.defaultProps = {
  config: {},
  isOpen: false,
  lang: 'fi',
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
  [GeoJsonStore, MapLayerStore, 'PreferencesStore'],
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
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent as default, SelectMapLayersDialog as Component };
