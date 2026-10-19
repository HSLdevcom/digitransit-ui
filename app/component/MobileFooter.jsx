import React from 'react';
import CookieSettingsButton from './CookieSettingsButton';
import { useConfigContext } from '../client/ConfigContext';

const MobileFooter = () => {
  const { useCookiesPrompt, copyrightText } = useConfigContext();
  return useCookiesPrompt ? (
    <div className="mobile-footer">
      <div style={{ margin: '15px' }}>
        <div>{copyrightText || ''}</div>
        <div>
          <CookieSettingsButton isMobile />
        </div>
      </div>
      <div className="mobile-footer-bar-container">
        <div className="mobile-footer-bar" />
      </div>
    </div>
  ) : null;
};

export default MobileFooter;
