import React from 'react';
import { FormattedMessage } from 'react-intl';
import { locationShape } from 'react-router';
import { setCustomizedSettings } from '../store/localStorage';

class SaveCustomizedSettingsButton extends React.Component {
  static contextTypes = {
    location: locationShape.isRequired,
  };

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
  };

  render() {
    return (
      <section className="offcanvas-section">
        <div className="save-settings">
          <hr />
          <button className="save-settings-button" onClick={this.setSettingsData}>
            <FormattedMessage tagName="h4" defaultMessage="Tallenna asetukset" id="save-settings" />
          </button>
        </div>
      </section>
    );
  }
}

export default SaveCustomizedSettingsButton;
