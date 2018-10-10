import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import Snackbar from 'material-ui/Snackbar';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';

import { getCustomizedSettings } from '../store/localStorage';
import { getDefaultSettings } from '../util/planParamUtil';
import { getQuerySettings } from '../util/queryUtils';
import { getDrawerWidth } from '../util/browser';
import SecondaryButton from './SecondaryButton';

class LoadCustomizedSettingsButton extends React.Component {
  static propTypes = {
    noSettingsFound: PropTypes.func.isRequired,
  };

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

  loadSettingsData = () => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'SettingsPanelloadSettingsButton',
        'loadSettings',
      );
    }

    // const querySettings = getQuerySettings(this.context.location.query);
    const defaultSettings = getDefaultSettings(this.context.config);
    const getSettings = getCustomizedSettings();
    console.log(getSettings);
    if (isEmpty(getSettings) || isEqual(getSettings, defaultSettings)) {
      this.props.noSettingsFound();
    } else {
      // getCustomizedSettings(querySettings);
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
        <div className="load-settings">
          <SecondaryButton
            ariaLabel="settings-loadbutton"
            buttonName="settings-loadbutton"
            buttonClickAction={() => this.loadSettingsData()}
          />
        </div>
        <Snackbar
          open={this.state.open}
          message={
            <FormattedMessage
              tagName="span"
              defaultMessage="Settings loaded"
              id="settings-loaded"
            />
          }
          autoHideDuration={this.state.autoHideDuration}
          onRequestClose={this.handleRequestClose}
          style={{ width: drawerWidth }}
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

export default LoadCustomizedSettingsButton;
