import React from 'react';

import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';
import { setRoutingSettings } from '../store/localStorage';

class SaveRoutingSettingsButton extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
  };

  setSettingsData = () => {
    console.log(this.context.location.query);
    // Test if has new set values
    const settings = {
      ignoreRealtimeUpdates: this.context.location.query.ignoreRealtimeUpdates
        ? this.context.location.query.ignoreRealtimeUpdates
        : undefined,
      bikeSpeed: this.context.location.query.bikeSpeed
        ? this.context.location.query.bikeSpeed
        : undefined,
    };
    setRoutingSettings(settings);
    alert('Settings updated');
  };

  render() {
    return (
      <div className="save-settings">
      <hr />
      <button
          className="save-settings-button"
          onClick={this.setSettingsData}
      >
          <FormattedMessage
          defaultMessage="Tallenna asetukset"
          id="settings-savebutton"
          />
      </button>
      </div>
    );
  }
}

export default SaveRoutingSettingsButton;