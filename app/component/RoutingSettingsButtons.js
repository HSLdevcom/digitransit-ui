import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';
import { setRoutingSettings } from '../store/localStorage';

class RoutingSettingsButtons extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
  };

  static propTypes = {
    onReset: PropTypes.func.isRequired,
  };

  setSettingsData = () => {
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
      compactLegsByReversedSearch: this.context.location.query.compactLegsByReversedSearch
        ? this.context.location.query.compactLegsByReversedSearch
        : undefined,
      itineraryFiltering: this.context.location.query.itineraryFiltering
        ? this.context.location.query.itineraryFiltering
        : undefined,
    };
    setRoutingSettings(settings);
    alert('Settings updated');
  };

  resetSettings = () => {
    this.props.onReset();
  };

  render() {
    return (
      <div className="save-settings">
      <hr />
      <button
          onClick={this.setSettingsData}
          style={{
            margin: "0 10px 0 0",
          }}
      >
          <FormattedMessage
          defaultMessage="Tallenna asetukset"
          id="settings-savebutton"
          />
      </button>
      <button onClick={this.resetSettings}>
        <FormattedMessage
            defaultMessage="Palauta oletusasetukset"
            id="settings-reset"
        />
      </button>
      </div>
    );
  }
}

export default RoutingSettingsButtons;