import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

export default function SaveCustomizedSettingsButton() {
  return (
    <section className="offcanvas-section">
      <div className="save-settings">
        <hr />
        <button className="save-settings-button" onClick="">
          <FormattedMessage
                tagName="h4"
                defaultMessage="Tallenna asetukset"
                id="save-settings"
          />
        </button>
      </div>
    </section>
  );
}

SaveCustomizedSettingsButton.propTypes = {
  saveSettings: React.PropTypes.func.isRequired,
};

const emptyFunction = () => {};

SaveCustomizedSettingsButton.description = () => (
  <div>
    <p>
      SaveCustomizedSettingsButton
    </p>
    <div className="customize-search">
      <ComponentUsageExample description="empty">
        <SaveCustomizedSettingsButton
          openSearchModal={emptyFunction}
          removeViaPoint={emptyFunction}
          intermediatePlaces={false}
        />
      </ComponentUsageExample>
    </div>
  </div>
);
