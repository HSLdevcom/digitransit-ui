import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

export default function ResetCustomizedSettingsButton() {
  return (
    <section className="offcanvas-section">
      <div className="reset-settings">
        <div className="reset-settings-button" onClick="">
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

ResetCustomizedSettingsButton.propTypes = {
  resetSettings: React.PropTypes.func.isRequired,
};

const emptyFunction = () => {};

ResetCustomizedSettingsButton.description = () => (
  <div>
    <p>
      ResetCustomizedSettingsButton
    </p>
    <div className="customize-search">
      <ComponentUsageExample description="empty">
        <ResetCustomizedSettingsButton
          openSearchModal={emptyFunction}
          removeViaPoint={emptyFunction}
          intermediatePlaces={false}
        />
      </ComponentUsageExample>
    </div>
  </div>
);
