import React from 'react';
import { FormattedMessage } from 'react-intl';

const ResetCustomizedSettingsButton = () => (
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

export default ResetCustomizedSettingsButton;
