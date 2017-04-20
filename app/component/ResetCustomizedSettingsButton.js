import React from 'react';
import { FormattedMessage } from 'react-intl';

class ResetCustomizedSettingsButton extends React.Component {

  static propTypes = {
    onReset: React.PropTypes.func.isRequired,
  };

  resetSettings = () => {
    this.props.onReset();
  };

  render() {
    return (
      <section className="offcanvas-section">
        <button className="reset-settings" onClick={this.resetSettings}>
          <div className="reset-settings-button">
            <FormattedMessage
              defaultMessage="Palauta oletusasetukset"
              id="settings-reset"
            />
          </div>
        </button>
      </section>
    );
  }
}

export default ResetCustomizedSettingsButton;
