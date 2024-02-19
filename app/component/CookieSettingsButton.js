import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="cookie-settings-button"
      onClick={() => window.CookieConsent.renew && window.CookieConsent.renew()}
    >
      <FormattedMessage id="cookie-settings" defaultMessage="Cookie settings" />
    </button>
  );
}
