import React from 'react';
import Snackbar from 'material-ui/Snackbar';

import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';
import { setCustomizedSettings } from '../store/localStorage';

class SaveCustomizedSettingsButton extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 940,
      message: 'Muutokset tallennettu!',
      open: false,
    };
  }

  setSettingsData = () => {
    // Test if has new set values
    const settings = {
      accessibilityOption: this.context.location.query.accessibilityOption
        ? this.context.location.query.accessibilityOption
        : undefined,
      minTransferTime: this.context.location.query.minTransferTime
        ? this.context.location.query.minTransferTime
        : undefined,
      modes: decodeURI(this.context.location.query.modes) !== 'undefined' &&
        decodeURI(this.context.location.query.modes) !== 'TRAM,RAIL,SUBWAY,FERRY,WALK,BUS'
        ? decodeURI(this.context.location.query.modes).split(',')
        : undefined,
      walkBoardCost: this.context.location.query.walkBoardCost
        ? this.context.location.query.walkBoardCost
        : undefined,
      walkReluctance: this.context.location.query.walkReluctance
        ? this.context.location.query.walkReluctance
        : undefined,
      walkSpeed: this.context.location.query.walkSpeed
        ? this.context.location.query.walkSpeed
        : undefined,
    };

    setCustomizedSettings(settings);
    this.setState({
      open: true,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    return (
      <section className="offcanvas-section">
        <div className="save-settings">
          <hr />
          <button className="save-settings-button" onClick={this.setSettingsData}>
            <FormattedMessage tagName="h4" defaultMessage="Tallenna asetukset" id="save-settings" />
          </button>
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          bodyStyle={{ backgroundColor: '#585a5b', color: '#fff', textAlign: 'center' }}
        />
      </section>
    );
  }
}

export default SaveCustomizedSettingsButton;
