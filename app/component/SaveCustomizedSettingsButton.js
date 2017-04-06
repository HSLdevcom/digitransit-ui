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
      message: 'settings-saved',
      open: false,
    };
  }

  setSettingsData = () => {
    // Test if has new set values
    const settings = {
      accessibilityOption: !(typeof this.context.location.query.accessibilityOption === 'undefined')
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

  getSnackbarDimensions = () => {
    // Since the settings container gets its dimensions dynamically the Snackbar modal
    // has to be calculated by javascript watching the settings container's width
    let containerStyles;
    const containerWidth =
      document.getElementsByClassName('customize-search')[0] ? (document.getElementsByClassName('customize-search')[0].parentElement.offsetWidth) * 0.7428
      : null;
    if (window.innerWidth <= 320) {
      containerStyles = {
        maxWidth: 'auto',
        width: `${window.innerWidth}px`,
      };
    } else if (window.innerWidth <= 768) {
      containerStyles = {
        maxWidth: 'auto',
        left: '55%',
        width: `${containerWidth}px`,
      };
    } else {
      containerStyles = {
        maxWidth: 'auto',
        left: '52%',
        width: `${containerWidth}px`,
      };
    }
    return containerStyles;
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const containerStyles = this.getSnackbarDimensions();
    return (
      <div>
        <section className="offcanvas-section">
          <div className="save-settings">
            <hr />
            <button className="save-settings-button" onClick={this.setSettingsData}>
              <FormattedMessage tagName="h4" defaultMessage="Tallenna asetukset" id="settings-savebutton" />
            </button>
          </div>
        </section>
        <Snackbar
          open={this.state.open}
          message={<FormattedMessage tagName="span" defaultMessage="Tallenna asetukset" id="settings-saved" />}
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          style={containerStyles}
          bodyStyle={{
            backgroundColor: '#585a5b',
            color: '#fff',
            textAlign: 'center',
            width: containerStyles.width,
            fontSize: '0.8rem',
            fontFamily: '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif',
          }}
        />
      </div>
    );
  }
}

export default SaveCustomizedSettingsButton;
