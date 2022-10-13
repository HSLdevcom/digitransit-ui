import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';

const SettingsChangedNotification = props => {
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
        <span className="change-settings">
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <button
            type="button"
            id="change-settings-button"
            onClick={() => {
              props.onButtonClick();
            }}
          >
            <FormattedMessage
              id="settings-change-itinerary-settings"
              defaultMessage="Change settings"
            />{' '}
            ›
          </button>
        </span>
      </div>
    </div>
  );
};

SettingsChangedNotification.propTypes = {
  onButtonClick: PropTypes.func,
};

export default SettingsChangedNotification;
