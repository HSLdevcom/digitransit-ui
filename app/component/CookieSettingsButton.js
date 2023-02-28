import React from 'react';
import { FormattedMessage } from 'react-intl';

const CookieSettingsButton = () => {
  return (
    <button
      type="button"
      style={{
        position: 'absolute',
        bottom: '25px',
        left: '15px',
        background: '#fff',
        borderRadius: '50px',
        zIndex: 5000,

        fontWeight: 400,
        display: 'flex',
        fontSize: '0.87rem',
        color: '#666',
        padding: '0 10px',
      }}
      onClick={() => window.CookieConsent.renew && window.CookieConsent.renew()}
    >
      <FormattedMessage id="cookie-settings" defaultMessage="Cookie settings" />
    </button>
  );
};

export default CookieSettingsButton;
