import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';

const AccessibilityOptions = ({ currentSettings }, { executeAction }) => {
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
    <>
      <div className="section-header">
        <FormattedMessage id="accessibility" />
      </div>
      <SettingsToggle
        id="settings-toggle-accessibility"
        labelId="accessibility-limited"
        labelStyle="mode-label"
        leftElement={<Icon img="icon_wheelchair" height={2} width={2} />}
        toggled={!!currentSettings.accessibilityOption}
        onToggle={onToggle}
      />
    </>
  );
};

AccessibilityOptions.propTypes = {
  currentSettings: settingsShape.isRequired,
};

AccessibilityOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default AccessibilityOptions;
