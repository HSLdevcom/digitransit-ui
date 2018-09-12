import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';

import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { updateMapLayers } from '../action/MapLayerActions';
import MapLayerStore, { mapLayerShape } from '../store/MapLayerStore';

import ComponentUsageExample from './ComponentUsageExample';

class SelectMapLayersDialog extends React.Component {
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

  renderContents = (
    { citybike, parkAndRide, stop, terminal, ticketSales },
    config,
  ) => {
    const isTransportModeEnabled = transportMode =>
      transportMode && transportMode.availableForSelection;
    const transportModes = config.transportModes || {};
    return (
      <React.Fragment>
        <div className="checkbox-grouping">
          {isTransportModeEnabled(transportModes.bus) && (
            <React.Fragment>
              <Checkbox
                checked={stop.bus}
                defaultMessage="Bussipysäkki"
                labelId="none"
                onChange={e =>
                  this.updateStopSetting({ bus: e.target.checked })
                }
              />
              <Checkbox
                checked={terminal.bus}
                defaultMessage="Bussiterminaali"
                labelId="none"
                onChange={e =>
                  this.updateTerminalSetting({ bus: e.target.checked })
                }
              />
            </React.Fragment>
          )}
          {isTransportModeEnabled(transportModes.tram) && (
            <Checkbox
              checked={stop.tram}
              defaultMessage="Raitiovaunupysäkki"
              labelId="none"
              onChange={e => this.updateStopSetting({ tram: e.target.checked })}
            />
          )}
          {isTransportModeEnabled(transportModes.rail) && (
            <Checkbox
              checked={terminal.rail}
              defaultMessage="Juna-asema"
              labelId="none"
              onChange={e =>
                this.updateStopAndTerminalSetting({ rail: e.target.checked })
              }
            />
          )}
          {isTransportModeEnabled(transportModes.subway) && (
            <Checkbox
              checked={terminal.subway}
              defaultMessage="Metroasema"
              labelId="none"
              onChange={e =>
                this.updateStopAndTerminalSetting({ subway: e.target.checked })
              }
            />
          )}
          {isTransportModeEnabled(transportModes.ferry) && (
            <Checkbox
              checked={stop.ferry}
              defaultMessage="Lautta"
              labelId="none"
              onChange={e =>
                this.updateStopSetting({ ferry: e.target.checked })
              }
            />
          )}
          {config.cityBike &&
            config.cityBike.showCityBikes &&
            isTransportModeEnabled(transportModes.citybike) && (
              <Checkbox
                checked={citybike}
                defaultMessage="Kaupunkipyöräasema"
                labelId="none"
                onChange={e =>
                  this.updateSetting({ citybike: e.target.checked })
                }
              />
            )}
          {config.parkAndRide &&
            config.parkAndRide.showParkAndRide && (
              <Checkbox
                checked={parkAndRide}
                defaultMessage="Liityntäpysäköinti"
                labelId="none"
                onChange={e =>
                  this.updateSetting({ parkAndRide: e.target.checked })
                }
              />
            )}
        </div>
        {config.ticketSales &&
          config.ticketSales.showTicketSales && (
            <div className="checkbox-grouping">
              <Checkbox
                checked={ticketSales.ticketMachine}
                defaultMessage="Lippuautomaatti"
                labelId="none"
                onChange={e =>
                  this.updateTicketSalesSetting({
                    ticketMachine: e.target.checked,
                  })
                }
              />
              <Checkbox
                checked={ticketSales.salesPoint}
                defaultMessage="Matkakortin latauspiste"
                labelId="none"
                onChange={e =>
                  this.updateTicketSalesSetting({
                    salesPoint: e.target.checked,
                    servicePoint: e.target.checked,
                  })
                }
              />
            </div>
          )}
      </React.Fragment>
    );
  };

  render() {
    return (
      <BubbleDialog
        contentClassName="select-map-layers-dialog-content"
        header="select-map-layers-header"
        id="mapLayerSelector"
        icon="map-layers"
        isOpen={this.props.isOpen}
        isFullscreenOnMobile
      >
        {this.renderContents(this.props.mapLayers, this.props.config)}
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
});

SelectMapLayersDialog.propTypes = {
  config: mapLayersConfigShape,
  isOpen: PropTypes.bool,
  mapLayers: mapLayerShape.isRequired,
  updateMapLayers: PropTypes.func.isRequired,
};

SelectMapLayersDialog.defaultProps = {
  config: {},
  isOpen: false,
};

SelectMapLayersDialog.description = (
  <ComponentUsageExample>
    <div style={{ height: '550px', position: 'relative' }}>
      <div style={{ bottom: 0, position: 'absolute' }}>
        <SelectMapLayersDialog
          config={{
            cityBike: {
              showCityBikes: true,
            },
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
              citybike: {
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
    </div>
  </ComponentUsageExample>
);

const connectedComponent = connectToStores(
  SelectMapLayersDialog,
  [MapLayerStore],
  context => ({
    config: context.config,
    mapLayers: context.getStore(MapLayerStore).getMapLayers(),
    updateMapLayers: mapLayers =>
      context.executeAction(updateMapLayers, { ...mapLayers }),
  }),
  {
    config: mapLayersConfigShape,
    executeAction: PropTypes.func,
  },
);

export { connectedComponent as default, SelectMapLayersDialog as Component };
