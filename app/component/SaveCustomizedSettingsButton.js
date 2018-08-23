import isEqual from 'lodash/isEqual';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';

import {
  setCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import { getDefaultSettings } from '../util/planParamUtil';
import { getQuerySettings } from '../util/queryUtils';

class SaveCustomizedSettingsButton extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    location: locationShape.isRequired,
    piwik: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 940,
      open: false,
    };
  }

  setSettingsData = () => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'SettingsPanelSaveSettingsButton',
        'SaveSettings',
      );
    }

    const querySettings = getQuerySettings(this.context.location.query);
    const defaultSettings = getDefaultSettings(this.context.config);
    if (isEqual(querySettings, defaultSettings)) {
      resetCustomizedSettings();
    } else {
      setCustomizedSettings(querySettings);
      this.setState({
        open: true,
      });
    }
  };

  getSnackbarDimensions = () => {
    // Since the settings container gets its dimensions dynamically the Snackbar modal
    // has to be calculated by javascript watching the settings container's width
    let containerStyles;
    const containerWidth = document.getElementsByClassName(
      'customize-search',
    )[0]
      ? document.getElementsByClassName('customize-search')[0].parentElement
          .offsetWidth * 0.7428
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
        </section>
        <Snackbar
          open={this.state.open}
          message={
            <FormattedMessage
              tagName="span"
              defaultMessage="Tallenna asetukset"
              id="settings-saved"
            />
          }
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          style={containerStyles}
          bodyStyle={{
            backgroundColor: '#585a5b',
            color: '#fff',
            textAlign: 'center',
            width: containerStyles.width,
            fontSize: '0.8rem',
            fontFamily:
              '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif',
          }}
        />
      </div>
    );
  }
}

export default SaveCustomizedSettingsButton;
