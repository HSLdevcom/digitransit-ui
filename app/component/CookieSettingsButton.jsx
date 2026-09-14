import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function CookieSettingsButton({ isMobile = false }) {
  return (
    <button
      type="button"
      className={`cookie-settings-button${isMobile ? '-mobile' : ''}`}
      onClick={() => window.CookieConsent.renew && window.CookieConsent.renew()}
    >
      <FormattedMessage id="cookie-settings" defaultMessage="Cookie settings" />
    </button>
  );
}

CookieSettingsButton.propTypes = {
  isMobile: PropTypes.bool,
};

CookieSettingsButton.defaultProps = {
  isMobile: false,
};
