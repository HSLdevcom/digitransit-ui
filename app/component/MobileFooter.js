import React from 'react';
import { FormattedMessage } from 'react-intl';
import { configShape } from '../util/shapes';

const MobileFooter = (props, { config }) => {
  return config.useCookiesPrompt ? (
    <div className="mobile-footer">
      <div style={{ margin: '15px' }}>
        <div>{config.copyrightText || ''}</div>
        <div>
          <button
            type="button"
            onClick={() =>
              window.CookieConsent.renew && window.CookieConsent.renew()
            }
          >
            <FormattedMessage id="cookie-settings" default="Cookie settings" />
          </button>
        </div>
      </div>
      <div className="mobile-footer-bar-container">
        <div className="mobile-footer-bar" />
      </div>
    </div>
  ) : null;
};

MobileFooter.contextTypes = {
  config: configShape.isRequired,
};

export default MobileFooter;
