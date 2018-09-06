import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';
import { setRoutingSettings } from '../store/localStorage';

const getValueOrDefault = (value, defaultValue = undefined) =>
  value || defaultValue;

class RoutingSettingsButtons extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
  };

  static propTypes = {
    onReset: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 940,
      open: false,
      message: '',
    };
  }

  setSettingsData = () => {
    const { query } = this.context.location;
    const settings = {
      maxWalkDistance: getValueOrDefault(query.maxWalkDistance),
      maxBikingDistance: getValueOrDefault(query.maxBikingDistance),
      ignoreRealtimeUpdates: getValueOrDefault(query.ignoreRealtimeUpdates),
      maxPreTransitTime: getValueOrDefault(query.maxPreTransitTime),
      walkOnStreetReluctance: getValueOrDefault(query.walkOnStreetReluctance),
      waitReluctance: getValueOrDefault(query.waitReluctance),
      bikeSpeed: getValueOrDefault(query.bikeSpeed),
      bikeSwitchTime: getValueOrDefault(query.bikeSwitchTime),
      bikeSwitchCost: getValueOrDefault(query.bikeSwitchCost),
      bikeBoardCost: getValueOrDefault(query.bikeBoardCost),
      optimize: getValueOrDefault(query.optimize),
      safetyFactor: getValueOrDefault(query.safetyFactor),
      slopeFactor: getValueOrDefault(query.slopeFactor),
      timeFactor: getValueOrDefault(query.timeFactor),
      carParkCarLegWeight: getValueOrDefault(query.carParkCarLegWeight),
      maxTransfers: getValueOrDefault(query.maxTransfers),
      waitAtBeginningFactor: getValueOrDefault(query.waitAtBeginningFactor),
      heuristicStepsPerMainStep: getValueOrDefault(
        query.heuristicStepsPerMainStep,
      ),
      compactLegsByReversedSearch: getValueOrDefault(
        query.compactLegsByReversedSearch,
      ),
      disableRemainingWeightHeuristic: getValueOrDefault(
        query.disableRemainingWeightHeuristic,
      ),
      itineraryFiltering: getValueOrDefault(query.itineraryFiltering),
      busWeight: getValueOrDefault(query.busWeight),
      railWeight: getValueOrDefault(query.railWeight),
      subwayWeight: getValueOrDefault(query.subwayWeight),
      tramWeight: getValueOrDefault(query.tramWeight),
      ferryWeight: getValueOrDefault(query.ferryWeight),
      airplaneWeight: getValueOrDefault(query.airplaneWeight),
    };

    if (
      settings.optimize === 'TRIANGLE' &&
      Number(settings.safetyFactor) +
        Number(settings.slopeFactor) +
        Number(settings.timeFactor) !==
        1.0
    ) {
      alert('Cycling safety, slope, and time factors should equal to 1.0');
    } else {
      setRoutingSettings(settings);
      this.setState({
        open: true,
        message: (
          <FormattedMessage
            tagName="span"
            defaultMessage="Tallenna asetukset"
            id="settings-saved"
          />
        ),
      });
    }
  };

  resetSettings = () => {
    this.props.onReset();
    this.setState({
      open: true,
      message: 'Reseted settings!',
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div className="save-settings">
        <hr />
        <button
          onClick={this.setSettingsData}
          style={{
            margin: '0 10px 0 0',
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
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          bodyStyle={{
            backgroundColor: '#585a5b',
            color: '#fff',
            textAlign: 'center',
            width: 'auto',
            fontSize: '0.8rem',
            fontFamily:
              '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif',
          }}
        />
      </div>
    );
  }
}

export default RoutingSettingsButtons;
