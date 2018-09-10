import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';

import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { updateMapLayers } from '../action/MapLayerActions';
import MapLayerStore, { mapLayerConfigShape } from '../store/MapLayerStore';

class SelectMapLayersDialog extends React.Component {
  updateSetting = newSetting => {
    this.context.executeAction(updateMapLayers, {
      ...this.props.mapLayers,
      ...newSetting,
    });
  };

  updateStopSetting = newStopSetting => {
    const stop = {
      ...this.props.mapLayers.stop,
      ...newStopSetting,
    };
    this.updateSetting({ stop });
  };

  updateTerminalSetting = newTerminalSetting => {
    const terminal = {
      ...this.props.mapLayers.terminal,
      ...newTerminalSetting,
    };
    this.updateSetting({ terminal });
  };

  updateTicketSalesSetting = newTicketSalesSetting => {
    const ticketSales = {
      ...this.props.mapLayers.ticketSales,
      ...newTicketSalesSetting,
    };
    this.updateSetting({ ticketSales });
  };

  render() {
    const {
      citybike,
      parkAndRide,
      stop,
      terminal,
      ticketSales,
    } = this.props.mapLayers;
    return (
      <BubbleDialog
        contentClassName="select-map-layers-dialog-content"
        header="select-map-layers-header"
        id="mapLayerSelector"
        icon="map-layers"
      >
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
            onChange={e =>
              this.updateTerminalSetting({ bus: e.target.checked })
            }
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
            onChange={e => {
              this.updateStopSetting({ rail: e.target.checked });
              this.updateTerminalSetting({ rail: e.target.checked });
            }}
          />
          <Checkbox
            checked={terminal.subway}
            defaultMessage="Metroasema"
            labelId="none"
            onChange={e => {
              this.updateStopSetting({ subway: e.target.checked });
              this.updateTerminalSetting({ subway: e.target.checked });
            }}
          />
          <Checkbox
            checked={stop.ferry}
            defaultMessage="Lautta"
            labelId="none"
            onChange={e => this.updateStopSetting({ ferry: e.target.checked })}
          />
          <Checkbox
            checked={parkAndRide}
            defaultMessage="Liityntäpysäköinti"
            labelId="none"
            onChange={e =>
              this.updateSetting({ parkAndRide: e.target.checked })
            }
          />
          <Checkbox
            checked={citybike}
            defaultMessage="Kaupunkipyöräasema"
            labelId="none"
            onChange={e => this.updateSetting({ citybike: e.target.checked })}
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
        <div className="checkbox-grouping">
          <Checkbox
            defaultMessage="Liikkuvat kulkuvälineet"
            disabled
            labelId="none"
            title="Ei vielä toteutettu"
          />
          <Checkbox
            defaultMessage="Kevyen liikenteen (pää)väylät"
            disabled
            labelId="none"
            title="Ei vielä toteutettu"
          />
          <Checkbox
            defaultMessage="Raitiovaunulinjat"
            disabled
            labelId="none"
            title="Ei vielä toteutettu"
          />
        </div>
      </BubbleDialog>
    );
  }
}

SelectMapLayersDialog.propTypes = {
  mapLayers: mapLayerConfigShape.isRequired,
};

SelectMapLayersDialog.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default connectToStores(
  SelectMapLayersDialog,
  [MapLayerStore.storeName],
  context => ({
    mapLayers: context.getStore(MapLayerStore.storeName).getMapLayers(),
  }),
);
