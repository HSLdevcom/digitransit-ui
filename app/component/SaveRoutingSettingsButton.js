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
      maxPreTransitTime: this.context.location.query.maxPreTransitTime
        ? this.context.location.query.maxPreTransitTime
        : undefined,
      walkOnStreetReluctance: this.context.location.query.walkOnStreetReluctance
        ? this.context.location.query.walkOnStreetReluctance
        : undefined,
      waitReluctance: this.context.location.query.waitReluctance
        ? this.context.location.query.waitReluctance
        : undefined,
      bikeSpeed: this.context.location.query.bikeSpeed
        ? this.context.location.query.bikeSpeed
        : undefined,
      bikeSwitchTime: this.context.location.query.bikeSwitchTime
        ? this.context.location.query.bikeSwitchTime
        : undefined,
      bikeSwitchCost: this.context.location.query.bikeSwitchCost
        ? this.context.location.query.bikeSwitchCost
        : undefined,
      bikeBoardCost: this.context.location.query.bikeBoardCost
        ? this.context.location.query.bikeBoardCost
        : undefined,
      carParkCarLegWeight: this.context.location.query.carParkCarLegWeight
        ? this.context.location.query.carParkCarLegWeight
        : undefined,
      maxTransfers: this.context.location.query.maxTransfers
        ? this.context.location.query.maxTransfers
        : undefined,
      waitAtBeginningFactor: this.context.location.query.waitAtBeginningFactor
        ? this.context.location.query.waitAtBeginningFactor
        : undefined,
      heuristicStepsPerMainStep: this.context.location.query.heuristicStepsPerMainStep
        ? this.context.location.query.heuristicStepsPerMainStep
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