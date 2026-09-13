import React from 'react';
import { configShape } from '../util/shapes.js';
import CookieSettingsButton from './CookieSettingsButton.jsx';

const MobileFooter = (props, { config }) => {
  return config.useCookiesPrompt ? (
    <div className="mobile-footer">
      <div style={{ margin: '15px' }}>
        <div>{config.copyrightText || ''}</div>
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

MobileFooter.contextTypes = {
  config: configShape.isRequired,
};

export default MobileFooter;
