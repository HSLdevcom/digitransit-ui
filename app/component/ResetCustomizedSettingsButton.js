import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

class ResetCustomizedSettingsButton extends React.Component {
  static propTypes = {
    onReset: PropTypes.func.isRequired,
  };

  resetSettings = () => {
    this.props.onReset();
  };

  render() {
    return (
      <button className="reset-settings" onClick={this.resetSettings}>
        <div className="reset-settings-button">
          <FormattedMessage
            defaultMessage="Palauta oletusasetukset"
            id="settings-reset"
          />
        </div>
      </button>
    );
  }
}

export default ResetCustomizedSettingsButton;
