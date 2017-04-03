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
        <div className="reset-settings">
          <div className="reset-settings-button" onClick={this.resetSettings}>
            <FormattedMessage
              tagName="h4"
              defaultMessage="Palauta oletusasetukset"
              id="reset-settings"
            />
          </div>
        </div>
      </section>
    );
  }
}

export default ResetCustomizedSettingsButton;
