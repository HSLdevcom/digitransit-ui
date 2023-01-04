import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

const SettingsChangedNotification = () => {
  return (
    <div className="settings-changed-notification">
      <div className="left-block">
        <Icon img="icon-icon_settings" className="settings-changed-icon" />
      </div>
      <div className="right-block">
        <h3>
          <FormattedMessage
            id="settings-missing-itineraries-header"
            defaultMessage="Missing itineraries?"
          />
        </h3>
        <p>
          <FormattedMessage
            id="settings-missing-itineraries-body"
            defaultMessage="There are options in the settings that exclude some route options."
          />
        </p>
      </div>
    </div>
  );
};

export default SettingsChangedNotification;
