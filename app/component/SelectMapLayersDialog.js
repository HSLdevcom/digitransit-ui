import React from 'react';

import BubbleDialog from './BubbleDialog';
import Checkbox from './Checkbox';
import { setMapLayerSettings } from '../store/localStorage';

class SelectMapLayersDialog extends React.Component {
  constructor(props) {
    super(props);

    const { mapLayers } = props;
    this.state = {
      cityBikes: mapLayers.cityBikes,
      parkAndRide: mapLayers.parkAndRide,
      stops: { ...mapLayers.stops } || {},
      terminals: { ...mapLayers.terminals } || {},
      ticketSales: { ...mapLayers.ticketSales } || {},
    };
  }

  updateSetting = newSetting => {
    const currentSettings = { ...this.state };
    const newSettings = {
      ...currentSettings,
      ...newSetting,
    };
    this.setState(newSettings, () => setMapLayerSettings(newSettings));
  };

  updateStopSetting = newStopSetting => {
    const currentSettings = { ...this.state };
    const newSettings = {
      ...currentSettings,
      stops: {
        ...currentSettings.stops,
        ...newStopSetting,
      },
    };
    this.setState(newSettings, () => setMapLayerSettings(newSettings));
  };

  updateTerminalSetting = newTerminalSetting => {
    const currentSettings = { ...this.state };
    const newSettings = {
      ...currentSettings,
      terminals: {
        ...currentSettings.terminals,
        ...newTerminalSetting,
      },
    };
    this.setState(newSettings, () => setMapLayerSettings(newSettings));
  };

  updateTicketSalesSettings = newTicketSalesSetting => {
    const currentSettings = { ...this.state };
    const newSettings = {
      ...currentSettings,
      ticketSales: {
        ...currentSettings.ticketSales,
        ...newTicketSalesSetting,
      },
    };
    this.setState(newSettings, () => setMapLayerSettings(newSettings));
  };

  render() {
    const { stops, terminals, ticketSales } = this.state;
    return (
      <BubbleDialog
        header="header.select-map-layers"
        id="mapLayerSelector"
        icon="map-layers"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            whiteSpace: 'nowrap',
          }}
        >
          <Checkbox
            checked={stops.bus}
            defaultMessage="Bussipysäkki"
            labelId="none"
            onChange={e => this.updateStopSetting({ bus: e.target.checked })}
          />
          <Checkbox
            checked={terminals.bus}
            defaultMessage="Bussiterminaali"
            labelId="none"
            onChange={e =>
              this.updateTerminalSetting({ bus: e.target.checked })
            }
          />
          <Checkbox
            checked={stops.tram}
            defaultMessage="Raitiovaunupysäkki"
            labelId="none"
            onChange={e => this.updateStopSetting({ tram: e.target.checked })}
          />
          <Checkbox
            checked={terminals.rail}
            defaultMessage="Juna-asema"
            labelId="none"
            onChange={e => {
              this.updateStopSetting({ rail: e.target.checked });
              this.updateTerminalSetting({ rail: e.target.checked });
            }}
          />
          <Checkbox
            checked={terminals.subway}
            defaultMessage="Metroasema"
            labelId="none"
            onChange={e => {
              this.updateStopSetting({ subway: e.target.checked });
              this.updateTerminalSetting({ subway: e.target.checked });
            }}
          />
          <Checkbox
            checked={stops.ferry}
            defaultMessage="Lautta"
            labelId="none"
            onChange={e => this.updateStopSettings({ ferry: e.target.checked })}
          />
          <Checkbox
            checked={this.state.parkAndRide}
            defaultMessage="Liityntäpysäköinti"
            labelId="none"
            onChange={e =>
              this.updateSetting({ parkAndRide: e.target.checked })
            }
          />
          <Checkbox
            checked={this.state.cityBikes}
            defaultMessage="Kaupunkipyöräasema"
            labelId="none"
            onChange={e => this.updateSetting({ cityBikes: e.target.checked })}
          />
          <hr />
          <Checkbox
            checked={ticketSales.ticketMachine}
            defaultMessage="Lippuautomaatti"
            labelId="none"
            onChange={e =>
              this.updateTicketSalesSettings({
                ticketMachine: e.target.checked,
              })
            }
          />
          <Checkbox defaultMessage="Matkakortin latauspiste" labelId="none" />
          <hr />
          <Checkbox defaultMessage="Liikkuvat kulkuvälineet" labelId="none" />
          <Checkbox
            defaultMessage="Kevyen liikenteen (pää)väylät"
            labelId="none"
          />
          <Checkbox defaultMessage="Raitiovaunulinjat" labelId="none" />
        </div>
      </BubbleDialog>
    );
  }
}

export default SelectMapLayersDialog;
