import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';

import {
  setCustomizedSettings,
  getCustomizedSettings,
} from '../store/localStorage';
import { getCurrentSettings, getDefaultSettings } from '../util/planParamUtil';
import { getQuerySettings } from '../util/queryUtils';
import { getDrawerWidth } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class SaveCustomizedSettingsButton extends React.Component {
  static propTypes = {
    noSettingsFound: PropTypes.func.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    location: locationShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      autoHideDuration: 940,
      open: false,
    };
  }

  setSettingsData = () => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'SettingsPanelSaveSettingsButton',
      name: 'SaveSettings',
    });

    const querySettings = getQuerySettings(this.context.location.query);
    const customizedSettings = getCustomizedSettings();
    const currentSettings = getCurrentSettings(
      this.context.config,
      this.context.location.query,
    );
    const defaultSettings = getDefaultSettings(this.context.config);

    if (
      (isEmpty(querySettings) && isEmpty(customizedSettings)) ||
      isEqual(currentSettings, defaultSettings)
    ) {
      this.props.noSettingsFound();
      this.setState({
        open: true,
      });
    } else {
      setCustomizedSettings(querySettings);
      this.setState({
        open: true,
      });
    }
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const drawerWidth = getDrawerWidth(window);
    return (
      <React.Fragment>
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
        <Snackbar
          aria-hidden
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
          style={{
            width: drawerWidth,
            transform: 'none',
            left: 'auto',
            right: '0px',
          }}
          bodyStyle={{
            backgroundColor: '#585a5b',
            color: '#fff',
            fontSize: '0.8rem',
            fontFamily:
              '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif',
            maxWidth: drawerWidth,
            textAlign: 'center',
            width: '100%',
          }}
        />
      </React.Fragment>
    );
  }
}

export default SaveCustomizedSettingsButton;
