import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Icon from '../Icon';

const AccessibilityOptionSection = ({ currentSettings }, { executeAction }) => (
  <React.Fragment>
    <div className="accessibility-header settings-header">
      <FormattedMessage id="accessibility" defaultMessage="Accessibility" />
    </div>
    <div
      className="mode-option-container toggle-container"
      style={{
        padding: '0 0 0 1em',
        height: '3.5em',
      }}
    >
      <Icon
        className="wheelchair-icon"
        img="icon-icon_wheelchair"
        height={2}
        width={2}
      />
      <FormattedMessage
        id="accessibility-limited"
        defaultMessage="Wheelchair"
      />
      <Toggle
        toggled={!!currentSettings.usingWheelchair}
        title="accessibility"
        onToggle={e => {
          executeAction(saveRoutingSettings, {
            usingWheelchair: e.target.checked ? 1 : 0,
          });
        }}
      />
    </div>
  </React.Fragment>
);

AccessibilityOptionSection.propTypes = {
  currentSettings: PropTypes.object.isRequired,
};

AccessibilityOptionSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default AccessibilityOptionSection;
