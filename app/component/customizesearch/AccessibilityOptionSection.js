import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Icon from '../Icon';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const AccessibilityOptionSection = ({ currentSettings }, { executeAction }) => {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.accessibilityOption ? 'Disable' : 'Enable'
      }WheelChair`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      accessibilityOption: !currentSettings.accessibilityOption,
    });
  };

  return (
    <fieldset>
      <legend className="accessibility-header settings-header">
        <FormattedMessage id="accessibility" defaultMessage="Accessibility" />
      </legend>
      <div className="mode-option-container toggle-container accessibility-container">
        {/* eslint jsx-a11y/label-has-associated-control: ["error", { assert: "either" } ] */}
        <label htmlFor="settings-toggle-accessibility" className="toggle-label">
          <Icon
            className="wheelchair-icon"
            img="icon-icon_wheelchair"
            height={2}
            width={2}
          />
          <span className="accessibility-label">
            <FormattedMessage
              id="accessibility-limited"
              defaultMessage="Wheelchair"
            />
          </span>
          <Toggle
            id="settings-toggle-accessibility"
            toggled={!!currentSettings.accessibilityOption}
            title="accessibility"
            onToggle={() => onToggle()}
          />
        </label>
      </div>
    </fieldset>
  );
};

AccessibilityOptionSection.propTypes = {
  currentSettings: PropTypes.object.isRequired,
};

AccessibilityOptionSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default AccessibilityOptionSection;
