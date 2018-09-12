import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';

import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { updateMapLayers } from '../action/MapLayerActions';
import MapLayerStore, { mapLayerConfigShape } from '../store/MapLayerStore';

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

  renderContents = ({ citybike, parkAndRide, stop, terminal, ticketSales }) => (
    <React.Fragment>
      <div className="checkbox-grouping">
        <Checkbox
          checked={stop.bus}
          defaultMessage="Bussipysäkki"
          labelId="none"
          onChange={e => this.updateStopSetting({ bus: e.target.checked })}
        />
        <Checkbox
          checked={terminal.bus}
          defaultMessage="Bussiterminaali"
          labelId="none"
          onChange={e => this.updateTerminalSetting({ bus: e.target.checked })}
        />
        <Checkbox
          checked={stop.tram}
          defaultMessage="Raitiovaunupysäkki"
          labelId="none"
          onChange={e => this.updateStopSetting({ tram: e.target.checked })}
        />
        <Checkbox
          checked={terminal.rail}
          defaultMessage="Juna-asema"
          labelId="none"
          onChange={e =>
            this.updateStopAndTerminalSetting({ rail: e.target.checked })
          }
        />
        <Checkbox
          checked={terminal.subway}
          defaultMessage="Metroasema"
          labelId="none"
          onChange={e =>
            this.updateStopAndTerminalSetting({ subway: e.target.checked })
          }
        />
        <Checkbox
          checked={stop.ferry}
          defaultMessage="Lautta"
          labelId="none"
          onChange={e => this.updateStopSetting({ ferry: e.target.checked })}
        />
        <Checkbox
          checked={citybike}
          defaultMessage="Kaupunkipyöräasema"
          labelId="none"
          onChange={e => this.updateSetting({ citybike: e.target.checked })}
        />
        <Checkbox
          checked={parkAndRide}
          defaultMessage="Liityntäpysäköinti"
          labelId="none"
          onChange={e => this.updateSetting({ parkAndRide: e.target.checked })}
        />
      </div>
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
    </React.Fragment>
  );

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
        {this.renderContents(this.props.mapLayers)}
      </BubbleDialog>
    );
  }
}

SelectMapLayersDialog.propTypes = {
  isOpen: PropTypes.bool,
  mapLayers: mapLayerConfigShape.isRequired,
  updateMapLayers: PropTypes.func.isRequired,
};

SelectMapLayersDialog.defaultProps = {
  isOpen: false,
};

SelectMapLayersDialog.description = (
  <ComponentUsageExample>
    <div style={{ height: '550px', position: 'relative' }}>
      <div style={{ bottom: 0, position: 'absolute' }}>
        <SelectMapLayersDialog
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
    mapLayers: context.getStore(MapLayerStore).getMapLayers(),
    updateMapLayers: mapLayers =>
      context.executeAction(updateMapLayers, { ...mapLayers }),
  }),
  {
    executeAction: PropTypes.func,
  },
);

export { connectedComponent as default, SelectMapLayersDialog as Component };
